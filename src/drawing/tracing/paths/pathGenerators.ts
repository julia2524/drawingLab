import type { DrawingPoint } from "../../types/drawing.types";
import type {
  TracingBoardSize,
  TracingLineType,
  TracingLineVariant,
} from "../types/tracing.types";

import { resamplePath } from "../utils/tracingPathUtils";
import { getCurveTolerance } from "./tolerance";

/**
 * 유형별 경로 생성기
 *
 * - 모두 보드 크기(width, height)에서 비율로 좌표를 계산한다.
 *   → 화면 크기가 달라져도 모양이 유지된다.
 * - 항상 "기본 방향"(forward)의 점 배열을 돌려준다.
 *   (loop / spiral의 반대 방향은 createTracingPath에서 뒤집는다)
 */

type Generator = (
  size: TracingBoardSize,
  variant: TracingLineVariant,
) => DrawingPoint[];

const TWO_PI = Math.PI * 2;

// ─────────────────────────────── 공통 도구

const straight = (
  from: DrawingPoint,
  to: DrawingPoint,
  segmentCount = 60,
): DrawingPoint[] =>
  Array.from({ length: segmentCount + 1 }, (_, index) => {
    const t = index / segmentCount;

    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    };
  });

/** 촘촘한 점들을 경로 길이 기준으로 균일하게 다시 뽑는다. */
export const finalizeCurve = (dense: DrawingPoint[]): DrawingPoint[] => {
  let length = 0;

  for (let i = 0; i < dense.length - 1; i++) {
    length += Math.hypot(
      dense[i + 1].x - dense[i].x,
      dense[i + 1].y - dense[i].y,
    );
  }

  // 구간이 너무 많아지지 않도록 (최대 약 240개)
  const spacing = Math.max(5, length / 240);

  return resamplePath(dense, spacing);
};

/** 중심선이 부드러운 곡선(Catmull-Rom, centripetal)으로 통과하는 점들 */
const smoothThrough = (
  controls: DrawingPoint[],
  stepsPerSegment = 24,
): DrawingPoint[] => {
  const n = controls.length;

  const first = controls[0];
  const second = controls[1];
  const last = controls[n - 1];
  const beforeLast = controls[n - 2];

  const padded: DrawingPoint[] = [
    { x: 2 * first.x - second.x, y: 2 * first.y - second.y },
    ...controls,
    { x: 2 * last.x - beforeLast.x, y: 2 * last.y - beforeLast.y },
  ];

  const mix = (
    a: DrawingPoint,
    b: DrawingPoint,
    wa: number,
    wb: number,
  ): DrawingPoint => ({
    x: a.x * wa + b.x * wb,
    y: a.y * wa + b.y * wb,
  });

  const dist = (a: DrawingPoint, b: DrawingPoint) =>
    Math.max(Math.hypot(a.x - b.x, a.y - b.y), 0.0001);

  const result: DrawingPoint[] = [{ ...controls[0] }];

  for (let i = 1; i < padded.length - 2; i++) {
    const p0 = padded[i - 1];
    const p1 = padded[i];
    const p2 = padded[i + 1];
    const p3 = padded[i + 2];

    const t0 = 0;
    const t1 = t0 + Math.sqrt(dist(p0, p1));
    const t2 = t1 + Math.sqrt(dist(p1, p2));
    const t3 = t2 + Math.sqrt(dist(p2, p3));

    for (let s = 1; s <= stepsPerSegment; s++) {
      const t = t1 + ((t2 - t1) * s) / stepsPerSegment;

      const a1 = mix(p0, p1, (t1 - t) / (t1 - t0), (t - t0) / (t1 - t0));
      const a2 = mix(p1, p2, (t2 - t) / (t2 - t1), (t - t1) / (t2 - t1));
      const a3 = mix(p2, p3, (t3 - t) / (t3 - t2), (t - t2) / (t3 - t2));

      const b1 = mix(a1, a2, (t2 - t) / (t2 - t0), (t - t0) / (t2 - t0));
      const b2 = mix(a2, a3, (t3 - t) / (t3 - t1), (t - t1) / (t3 - t1));

      result.push(mix(b1, b2, (t2 - t) / (t2 - t1), (t - t1) / (t2 - t1)));
    }
  }

  return result;
};

// ─────────────────────────────── A. 기본 직선

