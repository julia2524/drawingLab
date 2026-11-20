import React from "react";

import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
} from "react-native";

import Svg, { Circle, Path } from "react-native-svg";

import DrawingStroke from "../../components/DrawingStroke";

import { useTracingProgress } from "../hooks/useTracingProgress";

import type { TracingGuide } from "../types/tracing.types";

interface TracingCanvasProps {
  guide: TracingGuide;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  guideColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  onComplete?: () => void;
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
}) => {
  const {
    panResponder,
    strokes,
    currentStroke,
    progress,
    isCompleted,
    resetTracing,
  } = useTracingProgress(guide, {
    onComplete,
  });

  const guidePoints = guide.points;

  const guidePath = guidePoints
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");

  const firstPoint = guidePoints[0];
  const lastPoint = guidePoints[guidePoints.length - 1];

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
          {/* 전체 가이드 경로 */}
          <Path
            d={guidePath}
            fill="none"
            stroke={guideColor}
            strokeWidth={5}
            strokeDasharray="0.1 9"
            strokeLinecap="round"
          />

          {/* 시작점 */}
          {firstPoint && (
            <Circle
              cx={firstPoint.x}
              cy={firstPoint.y}
              r={strokeWidth}
              fill="#FFD166"
            />
          )}

          {/* 도착점 */}
          {lastPoint && (
            <Circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={strokeWidth}
              fill="#8BD5A7"
            />
          )}

          {/* 완성된 선 */}
          {strokes.map((stroke, index) => (
            <DrawingStroke
              key={`completed-${index}`}
              points={stroke}
              color={strokeColor}
              strokeWidth={strokeWidth}
            />
          ))}

          {/* 현재 그리는 선 */}
          {currentStroke.length > 0 && (
            <DrawingStroke
              points={currentStroke}
              color={strokeColor}
              strokeWidth={strokeWidth}
            />
          )}
        </Svg>
      </View>

      {/* 다시 그리기 */}
      <Pressable style={styles.resetButton} onPress={resetTracing}>
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
