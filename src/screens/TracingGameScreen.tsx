import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TracingGuide } from "../drawing/tracing/types/tracing.types";
import { TracingCanvas } from "../drawing/tracing/components/TracingCanvas";
import { Ionicons } from "@expo/vector-icons";

interface TracingGameScreenProps {
  onBack?: () => void;
}

export default function TracingGameScreen({ onBack }: TracingGameScreenProps) {
  const [boardSize, setBoardSize] = useState({
    width: 0,
    height: 0,
  });

  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
  };
  const handleBoardLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setBoardSize((previous) => {
      if (previous.width === width && previous.height === height) {
        return previous;
      }

      return { width, height };
    });
  };

  // 현재 첫 번째 콘텐츠: 가로 직선
  // 실제 보드 크기에 맞춰 좌표를 계산한다.

  const guide = useMemo<TracingGuide | null>(() => {
    const { width, height } = boardSize;

    if (width <= 0 || height <= 0) {
      return null;
    }

    const startX = width * 0.16;
    const endX = width * 0.84;
    const lineY = height * 0.52;

    // 가로선을 60개의 작은 선분으로 분할
    const segmentCount = 60;

    const points = Array.from({ length: segmentCount + 1 }, (_, index) => {
      const progress = index / segmentCount;

      return {
        x: startX + (endX - startX) * progress,
        y: lineY,
      };
    });

    return {
      id: "horizontal-line",
      points,
      tolerance: Math.min(width * 0.04, 14),
      completionThreshold: 1,
    };
  }, [boardSize]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* 배경 */}
        <View style={styles.background} />

        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>꼬불꼬불 선 따라가기</Text>

          <View style={styles.headerRight}>
            <Text style={styles.starText}>⭐ 0</Text>
          </View>
        </View>

        {/* 미션 안내 */}
        <View style={styles.missionArea}>
          <Text style={styles.missionText}>팬더 친구를 만나러 가자!</Text>

          <Text style={styles.missionSubText}>
            점선을 따라 손가락으로 그려봐
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.7}
            onPress={handleReset}
          >
            <Ionicons name="refresh" size={17} color="#71869A" />
            <Text style={styles.retryText}>다시 하기</Text>
          </TouchableOpacity>
        </View>

        {/* 게임 보드 */}
        <View style={styles.boardArea} onLayout={handleBoardLayout}>
          {guide && (
            <TracingCanvas
              guide={guide}
              width={boardSize.width}
              height={boardSize.height}
              resetKey={resetKey}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF5FC",
  },

  container: {
    flex: 1,
    overflow: "hidden",
  },

  background: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#EAF5FC",
  },

  header: {
    height: 76,
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  backButton: {
    position: "absolute",
    left: 16,
    top: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 38,
    color: "#657487",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#52677B",
  },

  headerRight: {
    position: "absolute",
    right: 16,
    top: 12,
    minWidth: 64,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  starText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#657487",
  },

  missionArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },

  missionText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#52677B",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
    overflow: "hidden",
    textAlign: "center",
    elevation: 3,
  },

  missionSubText: {
    marginTop: 9,
    fontSize: 14,
    fontWeight: "600",
    color: "#8297A8",
  },

  boardArea: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    elevation: 3,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "#DCEAF3",
  },

  retryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#71869A",
  },
});
