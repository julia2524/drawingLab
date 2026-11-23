import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { View, Text, StyleSheet, Pressable } from "react-native";
import type { LayoutChangeEvent } from "react-native";

import type { ViewStyle, StyleProp } from "react-native";

import Svg, { Circle, Path } from "react-native-svg";

import DrawingStroke from "../../components/DrawingStroke";

import { useTracingProgress } from "../hooks/useTracingProgress";

import type { TracingBoardSize, TracingGuide } from "../types/tracing.types";

import PandaTransition from "./PandaTransition";
import DrawingParticleEffect from "./DrawingParticleEffect";
import type { DrawingParticleEffectHandle } from "./DrawingParticleEffect";

import { PANDA_SOURCE, PANDA_WINK_SOURCE } from "../constants/pandaAssets";

/** 그림 영역 크기가 정해지기 전에 쓰는 빈 가이드 */
const EMPTY_GUIDE: TracingGuide = { id: "empty", points: [] };

interface TracingCanvasProps {
  /**
   * 실제 그림 영역(진행률 막대, 버튼을 뺀 부분)의 크기를 받아 가이드를 만든다.
   * 경로와 터치 좌표가 같은 영역을 기준으로 하도록 캔버스가 크기를 직접 잰다.
   */
  createGuide: (size: TracingBoardSize) => TracingGuide;
  style?: StyleProp<ViewStyle>;
  guideColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  onComplete?: () => void;
  resetKey: number;
  // 팬더 표시 여부
  showPanda?: boolean;
}

export const TracingCanvas: React.FC<TracingCanvasProps> = ({
  createGuide,
  style,
  guideColor = "#D9CBEF",
  strokeColor = "#9B7AEA",
  strokeWidth = 10,
  onComplete,
  resetKey,
  showPanda = false,
}) => {
  const particleRef = useRef<DrawingParticleEffectHandle>(null);

  // 실제 그림 영역 크기 (onLayout으로 측정)
  const [canvasSize, setCanvasSize] = useState<TracingBoardSize | null>(null);

  const guide = useMemo<TracingGuide>(
    () => (canvasSize ? createGuide(canvasSize) : EMPTY_GUIDE),
    [canvasSize, createGuide],
  );

  const width = canvasSize?.width ?? 0;
  const height = canvasSize?.height ?? 0;

  const handleCanvasLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: w, height: h } = event.nativeEvent.layout;

    setCanvasSize((previous) =>
      previous && previous.width === w && previous.height === h
        ? previous
        : { width: w, height: h },
    );
  }, []);

  const {
    panResponder,
    currentStroke,
    strokes,
    isDrawing,
    progress,
    isCompleted,
    completedSegments,
    resetTracing,
  } = useTracingProgress(guide, {
    onComplete,
    // 파티클은 시각 효과만 담당 (진행률/판정과 무관)
    onTouchPoint: (point) => particleRef.current?.emit(point),
  });
  const guidePoints = guide.points;

  const guidePath = guidePoints
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");

  // 시작점과 도착점
  const firstPoint = guidePoints[0];
  const endPoint = guidePoints[guidePoints.length - 1];

  // 팬더 크기: 기존(112x140)을 기준으로 작은 화면에서만 줄인다
  const pandaWidth = Math.min(112, Math.round(width * 0.3));
  const pandaHeight = Math.round(pandaWidth * 1.25);

  // 완성된 구간은 이어진 구간끼리 하나의 Path로 합쳐서 그린다
  // (구간 수가 많은 곡선에서도 렌더링 부담을 줄이기 위함)
  const completedPath = useMemo(() => {
    let d = "";
    let isOpen = false;

    completedSegments.forEach((completed, index) => {
      const start = guidePoints[index];
      const end = guidePoints[index + 1];

      if (!completed || !start || !end) {
        isOpen = false;
        return;
      }

      d += isOpen
        ? ` L ${end.x} ${end.y}`
        : ` M ${start.x} ${start.y} L ${end.x} ${end.y}`;

      isOpen = true;
    });

    return d;
  }, [completedSegments, guidePoints]);

  // 진행 상황 + 파티클 + 팬더 상태를 함께 초기화
  const handleReset = useCallback(() => {
    particleRef.current?.clear();
    resetTracing();
  }, [resetTracing]);

  useEffect(() => {
    if (resetKey > 0) {
      handleReset();
    }
  }, [resetKey, handleReset]);

  return (
    <View style={[styles.container, style]}>
      {/* 진행률 */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>
          {isCompleted ? "참 잘했어요! 🎉" : "길을 따라가 볼까요?"}
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(progress * 100)}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>

      {/* 그리기 영역 */}
      <View
        style={styles.canvas}
        onLayout={handleCanvasLayout}
        {...panResponder.panHandlers}
      >
        {canvasSize && firstPoint && endPoint && (
          <>
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              {/* 1. 원래 안내선 */}
              <Path
                d={guidePath}
                fill="none"
                stroke={guideColor}
                strokeWidth={4}
                strokeDasharray="0.1 9"
                strokeLinecap="round"
              />

              {/* 2. 완성된 구간 */}
              {completedPath.length > 0 && (
                <Path
                  d={completedPath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* 3. 현재 손가락을 따라가는 임시 선 */}
              {currentStroke.length > 0 && (
                <DrawingStroke
                  points={currentStroke}
                  color={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={0.65}
                />
              )}

              {/* 4. 시작점 */}
              {firstPoint && (
                <Circle
                  cx={firstPoint.x}
                  cy={firstPoint.y}
                  r={7}
                  fill={strokeColor}
                />
              )}

              {/* 5. 도착점 */}
              {endPoint && (
                <Circle cx={endPoint.x} cy={endPoint.y} r={7} fill="#F7C978" />
              )}
            </Svg>
            {showPanda && (
              <PandaTransition
                source={PANDA_SOURCE}
                winkSource={PANDA_WINK_SOURCE}
                startPoint={firstPoint}
                endPoint={endPoint}
                guidePoints={guidePoints}
                isTraceCompleted={isCompleted}
                width={width}
                height={height}
                pandaWidth={pandaWidth}
                pandaHeight={pandaHeight}
              />
            )}

            <DrawingParticleEffect
              ref={particleRef}
              width={width}
              height={height}
            />
          </>
        )}
      </View>

      {/* 다시 그리기 */}
      <Pressable style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>다시 그리기 ↻</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },

  progressContainer: {
    width: "100%",
    gap: 8,
  },

  progressLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#655B75",
    textAlign: "center",
  },

  progressTrack: {
    height: 12,
    borderRadius: 20,
    backgroundColor: "#EDE6F5",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 20,
    backgroundColor: "#A78BFA",
  },

  progressText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8B7BA6",
    textAlign: "right",
  },

  canvas: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
  },

  resetButton: {
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#F0EAF7",
    borderRadius: 20,
  },

  resetButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8067A5",
  },
});
