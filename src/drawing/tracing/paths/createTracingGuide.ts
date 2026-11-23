import type {
  TracingBoardSize,
  TracingGuide,
  TracingLineType,
  TracingLineVariant,
  TracingPathConfig,
} from "../types/tracing.types";

import { PATH_GENERATORS } from "./pathGenerators";
import { getLineInfo } from "./lineCatalog";
import { getBaseTolerance } from "./tolerance";

/**
 * 반대 방향(reverse)으로 만드는 변형
 * loop 1: 아래 → 위 / spiral 1: 안쪽 → 바깥쪽
 */
const REVERSED_VARIANT_TYPES: TracingLineType[] = ["loop", "spiral"];

/**
 * 선 유형 + 변형 + 보드 크기로 경로를 만든다.
 * 렌더링(가이드 선)과 터치 판정이 이 path 하나를 같이 사용한다.
 */
export const createTracingPath = (
  type: TracingLineType,
  variant: TracingLineVariant,
  size: TracingBoardSize,
): TracingPathConfig => {
  const generated = PATH_GENERATORS[type](size, variant);

  const isReversed = variant === 1 && REVERSED_VARIANT_TYPES.includes(type);

  const path = isReversed ? [...generated].reverse() : generated;

  return {
    type,
    variant,
    start: path[0],
    end: path[path.length - 1],
    path,
    direction: isReversed ? "reverse" : "forward",
  };
};

/**
 * 경로를 기존 Tracing Engine이 쓰는 TracingGuide로 변환한다.
 */
export const createTracingGuide = (
  type: TracingLineType,
  variant: TracingLineVariant,
  size: TracingBoardSize,
): TracingGuide => {
  const config = createTracingPath(type, variant, size);
  const info = getLineInfo(type);

  // 가로선의 기존 허용 거리(보드 너비의 4%, 최대 14px)를 기준으로 삼는다.
  const baseTolerance = getBaseTolerance(size.width);

  return {
    id: `${type}-${variant}`,
    points: config.path,
    tolerance: baseTolerance * info.toleranceScale,
    completionThreshold: 1,
    ordered: info.ordered,
  };
};