// 01 가로선 (기존 구현과 동일한 좌표/분할)
const horizontal: Generator = ({ width, height }) =>
  straight(
    { x: width * 0.16, y: height * 0.52 },
    { x: width * 0.84, y: height * 0.52 },
  );

// 02 세로선: 위 → 아래
const vertical: Generator = ({ width, height }) =>
  straight(
    { x: width * 0.5, y: height * 0.16 },
    { x: width * 0.5, y: height * 0.84 },
  );

// 03 올라가는 사선: 왼쪽 아래 → 오른쪽 위
const ascending: Generator = ({ width, height }) =>
  straight(
    { x: width * 0.16, y: height * 0.78 },
    { x: width * 0.84, y: height * 0.26 },
  );

// 04 내려가는 사선: 왼쪽 위 → 오른쪽 아래
const descending: Generator = ({ width, height }) =>
  straight(
    { x: width * 0.16, y: height * 0.26 },
    { x: width * 0.84, y: height * 0.78 },
  );

// ─────────────────────────────── B. 기본 곡선

// 05 세로 곡선: 위 → 아래로 가며 한 번 부드럽게 좌우로 휜다
const verticalCurve: Generator = ({ width, height }, variant) => {
  const sign = variant === 0 ? 1 : -1;
  const amplitude = width * 0.22;
  const y0 = height * 0.16;
  const y1 = height * 0.84;
  const steps = 160;

  return finalizeCurve(
    Array.from({ length: steps + 1 }, (_, index) => {
      const t = index / steps;

      return {
        x: width * 0.5 + sign * amplitude * Math.sin(Math.PI * t),
        y: y0 + (y1 - y0) * t,
      };
    }),
  );
};

// 06 가로 곡선: 왼쪽 → 오른쪽으로 가며 한 번 부드럽게 위아래로 휜다
const horizontalCurve: Generator = ({ width, height }, variant) => {
  // variant 0 = 위쪽으로 볼록 (가운데가 위로 올라감)
  const sign = variant === 0 ? -1 : 1;
  const amplitude = height * 0.18;
  const x0 = width * 0.16;
  const x1 = width * 0.84;
  const steps = 160;

  return finalizeCurve(
    Array.from({ length: steps + 1 }, (_, index) => {
      const t = index / steps;

      return {
        x: x0 + (x1 - x0) * t,
        y: height * 0.52 + sign * amplitude * Math.sin(Math.PI * t),
      };
    }),
  );
};

// ─────────────────────────────── C. 반복적인 방향 전환

// 07 구불구불선: 굴곡의 크기와 간격이 제각각인 부드러운 곡선 (모서리 없음)
const MEANDER_U = [0, 0.16, 0.38, 0.52, 0.76, 0.88, 1];
const MEANDER_V = [0, -0.8, 0.55, -0.45, 0.85, -0.5, 0.1];

const meandering: Generator = ({ width, height }, variant) => {
  const isVertical = variant === 1;

  // 그림 영역이 낮아도 굴곡이 허용 거리보다 충분히 크도록 보정
  const amplitude = Math.min(
    Math.max(height * 0.13, getCurveTolerance(width) * 3),
    height * 0.2,
  );

  const controls = MEANDER_U.map((u, index) => {
    const v = MEANDER_V[index];

    return isVertical
      ? {
          x: width * 0.5 + v * width * 0.2,
          y: height * 0.14 + u * height * 0.72,
        }
      : {
          x: width * 0.16 + u * width * 0.68,
          y: height * 0.52 + v * amplitude,
        };
  });

  return finalizeCurve(smoothThrough(controls));
};

// 08 물결선: 크기와 간격이 일정한 사인 파형
const wave: Generator = ({ width, height }) => {
  const cycles = 3;
  // 그림 영역이 낮아도 파도 높이가 허용 거리보다 충분히 크도록 보정
  const amplitude = Math.min(
    Math.max(height * 0.1, getCurveTolerance(width) * 2.8),
    height * 0.2,
  );
  const x0 = width * 0.16;
  const x1 = width * 0.84;
  const steps = 300;

  return finalizeCurve(
    Array.from({ length: steps + 1 }, (_, index) => {
      const t = index / steps;

      return {
        x: x0 + (x1 - x0) * t,
        y: height * 0.52 - amplitude * Math.sin(TWO_PI * cycles * t),
      };
    }),
  );
};

