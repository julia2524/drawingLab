//자유그리기 테스트
// import React from "react";

// import { StyleSheet, Text, View } from "react-native";

// import { SafeAreaView } from "react-native-safe-area-context";

// import { DrawingCanvas } from "./src/drawing/components/DrawingCanvas";

// export default function App() {
//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>꼬불꼬불 그리기 놀이터</Text>

//       <View style={styles.canvasWrapper}>
//         <DrawingCanvas
//           width={320}
//           height={420}
//           strokeColor="#FF8A65"
//           strokeWidth={10}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFF9F3",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 24,
//     color: "#655B75",
//   },
//   canvasWrapper: {
//     borderRadius: 24,
//     overflow: "hidden",
//     backgroundColor: "#FFFFFF",
//     elevation: 3,
//   },
// });

// ///선그리기 테스트
// import React from "react";

// import { SafeAreaView, StyleSheet, Text, View } from "react-native";

// import { TracingCanvas } from "./src/drawing/tracing/components/TracingCanvas";

// import type { TracingGuide } from "./src/drawing/tracing/types/tracing.types";

// const horizontalGuide: TracingGuide = {
//   id: "horizontal-01",

//   points: [
//     { x: 30, y: 200 },
//     { x: 95, y: 200 },
//     { x: 160, y: 200 },
//     { x: 225, y: 200 },
//     { x: 290, y: 200 },
//   ],

//   tolerance: 36,
//   completionThreshold: 0.85,
// };

// export default function App() {
//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>꼬불꼬불 그리기 놀이터 🌷</Text>

//       <View style={styles.content}>
//         <TracingCanvas
//           guide={horizontalGuide}
//           width={320}
//           height={420}
//           onComplete={() => {
//             console.log("그리기 완성!");
//           }}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFF9F3",
//   },

//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#655B75",
//     textAlign: "center",
//     marginTop: 24,
//   },

//   content: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

import React, { useMemo, useState } from "react";

import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";

import { TracingCanvas } from "./src/drawing/tracing/components/TracingCanvas";

import { BASIC_SHAPES } from "./src/drawing/tracing/data/basicShapes";

import { createTracingPoints } from "./src/drawing/tracing/utils/tracingPathUtils";

import type { BasicShapeId } from "./src/drawing/tracing/data/basicShapes";

import type { TracingGuide } from "./src/drawing/tracing/types/tracing.types";

export default function App() {
  const [selectedShapeId, setSelectedShapeId] =
    useState<BasicShapeId>("horizontal");

  const selectedShape =
    BASIC_SHAPES.find((shape) => shape.id === selectedShapeId) ??
    BASIC_SHAPES[0];

  // 선택한 도형의 SVG 경로를 Tracing용 좌표로 변환
  const guide = useMemo<TracingGuide>(() => {
    return {
      id: selectedShape.id,
      points: createTracingPoints(selectedShape.path, {
        curveSteps: 30,
        spacing: 5,
      }),
      tolerance: selectedShape.tolerance,
      completionThreshold: selectedShape.completionThreshold,
    };
  }, [selectedShape]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 타이틀 */}
          <Text style={styles.title}>꼬불꼬불 그리기 놀이터 🌷</Text>

          <Text style={styles.subtitle}>어떤 모양을 그려볼까요?</Text>

          {/* 도형 선택 */}
          <View style={styles.shapeList}>
            {BASIC_SHAPES.map((shape) => {
              const isSelected = shape.id === selectedShapeId;

              return (
                <Pressable
                  key={shape.id}
                  style={[
                    styles.shapeButton,
                    isSelected && styles.selectedShapeButton,
                  ]}
                  onPress={() => setSelectedShapeId(shape.id)}
                >
                  <Text
                    style={[
                      styles.shapeButtonText,
                      isSelected && styles.selectedShapeButtonText,
                    ]}
                  >
                    {shape.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 선택한 도형 설명 */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.shapeTitle}>{selectedShape.name}</Text>

            <Text style={styles.description}>{selectedShape.description}</Text>
          </View>

          {/* 그리기 영역 */}
          <View style={styles.canvasContainer}>
            <TracingCanvas
              guide={guide}
              width={selectedShape.viewBox.width}
              height={selectedShape.viewBox.height}
              guideColor="#D9CBEF"
              strokeColor="#9B7AEA"
              strokeWidth={10}
              onComplete={() => {
                console.log(`${selectedShape.name} 완성! 🎉`);
              }}
            />
          </View>

          <Text style={styles.footer}>점선을 따라 손가락으로 그려 보세요!</Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F3",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#655B75",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#A394B5",
    marginTop: 8,
    marginBottom: 20,
  },

  shapeList: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },

  shapeButton: {
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 20,
    backgroundColor: "#F0EAF7",
    borderWidth: 1,
    borderColor: "#F0EAF7",
  },

  selectedShapeButton: {
    backgroundColor: "#9B7AEA",
    borderColor: "#9B7AEA",
  },

  shapeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8067A5",
  },

  selectedShapeButtonText: {
    color: "#FFFFFF",
  },

  descriptionContainer: {
    alignItems: "center",
    marginTop: 26,
    marginBottom: 16,
    gap: 5,
  },

  shapeTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#655B75",
  },

  description: {
    fontSize: 14,
    color: "#A394B5",
  },

  canvasContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },

  footer: {
    fontSize: 13,
    color: "#A394B5",
    marginTop: 12,
  },
});
