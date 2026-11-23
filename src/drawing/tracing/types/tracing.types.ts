import type { DrawingPoint } from "../../types/drawing.types";

/**
 * 따라 그리기 가이드
 */
export interface TracingGuide {
  id: string;

  /**
   * 가이드 경로를 구성하는 좌표
   * 이후 곡선도 일정 간격으로 샘플링해서 사용
   */
  points: DrawingPoint[];

  /**
   * 선에서 벗어나도 인정하는 거리
   */
  tolerance?: number;

  /**
   * 완성으로 인정할 진행률
   */
  completionThreshold?: number;

  /**
   * 순서 판정 사용 여부 (기본 false = 기존 동작 그대로)
   *
   * true이면 지금까지 완성한 구간 바로 앞쪽(look-ahead 범위)만 인정한다.
   * 경로가 스스로 교차하거나 고리끼리 가까운 곡선(뱅글/나선 등)에서
   * 엉뚱한 구간이 먼저 채워지는 것을 막고, 출발 방향도 강제한다.
   */
  ordered?: boolean;
}

/**
 * 따라 그리기 진행 상태
 */
export interface TracingProgress {
  /**
   * 현재 진행률 (0 ~ 1)
   */
  progress: number;

  /**
   * 완성된 가이드 구간 수
   */
  completedPoints: number;

  /**
   * 전체 가이드 구간 수
   */
  totalPoints: number;

  /**
   * 완성 여부
   */
  isCompleted: boolean;
}

/**
 * 12가지 선 유형
 */
export type TracingLineType =
  | "horizontal"
  | "vertical"
  | "ascending"
  | "descending"
  | "vertical_curve"
  | "horizontal_curve"
  | "meandering"
  | "wave"
  | "bounce"
  | "zigzag"
  | "loop"
  | "spiral";

/**
 * 유형별 세부 변형 (0 = 기본, 1 = 반대)
 *
 * vertical_curve   0 오른쪽 볼록 / 1 왼쪽 볼록
 * horizontal_curve 0 위쪽 볼록   / 1 아래쪽 볼록
 * meandering       0 가로         / 1 세로
 * loop             0 위→아래     / 1 아래→위
 * spiral           0 바깥→안쪽   / 1 안쪽→바깥
 */
export type TracingLineVariant = 0 | 1;

/**
 * 선 유형 하나가 만들어 내는 경로 (렌더링과 판정이 같은 path를 사용)
 */
export interface TracingPathConfig {
  type: TracingLineType;
  variant: TracingLineVariant;
  start: DrawingPoint;
  end: DrawingPoint;
  path: DrawingPoint[];
  direction: "forward" | "reverse";
}

/**
 * 경로를 만들 때 쓰는 보드(캔버스) 크기
 */
export interface TracingBoardSize {
  width: number;
  height: number;
}

/**
 * Tracing Engine 설정
 */
export interface TracingOptions {
  tolerance?: number;
  completionThreshold?: number;
}