// 09 깡충선: 바닥 구간 사이에 독립된 둥근 언덕(반타원)이 반복
const bounce: Generator = ({ width, height }) => {
  const hills = 3;
  const x0 = width * 0.16;
  const x1 = width * 0.84;
  const baseY = height * 0.62;
  const hillHeight = Math.min(height * 0.2, (x1 - x0) / hills / 1.2);

  const slot = (x1 - x0) / hills;
  const gap = slot * 0.2; // 언덕 사이의 낮은 구간
  const hillWidth = slot - gap;

  const dense: DrawingPoint[] = [{ x: x0, y: baseY }];

  for (let k = 0; k < hills; k++) {
    // 각 언덕을 자기 슬롯의 가운데에 두고, 앞뒤에 낮은 구간(gap/2)을 남긴다
    const left = x0 + k * slot + gap / 2;
    const right = left + hillWidth;
    const cx = (left + right) / 2;
    const rx = (right - left) / 2;
    const arcSteps = 60;

    // 낮은 구간에서 언덕 시작점까지
    dense.push({ x: left, y: baseY });

    // θ: π → 0 (왼쪽 끝 → 정상 → 오른쪽 끝)
    for (let s = 1; s <= arcSteps; s++) {
      const theta = Math.PI * (1 - s / arcSteps);

      dense.push({
        x: cx + rx * Math.cos(theta),
        y: baseY - hillHeight * Math.sin(theta),
      });
    }
  }

  dense.push({ x: x1, y: baseY });

  return finalizeCurve(dense);
};

// 10 뾰족선: 직선 구간과 날카로운 꼭짓점의 지그재그
const zigzag: Generator = ({ width, height }) => {
  const legs = 6;
  const x0 = width * 0.16;
  const x1 = width * 0.84;
  const lowY = height * 0.62;
  const highY = height * 0.42;

  const vertices = Array.from({ length: legs + 1 }, (_, index) => ({
    x: x0 + ((x1 - x0) * index) / legs,
    y: index % 2 === 0 ? lowY : highY,
  }));

  // 꼭짓점을 둥글게 만들지 않도록 직선으로만 이어서 재샘플링
  return finalizeCurve(vertices);
};

// ─────────────────────────────── D. 회전 및 나선

// 11 뱅글 꼬불선: 위 → 아래로 이동하며 같은 크기의 고리가 반복 (prolate trochoid)
const loop: Generator = ({ width, height }) => {
  const travel = height * 0.62;

  // 이웃한 고리가 허용 거리 안으로 붙지 않도록, 영역이 작으면 고리 수를 줄인다 (2~3개)
  const loops = Math.max(
    2,
    Math.min(3, Math.floor(travel / (getCurveTolerance(width) * 5))),
  );

  const a = travel / (TWO_PI * loops);
  const b = Math.min(a * 2.4, width * 0.2);

  const top = height * 0.19;
  const steps = loops * 90;

  return finalizeCurve(
    Array.from({ length: steps + 1 }, (_, index) => {
      const theta = (TWO_PI * loops * index) / steps;

      return {
        x: width * 0.5 + b * Math.sin(theta),
        // 이동량(aθ)에 되돌아가는 성분(-b cosθ)을 더해 고리를 만든다.
        // +b는 θ=0에서 y가 top이 되도록 맞추는 보정
        y: top + a * theta + b - b * Math.cos(theta),
      };
    }),
  );
};

// 12 달팽이 뱅글선: 중심을 기준으로 반지름이 일정하게 줄어드는 나선 (바깥 → 안쪽, 시계 방향)
const spiral: Generator = ({ width, height }) => {
  const turns = 2.5;
  const outer = Math.min(width, height) * 0.4;
  const inner = outer * 0.1;
  const cx = width * 0.5;
  const cy = height * 0.5;
  const steps = Math.ceil(turns * 120);

  return finalizeCurve(
    Array.from({ length: steps + 1 }, (_, index) => {
      const t = index / steps;
      const angle = Math.PI + TWO_PI * turns * t; // 왼쪽에서 시작, 화면 기준 시계 방향
      const radius = outer - (outer - inner) * t;

      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    }),
  );
};

export const PATH_GENERATORS: Record<TracingLineType, Generator> = {
  horizontal,
  vertical,
  ascending,
  descending,
  vertical_curve: verticalCurve,
  horizontal_curve: horizontalCurve,
  meandering,
  wave,
  bounce,
  zigzag,
  loop,
  spiral,
};
