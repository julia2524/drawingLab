import { useCallback, useEffect, useRef, useState } from "react";

import type { DrawingStrokeData } from "../../types/drawing.types";

import type { TracingGuide } from "../types/tracing.types";

import {
  createInitialTracingProgress,
  updateTracingProgress,
} from "../utils/tracingProgress";

import type { TracingProgressState } from "../utils/tracingProgress";

import { useDrawingGesture } from "../../hooks/useDrawingGesture";

/**
 * Tracing Progress Hook 옵션
 */
interface UseTracingProgressOptions {
  onProgressChange?: (progress: number) => void;
  onComplete?: () => void;
}

/**
 * 가이드 경로를 따라 그리는 진행 상황을 관리하는 Hook
 */
export const useTracingProgress = (
  guide: TracingGuide,
  options: UseTracingProgressOptions = {},
) => {
  // 현재 가이드 보관
  const guideRef = useRef(guide);
  guideRef.current = guide;

  // 외부 콜백 보관
  const onProgressChangeRef = useRef(options.onProgressChange);
  const onCompleteRef = useRef(options.onComplete);

  onProgressChangeRef.current = options.onProgressChange;
  onCompleteRef.current = options.onComplete;

  // 초기 진행 상태
  const [progressState, setProgressState] = useState<TracingProgressState>(() =>
    createInitialTracingProgress(guide),
  );

  // 렌더링과 별개로 최신 진행 상태 보관
  const progressStateRef = useRef(progressState);

  // 완성 콜백 중복 실행 방지
  const isCompletedRef = useRef(false);

  /**
   * Stroke가 완성되었을 때 호출
   */
  const handleStrokeComplete = useCallback((stroke: DrawingStrokeData) => {
    const currentGuide = guideRef.current;
    const previousState = progressStateRef.current;

    // 이미 완성했다면 추가 판정하지 않음
    if (previousState.progress.isCompleted) {
      return;
    }

    // 새로운 Stroke를 기존 진행 상태에 반영
    const nextState = updateTracingProgress(
      currentGuide,
      previousState,
      stroke,
    );

    // 최신 상태 갱신
    progressStateRef.current = nextState;
    setProgressState(nextState);

    // 진행률 변경 콜백
    onProgressChangeRef.current?.(nextState.progress.progress);

    // 완성 콜백은 한 번만 실행
    if (nextState.progress.isCompleted && !isCompletedRef.current) {
      isCompletedRef.current = true;
      onCompleteRef.current?.();
    }
  }, []);

  /**
   * Drawing Engine 연결
   */
  const { panResponder, strokes, currentStroke, isDrawing, clearStrokes } =
    useDrawingGesture({
      onStrokeComplete: handleStrokeComplete,
    });

  /**
   * 가이드가 변경되면 진행 상황 초기화
   */
  useEffect(() => {
    const initialState = createInitialTracingProgress(guideRef.current);

    progressStateRef.current = initialState;
    setProgressState(initialState);

    isCompletedRef.current = false;

    clearStrokes();
  }, [
    guide.id,
    guide.points,
    guide.tolerance,
    guide.completionThreshold,
    clearStrokes,
  ]);

  /**
   * 현재 그리기 진행 상황 초기화
   */
  const resetTracing = useCallback(() => {
    const initialState = createInitialTracingProgress(guideRef.current);

    progressStateRef.current = initialState;
    setProgressState(initialState);

    isCompletedRef.current = false;

    clearStrokes();
  }, [clearStrokes]);

  return {
    // Drawing Engine
    panResponder,
    strokes,
    currentStroke,
    isDrawing,

    // Tracing Engine
    progress: progressState.progress.progress,
    completedPoints: progressState.progress.completedPoints,
    totalPoints: progressState.progress.totalPoints,
    isCompleted: progressState.progress.isCompleted,

    // 진행 상태
    completedSegments: progressState.completedSegments,

    // 초기화
    resetTracing,
  };
};
