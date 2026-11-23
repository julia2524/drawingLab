// import React, { useCallback, useMemo } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Pressable,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// import type { TracingBoardSize } from "../drawing/tracing/types/tracing.types";
// import { createTracingGuide } from "../drawing/tracing/paths/createTracingGuide";
// import { TRACING_LINES } from "../drawing/tracing/paths/lineCatalog";
// import { TracingCanvas } from "../drawing/tracing/components/TracingCanvas";
// import { useTracingGame } from "../drawing/tracing/hooks/useTracingGame";

// /**
//  * 음계 재생 연결 지점
//  * 실제 프로젝트에서는 아래처럼 교체하세요:
//  *
//  *   import { playEarnedNotes } from "../features/audio/soundManager"; // 경로 예시
//  *   // playNotesForStars: (n) => playEarnedNotes(n)
//  *
//  * 남은 별 5 → 도레미파솔, 4 → 도레미파, ... 1 → 도
//  */
// async function playNotesForRemainingStars(
//   remainingStars: number,
// ): Promise<void> {
//   // TODO: 실제 음계 모듈 연결
//   // await playEarnedNotes(remainingStars);
//   const count = Math.min(Math.max(remainingStars, 0), 5);
//   const ms = Math.max(280, count * 220 + 120);
//   await new Promise((resolve) => setTimeout(resolve, ms));
// }

// interface TracingGameScreenProps {
//   onBack?: () => void;
// }

// function StarRow({
//   remaining,
//   total = 5,
// }: {
//   remaining: number;
//   total?: number;
// }) {
//   const filled = Math.max(0, Math.min(total, remaining));
//   const stars = Array.from({ length: total }, (_, i) =>
//     i < filled ? "⭐" : "☆",
//   );
//   return <Text style={styles.starText}>{stars.join("")}</Text>;
// }

// export default function TracingGameScreen({ onBack }: TracingGameScreenProps) {
//   const {
//     currentStageIndex,
//     remainingStars,
//     gameStatus,
//     isProcessing,
//     totalStages,
//     handleFailedAttempt,
//     handleStageComplete,
//     handleRetry,
//     handleResetGame,
//     canvasResetKey,
//     stageKey,
//   } = useTracingGame({
//     totalStages: TRACING_LINES.length,
//     playNotesForStars: playNotesForRemainingStars,
//   });

//   const lineInfo = TRACING_LINES[currentStageIndex] ?? TRACING_LINES[0];
//   const lineType = lineInfo.type;

//   const createGuide = useCallback(
//     (size: TracingBoardSize) => createTracingGuide(lineType, size),
//     [lineType],
//   );

//   const inputLocked =
//     isProcessing ||
//     gameStatus === "success" ||
//     gameStatus === "retry" ||
//     gameStatus === "completed";

//   const stageLabel = useMemo(
//     () => `${String(currentStageIndex + 1).padStart(2, "0")} / ${totalStages}`,
//     [currentStageIndex, totalStages],
//   );

//   return (
//     <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
//       <View style={styles.container}>
//         <View style={styles.background} />

//         {/* 상단 헤더 */}
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={onBack}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.backIcon}>‹</Text>
//           </TouchableOpacity>

//           <View style={styles.headerCenter}>
//             <Text style={styles.headerTitle}>꼬불꼬불 선 따라가기</Text>
//             <Text style={styles.stageLabel}>{stageLabel}</Text>
//           </View>

//           <View style={styles.headerRight}>
//             <StarRow remaining={remainingStars} />
//           </View>
//         </View>

//         {/* 미션 안내 */}
//         <View style={styles.missionArea}>
//           <Text style={styles.missionText}>{lineInfo.mission}</Text>
//           <Text style={styles.missionSubText}>{lineInfo.hint}</Text>
//         </View>

//         {/* 게임 보드 */}
//         <View style={styles.boardArea}>
//           <TracingCanvas
//             key={`stage-${stageKey}-${lineType}`}
//             createGuide={createGuide}
//             resetKey={canvasResetKey}
//             onComplete={handleStageComplete}
//             onFailedAttempt={handleFailedAttempt}
//             inputLocked={inputLocked}
//             showPanda
//           />
//         </View>

