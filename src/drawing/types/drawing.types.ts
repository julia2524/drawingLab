export interface DrawingPoint {
  x: number;
  y: number;
}

export type DrawingStrokeData = DrawingPoint[];

export interface DrawingGestureOptions {
  onStrokeComplete?: (stroke: DrawingStrokeData) => void;

  /**
   * 손가락이 닿거나 움직일 때마다 유효한 좌표를 전달한다.
   * 시각 효과(파티클 등) 전용이며 그리기/판정 로직에는 관여하지 않는다.
   */
  onTouchPoint?: (point: DrawingPoint) => void;
}
