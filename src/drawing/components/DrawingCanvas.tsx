import React from "react";

import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";

import Svg from "react-native-svg";

import { useDrawingGesture } from "../hooks/useDrawingGesture";
import DrawingStroke from "./DrawingStroke";

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  strokeColor?: string;
  strokeWidth?: number;
  onStrokeComplete?: (stroke: { x: number; y: number }[]) => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = 320,
  height = 420,
  style,
  strokeColor = "#FF8A65",
  strokeWidth = 8,
  onStrokeComplete,
}) => {
  const { panResponder, strokes, currentStroke } = useDrawingGesture({
    onStrokeComplete,
  });

  return (
    <View
      style={[styles.container, { width, height }, style]}
      {...panResponder.panHandlers}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {strokes.map((stroke, index) => (
          <DrawingStroke
            key={`stroke-${index}`}
            points={stroke}
            color={strokeColor}
            strokeWidth={strokeWidth}
          />
        ))}

        {currentStroke.length > 0 && (
          <DrawingStroke
            points={currentStroke}
            color={strokeColor}
            strokeWidth={strokeWidth}
          />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
});
