import React, { useCallback, useEffect, useRef } from "react";

import { View, Text, StyleSheet, Pressable } from "react-native";

import type { ViewStyle, StyleProp } from "react-native";

import Svg, { Circle, Path } from "react-native-svg";

import DrawingStroke from "../../components/DrawingStroke";

import { useTracingProgress } from "../hooks/useTracingProgress";

import type { TracingGuide } from "../types/tracing.types";

import PandaTransition from "./PandaTransition";
import DrawingParticleEffect from "./DrawingParticleEffect";
import type { DrawingParticleEffectHandle } from "./DrawingParticleEffect";

import { PANDA_SOURCE, PANDA_WINK_SOURCE } from "../constants/pandaAssets";

interface TracingCanvasProps {
  guide: TracingGuide;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  guideColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  onComplete?: () => void;
  resetKey: number;
}

export const TracingCanvas: React.FC<TracingCanvasProps> = ({
  guide,
  width = 320,
  height = 420,
  style,
  guideColor = "#D9CBEF",
  strokeColor = "#9B7AEA",
  strokeWidth = 10,
  onComplete,
  resetKey,
}) => {
  const particleRef = useRef<DrawingParticleEffectHandle>(null);

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
        style={[styles.canvas, { width, height }]}
        {...panResponder.panHandlers}
      >
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
          {completedSegments.map((completed, index) => {
            if (!completed) return null;

            const start = guidePoints[index];
            const end = guidePoints[index + 1];

            if (!start || !end) return null;

            return (
              <Path
                key={`completed-${index}`}
                d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

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
        <PandaTransition
          source={PANDA_SOURCE}
          winkSource={PANDA_WINK_SOURCE}
          startPoint={firstPoint}
          endPoint={endPoint}
          isTraceCompleted={isCompleted}
          width={width}
          height={height}
          pandaWidth={112}
          pandaHeight={140}
        />

        <DrawingParticleEffect
          ref={particleRef}
          width={width}
          height={height}
        />
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
    alignItems: "center",
    gap: 16,
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
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F0EAF7",
  },

  resetButton: {
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
