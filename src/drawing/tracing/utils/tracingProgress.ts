import type { DrawingPoint } from "../../types/drawing.types";

import type { TracingGuide, TracingProgress } from "../types/tracing.types";

import { getDistanceToSegment, getGuideLength } from "./tracingGeometry";

/**
 * 기본 판정 설정
 */
const DEFAULT_TOLERANCE = 36;
const DEFAULT_COMPLETION_THRESHOLD = 0.85;

/**
 * 가이드 경로를 구성하는 선분 정보
 */
interface GuideSegment {
  start: DrawingPoint;
  end: DrawingPoint;
  length: number;
  startDistance: number;
  endDistance: number;
}

/**
 * 내부 진행 상태
 */
export interface TracingProgressState {
  progress: TracingProgress;
  completedSegments: boolean[];
}

/**
 * 가이드 경로를 선분 단위로 분리한다.
 *
 * startDistance와 endDistance는
 * 전체 경로에서 해당 선분이 차지하는 거리다.
 */
const createGuideSegments = (points: DrawingPoint[]): GuideSegment[] => {
  const segments: GuideSegment[] = [];

  let accumulatedDistance = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];

    const length = Math.hypot(end.x - start.x, end.y - start.y);

    segments.push({
      start,
      end,
      length,
      startDistance: accumulatedDistance,
      endDistance: accumulatedDistance + length,
    });

    accumulatedDistance += length;
  }

  return segments;
};

/**
 * 초기 진행 상태 생성
 */
export const createInitialTracingProgress = (
  guide: TracingGuide,
): TracingProgressState => {
  const segments = createGuideSegments(guide.points);

  const totalPoints = segments.length;

  return {
    progress: {
      progress: 0,
      completedPoints: 0,
      totalPoints,
      isCompleted: false,
    },
    completedSegments: Array(totalPoints).fill(false),
  };
};

/**
 * 한 번의 그리기에서 통과한 가이드 구간을 찾는다.
 *
 * 손가락 이동 중 발생한 각 선분과 가이드 선분 사이의
 * 최단 거리를 이용해 통과 여부를 판단한다.
 */
const findTouchedSegments = (
  stroke: DrawingPoint[],
  guideSegments: GuideSegment[],
  tolerance: number,
): boolean[] => {
  const touched = Array(guideSegments.length).fill(false);

  if (stroke.length === 0) {
    return touched;
  }

  for (let i = 0; i < guideSegments.length; i++) {
    const guideSegment = guideSegments[i];

    // 한 점만 찍은 경우
    if (stroke.length === 1) {
      const distance = getDistanceToSegment(
        stroke[0],
        guideSegment.start,
        guideSegment.end,
      );

      touched[i] = distance <= tolerance;
      continue;
    }

    // 손가락이 이동한 모든 선분 확인
    for (let j = 0; j < stroke.length - 1; j++) {
      const strokeStart = stroke[j];
      const strokeEnd = stroke[j + 1];

      /**
       * 가이드 선분 위에 있는 두 끝점에 대한 거리만으로
       * 선분과 선분 사이의 거리를 정확하게 구할 수는 없다.
       *
       * 따라서 손가락 이동 구간을 일정 간격으로 샘플링한다.
       */
      const strokeLength = Math.hypot(
        strokeEnd.x - strokeStart.x,
        strokeEnd.y - strokeStart.y,
      );

      const sampleCount = Math.max(
        1,
        Math.ceil(strokeLength / Math.max(tolerance / 2, 1)),
      );

      for (let k = 0; k <= sampleCount; k++) {
        const t = k / sampleCount;

        const samplePoint: DrawingPoint = {
          x: strokeStart.x + (strokeEnd.x - strokeStart.x) * t,
          y: strokeStart.y + (strokeEnd.y - strokeStart.y) * t,
        };

        const distance = getDistanceToSegment(
          samplePoint,
          guideSegment.start,
          guideSegment.end,
        );

        if (distance <= tolerance) {
          touched[i] = true;
          break;
        }
      }

      if (touched[i]) {
        break;
      }
    }
  }

  return touched;
};

/**
 * 새로운 그리기 데이터를 기존 진행 상태에 반영한다.
 *
 * 이미 통과한 구간은 다시 미통과로 바뀌지 않는다.
 */
export const updateTracingProgress = (
  guide: TracingGuide,
  previousState: TracingProgressState,
  stroke: DrawingPoint[],
): TracingProgressState => {
  const segments = createGuideSegments(guide.points);

  if (segments.length === 0) {
    return createInitialTracingProgress(guide);
  }

  const tolerance = guide.tolerance ?? DEFAULT_TOLERANCE;

  const completionThreshold =
    guide.completionThreshold ?? DEFAULT_COMPLETION_THRESHOLD;

  const touchedSegments = findTouchedSegments(stroke, segments, tolerance);

  const completedSegments = previousState.completedSegments.map(
    (completed, index) => completed || touchedSegments[index],
  );

  const completedPoints = completedSegments.filter(Boolean).length;

  const totalLength = getGuideLength(guide.points);

  const completedLength = segments.reduce((total, segment, index) => {
    return completedSegments[index] ? total + segment.length : total;
  }, 0);

  const progress =
    totalLength > 0
      ? completedLength / totalLength
      : completedPoints / segments.length;

  const isCompleted = progress >= completionThreshold;

  return {
    progress: {
      progress: Math.min(1, progress),
      completedPoints,
      totalPoints: segments.length,
      isCompleted,
    },
    completedSegments,
  };
};
