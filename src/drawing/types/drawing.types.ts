
export interface DrawingPoint {
  x: number;
  y: number;
}

export type DrawingStrokeData = DrawingPoint[];

export interface DrawingGestureOptions {
  onStrokeComplete?: (stroke: DrawingStrokeData) => void;
}