//         {/* 재도전 모달 (별 0개) */}
//         <Modal
//           visible={gameStatus === "retry"}
//           transparent
//           animationType="fade"
//           onRequestClose={handleRetry}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalCard}>
//               <Text style={styles.modalEmoji}>🐼</Text>
//               <Text style={styles.modalTitle}>한 번 더 해 볼까?</Text>
//               <Text style={styles.modalSubtitle}>
//                 별을 다시 모아서 출발하자!
//               </Text>
//               <Pressable
//                 style={styles.modalPrimaryButton}
//                 onPress={handleRetry}
//               >
//                 <Text style={styles.modalPrimaryText}>다시 시작하기</Text>
//               </Pressable>
//             </View>
//           </View>
//         </Modal>

//         {/* 전체 완료 화면 */}
//         <Modal
//           visible={gameStatus === "completed"}
//           transparent
//           animationType="fade"
//           onRequestClose={handleResetGame}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalCard}>
//               <Text style={styles.modalEmoji}>🎉</Text>
//               <Text style={styles.modalTitle}>우와! 모두 해냈어요!</Text>
//               <Text style={styles.modalSubtitle}>
//                 팬더 친구와 함께 멋진 길을 완성했어요!
//               </Text>
//               <StarRow remaining={remainingStars} />
//               <View style={styles.modalButtonRow}>
//                 <Pressable
//                   style={styles.modalPrimaryButton}
//                   onPress={handleResetGame}
//                 >
//                   <Text style={styles.modalPrimaryText}>다시 해보기</Text>
//                 </Pressable>
//                 {onBack ? (
//                   <Pressable
//                     style={styles.modalSecondaryButton}
//                     onPress={onBack}
//                   >
//                     <Text style={styles.modalSecondaryText}>게임 나가기</Text>
//                   </Pressable>
//                 ) : null}
//               </View>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#EAF5FC",
//   },

//   container: {
//     flex: 1,
//     overflow: "hidden",
//   },

//   background: {
//     ...StyleSheet.absoluteFill,
//     backgroundColor: "#EAF5FC",
//   },

//   header: {
//     height: 76,
//     paddingHorizontal: 16,
//     paddingTop: 8,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 10,
//   },

//   backButton: {
//     position: "absolute",
//     left: 16,
//     top: 12,
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "rgba(255,255,255,0.85)",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   backIcon: {
//     fontSize: 34,
//     lineHeight: 38,
//     color: "#657487",
//     marginTop: -4,
//   },

//   headerCenter: {
//     alignItems: "center",
//   },

//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "#52677B",
//   },

//   stageLabel: {
//     marginTop: 2,
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#8297A8",
//   },

//   headerRight: {
//     position: "absolute",
//     right: 12,
//     top: 12,
//     minWidth: 88,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.9)",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 10,
//   },

//   starText: {
//     fontSize: 15,
//     fontWeight: "800",
//     color: "#657487",
//     letterSpacing: 1,
//   },

//   missionArea: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 20,
//     paddingTop: 4,
//     paddingBottom: 8,
//   },

//   missionText: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "#52677B",
//     backgroundColor: "#FFFFFF",
//     paddingHorizontal: 22,
//     paddingVertical: 12,
//     borderRadius: 22,
//     overflow: "hidden",
//     textAlign: "center",
//     elevation: 3,
//   },

//   missionSubText: {
//     marginTop: 9,
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#8297A8",
//   },

//   boardArea: {
//     flex: 1,
//     marginHorizontal: 16,
//     marginTop: 4,
//     marginBottom: 16,
//     borderRadius: 28,
//     backgroundColor: "#FFFFFF",
//     overflow: "hidden",
//     elevation: 3,
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(82, 103, 123, 0.35)",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 28,
//   },

//   modalCard: {
//     width: "100%",
//     maxWidth: 340,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 28,
//     paddingHorizontal: 24,
//     paddingTop: 28,
//     paddingBottom: 24,
//     alignItems: "center",
//     gap: 10,
//   },

//   modalEmoji: {
//     fontSize: 42,
//     marginBottom: 4,
//   },

//   modalTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: "#52677B",
//     textAlign: "center",
//   },

//   modalSubtitle: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#8297A8",
//     textAlign: "center",
//     marginBottom: 8,
//   },

//   modalButtonRow: {
//     width: "100%",
//     gap: 10,
//     marginTop: 8,
//   },

//   modalPrimaryButton: {
//     marginTop: 6,
//     width: "100%",
//     backgroundColor: "#7BC9B4",
//     borderRadius: 22,
//     paddingVertical: 14,
//     alignItems: "center",
//   },

//   modalPrimaryText: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#FFFFFF",
//   },

//   modalSecondaryButton: {
//     width: "100%",
//     backgroundColor: "#F0F6FA",
//     borderRadius: 22,
//     paddingVertical: 14,
//     alignItems: "center",
//   },

//   modalSecondaryText: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#657487",
//   },
// });

import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TracingBoardSize } from "../drawing/tracing/types/tracing.types";
import { createTracingGuide } from "../drawing/tracing/paths/createTracingGuide";
import { TRACING_LINES } from "../drawing/tracing/paths/lineCatalog";
import { TracingCanvas } from "../drawing/tracing/components/TracingCanvas";
import { TracingResultModal } from "../drawing/tracing/components/TracingResultModal";
import { useTracingGame } from "../drawing/tracing/hooks/useTracingGame";

