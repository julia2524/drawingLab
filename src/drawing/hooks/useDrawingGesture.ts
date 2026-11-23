import { useCallback, useMemo, useRef, useState } from "react";
import { PanResponder } from "react-native";

import type {
  DrawingPoint,
  DrawingStrokeData,
  DrawingGestureOptions,
} from "../types/drawing.types";

export const useDrawingGesture = (options: DrawingGestureOptions = {}) => {
  // 완성된 선들
  const [strokes, setStrokes] = useState<DrawingStrokeData[]>([]);

  // 현재 그리고 있는 선
  const [currentStroke, setCurrentStroke] = useState<DrawingStrokeData>([]);

  const [isDrawing, setIsDrawing] = useState(false);

  // 렌더링과 별개로 최신 좌표를 보관
  const currentStrokeRef = useRef<DrawingStrokeData>([]);

  // 콜백이 변경되어도 PanResponder를 다시 만들지 않도록 보관
  const onStrokeCompleteRef = useRef(options.onStrokeComplete);

  onStrokeCompleteRef.current = options.onStrokeComplete;

  const onTouchPointRef = useRef(options.onTouchPoint);

  onTouchPointRef.current = options.onTouchPoint;

  // 좌표 유효성 검사
  const createPoint = useCallback(
    (x: number, y: number): DrawingPoint | null => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return null;
      }

      return { x, y };
    },
    [],
  );

  // 그리기 시작
  const handleGrant = useCallback(
    (x: number, y: number) => {
      const point = createPoint(x, y);

      if (!point) return;

      const initialStroke = [point];

      currentStrokeRef.current = initialStroke;

      setCurrentStroke(initialStroke);
      setIsDrawing(true);

      onTouchPointRef.current?.(point);
    },
    [createPoint],
  );

  // 손가락 이동
  const handleMove = useCallback(
    (x: number, y: number) => {
      const point = createPoint(x, y);

      if (!point || !currentStrokeRef.current.length) {
        return;
      }

      const nextStroke = [...currentStrokeRef.current, point];

      currentStrokeRef.current = nextStroke;
      setCurrentStroke(nextStroke);

      onTouchPointRef.current?.(point);
    },
    [createPoint],
  );

  // 그리기 종료
  const handleRelease = useCallback(() => {
    const completedStroke = currentStrokeRef.current;

    if (completedStroke.length > 0) {
      setStrokes((previous) => [...previous, completedStroke]);

      onStrokeCompleteRef.current?.(completedStroke);
    }

    currentStrokeRef.current = [];

    setCurrentStroke([]);
    setIsDrawing(false);
  }, []);

  // 터치 이벤트 연결
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,

        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;

          handleGrant(locationX, locationY);
        },

        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;

          handleMove(locationX, locationY);
        },

        onPanResponderRelease: () => {
          handleRelease();
        },

        onPanResponderTerminate: () => {
          handleRelease();
        },

        onPanResponderTerminationRequest: () => false,

        onShouldBlockNativeResponder: () => true,
      }),
    [handleGrant, handleMove, handleRelease],
  );

  // 전체 선 초기화
  const clearStrokes = useCallback(() => {
    currentStrokeRef.current = [];

    setStrokes([]);
    setCurrentStroke([]);
    setIsDrawing(false);
  }, []);

  return {
    panResponder,
    strokes,
    currentStroke,
    isDrawing,
    clearStrokes,
  };
};
