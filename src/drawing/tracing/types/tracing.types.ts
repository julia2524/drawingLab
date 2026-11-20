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
 * Tracing Engine 설정
 */
export interface TracingOptions {
  tolerance?: number;
  completionThreshold?: number;
}