/**
 * 음계 재생 연결 지점
 * 실제 프로젝트:
 *   import { playEarnedNotes } from "...";
 *   playNotesForStars: (n) => playEarnedNotes(n)
 * 남은 별 5 → 도레미파솔 … 1 → 도
 */
async function playNotesForRemainingStars(
  remainingStars: number,
): Promise<void> {
  // TODO: await playEarnedNotes(remainingStars);
  const count = Math.min(Math.max(remainingStars, 0), 5);
  const ms = Math.max(280, count * 220 + 120);
  await new Promise((resolve) => setTimeout(resolve, ms));
}

interface TracingGameScreenProps {
  onBack?: () => void;
}

function StarRow({
  remaining,
  total = 5,
}: {
  remaining: number;
  total?: number;
}) {
  const filled = Math.max(0, Math.min(total, remaining));
  const stars = Array.from({ length: total }, (_, i) =>
    i < filled ? "⭐" : "☆",
  );
  return <Text style={styles.starText}>{stars.join("")}</Text>;
}

export default function TracingGameScreen({ onBack }: TracingGameScreenProps) {
  const {
    currentStageIndex,
    remainingStars,
    gameStatus,
    isProcessing,
    totalStages,
    lastResult,
    handleFailedAttempt,
    handleStageComplete,
    handleRetry,
    handleNextStage,
    handleResetGame,
    canvasResetKey,
    stageKey,
  } = useTracingGame({
    totalStages: TRACING_LINES.length,
    playNotesForStars: playNotesForRemainingStars,
    getStageMeta: (index) => {
      const line = TRACING_LINES[index] ?? TRACING_LINES[0];
      return {
        stageNo: line.no,
        title: line.title,
        mission: line.mission,
      };
    },
  });

  const lineInfo = TRACING_LINES[currentStageIndex] ?? TRACING_LINES[0];
  const lineType = lineInfo.type;

  const createGuide = useCallback(
    (size: TracingBoardSize) => createTracingGuide(lineType, size),
    [lineType],
  );

  const inputLocked =
    isProcessing ||
    gameStatus === "success" ||
    gameStatus === "result" ||
    gameStatus === "retry" ||
    gameStatus === "completed";

  const stageLabel = useMemo(
    () => `${String(currentStageIndex + 1).padStart(2, "0")} / ${totalStages}`,
    [currentStageIndex, totalStages],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
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

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>꼬불꼬불 선 따라가기</Text>
            <Text style={styles.stageLabel}>{stageLabel}</Text>
          </View>

          <View style={styles.headerRight}>
            <StarRow remaining={remainingStars} />
          </View>
        </View>

        {/* 미션 안내 */}
        <View style={styles.missionArea}>
          <Text style={styles.missionText}>{lineInfo.mission}</Text>
          <Text style={styles.missionSubText}>{lineInfo.hint}</Text>
        </View>

        {/* 게임 보드 */}
        <View style={styles.boardArea}>
          <TracingCanvas
            key={`stage-${stageKey}-${lineType}`}
            createGuide={createGuide}
            resetKey={canvasResetKey}
            onComplete={handleStageComplete}
            onFailedAttempt={handleFailedAttempt}
            inputLocked={inputLocked}
            showPanda
          />
        </View>

        {/* 스테이지 성공 ResultModal (음계 재생이 끝난 뒤에만) */}
        <TracingResultModal
          visible={gameStatus === "result"}
          result={lastResult}
          onNext={handleNextStage}
        />

        {/* 재도전 모달 (별 0개) */}
        <Modal
          visible={gameStatus === "retry"}
          transparent
          animationType="fade"
          onRequestClose={handleRetry}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>🐼</Text>
              <Text style={styles.modalTitle}>한 번 더 해 볼까?</Text>
              <Text style={styles.modalSubtitle}>
                별을 다시 모아서 출발하자!
              </Text>
              <Pressable
                style={styles.modalPrimaryButton}
                onPress={handleRetry}
              >
                <Text style={styles.modalPrimaryText}>다시 시작하기</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* 전체 완료 화면 (20스테이지 성공 후 ResultModal에서 「결과 보기」) */}
        <Modal
          visible={gameStatus === "completed"}
          transparent
          animationType="fade"
          onRequestClose={handleResetGame}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>🎉</Text>
              <Text style={styles.modalTitle}>우와! 모두 해냈어요!</Text>
              <Text style={styles.modalSubtitle}>
                팬더 친구와 함께 멋진 길을 완성했어요!
              </Text>
              {lastResult ? (
                <>
                  <Text style={styles.finalMeta}>
                    마지막 스테이지 {lastResult.stageNo} · 점수{" "}
                    {lastResult.score}
                  </Text>
                  <StarRow remaining={lastResult.remainingStars} />
                </>
              ) : (
                <StarRow remaining={remainingStars} />
              )}
              <View style={styles.modalButtonRow}>
                <Pressable
                  style={styles.modalPrimaryButton}
                  onPress={handleResetGame}
                >
                  <Text style={styles.modalPrimaryText}>다시 해보기</Text>
                </Pressable>
                {onBack ? (
                  <Pressable
                    style={styles.modalSecondaryButton}
                    onPress={onBack}
                  >
                    <Text style={styles.modalSecondaryText}>게임 나가기</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        </Modal>
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

  headerCenter: {
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#52677B",
  },

  stageLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "#8297A8",
  },

  headerRight: {
    position: "absolute",
    right: 12,
    top: 12,
    minWidth: 88,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  starText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#657487",
    letterSpacing: 1,
  },

  missionArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },

  missionText: {
    fontSize: 18,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(82, 103, 123, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: "center",
    gap: 10,
  },

  modalEmoji: {
    fontSize: 42,
    marginBottom: 4,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#52677B",
    textAlign: "center",
  },

  modalSubtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8297A8",
    textAlign: "center",
    marginBottom: 8,
  },

  finalMeta: {
    fontSize: 13,
    fontWeight: "700",
    color: "#71869A",
    marginTop: 4,
  },

  modalButtonRow: {
    width: "100%",
    gap: 10,
    marginTop: 8,
  },

  modalPrimaryButton: {
    marginTop: 6,
    width: "100%",
    backgroundColor: "#7BC9B4",
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: "center",
  },

  modalPrimaryText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  modalSecondaryButton: {
    width: "100%",
    backgroundColor: "#F0F6FA",
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: "center",
  },

  modalSecondaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#657487",
  },
});
