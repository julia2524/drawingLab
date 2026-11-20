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

import React from "react";

import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import { TracingCanvas } from "./src/drawing/tracing/components/TracingCanvas";

import type { TracingGuide } from "./src/drawing/tracing/types/tracing.types";

const horizontalGuide: TracingGuide = {
  id: "horizontal-01",

  points: [
    { x: 30, y: 200 },
    { x: 95, y: 200 },
    { x: 160, y: 200 },
    { x: 225, y: 200 },
    { x: 290, y: 200 },
  ],

  tolerance: 36,
  completionThreshold: 0.85,
};

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>꼬불꼬불 그리기 놀이터 🌷</Text>

      <View style={styles.content}>
        <TracingCanvas
          guide={horizontalGuide}
          width={320}
          height={420}
          onComplete={() => {
            console.log("그리기 완성!");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F3",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#655B75",
    textAlign: "center",
    marginTop: 24,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
