import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

import type { TracingStageResult } from "../hooks/useTracingGame";

interface TracingResultModalProps {
  visible: boolean;
  result: TracingStageResult | null;
  onNext: () => void;
}

/**
 * 스테이지 성공 결과 모달 (임시 구현)
 * 실제 프로젝트의 ResultModal이 있으면 이 컴포넌트를 교체하면 됩니다.
 */
export function TracingResultModal({
  visible,
  result,
  onNext,
}: TracingResultModalProps) {
  if (!result) return null;

  const stars = Array.from({ length: 5 }, (_, i) =>
    i < result.remainingStars ? "⭐" : "☆",
  ).join("");

  const primaryLabel = result.isLastStage ? "결과 보기" : "다음 스테이지";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onNext}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.badge}>STAGE {result.stageNo}</Text>
          <Text style={styles.title}>{result.title}</Text>
          {result.mission ? (
            <Text style={styles.mission}>{result.mission}</Text>
          ) : null}

          <View style={styles.row}>
            <Text style={styles.label}>남은 별</Text>
            <Text style={styles.stars}>{stars}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>획득 점수</Text>
            <Text style={styles.score}>{result.score}</Text>
          </View>

          <Pressable style={styles.button} onPress={onNext}>
            <Text style={styles.buttonText}>{primaryLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(82, 103, 123, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    gap: 8,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 2,
  },
  badge: {
    fontSize: 13,
    fontWeight: "800",
    color: "#7BC9B4",
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#52677B",
    textAlign: "center",
  },
  mission: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8297A8",
    textAlign: "center",
    marginBottom: 6,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F5FAFC",
    borderRadius: 16,
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#71869A",
  },
  stars: {
    fontSize: 16,
    letterSpacing: 2,
  },
  score: {
    fontSize: 20,
    fontWeight: "800",
    color: "#52677B",
  },
  button: {
    marginTop: 14,
    width: "100%",
    backgroundColor: "#7BC9B4",
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
