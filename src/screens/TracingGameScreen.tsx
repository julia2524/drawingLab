import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type {
  TracingBoardSize,
  TracingLineType,
  TracingLineVariant,
} from "../drawing/tracing/types/tracing.types";
import { createTracingGuide } from "../drawing/tracing/paths/createTracingGuide";
import {
  TRACING_LINES,
  getLineInfo,
} from "../drawing/tracing/paths/lineCatalog";
import { TracingCanvas } from "../drawing/tracing/components/TracingCanvas";
import { Ionicons } from "@expo/vector-icons";

interface TracingGameScreenProps {
  onBack?: () => void;
}

export default function TracingGameScreen({ onBack }: TracingGameScreenProps) {
  const [resetKey, setResetKey] = useState(0);

  // 현재 선택한 선 유형과 세부 변형
  const [lineType, setLineType] = useState<TracingLineType>("horizontal");
  const [variant, setVariant] = useState<TracingLineVariant>(0);

  const lineInfo = getLineInfo(lineType);

  const handleSelectLine = (type: TracingLineType) => {
    setLineType(type);
    setVariant(0);
  };

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
  };
  // 캔버스가 잰 실제 그림 영역 크기로 경로를 만든다.
  // 화면 표시와 터치 판정이 같은 guide.points를 사용한다.
  const createGuide = useCallback(
    (size: TracingBoardSize) => createTracingGuide(lineType, variant, size),
    [lineType, variant],
  );

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
          <Text style={styles.missionText}>{lineInfo.mission}</Text>

          <Text style={styles.missionSubText}>{lineInfo.hint}</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.retryButton}
              activeOpacity={0.7}
              onPress={handleReset}
            >
              <Ionicons name="refresh" size={17} color="#71869A" />
              <Text style={styles.retryText}>다시 하기</Text>
            </TouchableOpacity>

            {/* 세부 변형이 있는 유형만 표시 */}
            {lineInfo.variants?.map((label, index) => {
              const isSelected = variant === index;

              return (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.variantChip,
                    isSelected && styles.variantChipSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setVariant(index as TracingLineVariant)}
                >
                  <Text
                    style={[
                      styles.variantText,
                      isSelected && styles.variantTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 선 유형 선택 (개발/테스트용) */}
        <View style={styles.typeBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeBarContent}
          >
            {TRACING_LINES.map((line) => {
              const isSelected = line.type === lineType;

              return (
                <TouchableOpacity
                  key={line.type}
                  style={[
                    styles.typeChip,
                    isSelected && styles.typeChipSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelectLine(line.type)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      isSelected && styles.typeChipTextSelected,
                    ]}
                  >
                    {line.no} {line.shortLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 게임 보드 */}
        <View style={styles.boardArea}>
          <TracingCanvas
            key={`${lineType}-${variant}`}
            createGuide={createGuide}
            resetKey={resetKey}
          />
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
    paddingTop: 4,
    paddingBottom: 8,
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
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },

  variantChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "#DCEAF3",
  },

  variantChipSelected: {
    backgroundColor: "#9B7AEA",
    borderColor: "#9B7AEA",
  },

  variantText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#71869A",
  },

  variantTextSelected: {
    color: "#FFFFFF",
  },

  typeBar: {
    height: 44,
  },

  typeBarContent: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },

  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "#DCEAF3",
  },

  typeChipSelected: {
    backgroundColor: "#52677B",
    borderColor: "#52677B",
  },

  typeChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#71869A",
  },

  typeChipTextSelected: {
    color: "#FFFFFF",
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
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
