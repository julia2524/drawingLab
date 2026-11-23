// import { useCallback, useRef, useState } from "react";

// /**
//  * 게임 진행 상태
//  * - playing: 진행 중
//  * - success: 스테이지 성공 처리 중 (음계 재생 등)
//  * - retry: 별 0개 → 재도전 대기
//  * - completed: 20스테이지 전체 완료
//  */
// export type TracingGameStatus = "playing" | "success" | "retry" | "completed";

// export interface UseTracingGameOptions {
//   /**
//    * 남은 별 개수만큼 음계 재생.
//    * Promise를 반환하면 재생이 끝난 뒤 다음 스테이지로 이동한다.
//    * (실제 프로젝트의 playEarnedNotes 등을 연결)
//    */
//   playNotesForStars?: (remainingStars: number) => Promise<void> | void;
//   /** 전체 스테이지 수 (기본 20) */
//   totalStages?: number;
//   /** 초기 별 개수 (기본 5) */
//   initialStars?: number;
// }

// export interface UseTracingGameResult {
//   currentStageIndex: number;
//   remainingStars: number;
//   gameStatus: TracingGameStatus;
//   isProcessing: boolean;
//   totalStages: number;

//   handleFailedAttempt: () => void;
//   handleStageComplete: () => void;
//   handleRetry: () => void;
//   handleResetGame: () => void;

//   /** 캔버스를 초기화해야 할 때 증가하는 키 */
//   canvasResetKey: number;
//   /** 스테이지 변경 시 캔버스 key로 쓸 값 */
//   stageKey: number;
// }

// const DEFAULT_TOTAL = 20;
// const DEFAULT_STARS = 5;

// /**
//  * 스테이지마다 별 5개 + 20스테이지 연속 플레이 게임 상태 관리
//  * (스테이지 클리어 시 별 5개로 재충전, 스테이지 내 실패 시에만 차감)
//  */
// export function useTracingGame(
//   options: UseTracingGameOptions = {},
// ): UseTracingGameResult {
//   const totalStages = options.totalStages ?? DEFAULT_TOTAL;
//   const initialStars = options.initialStars ?? DEFAULT_STARS;

//   const playNotesRef = useRef(options.playNotesForStars);
//   playNotesRef.current = options.playNotesForStars;

//   const [currentStageIndex, setCurrentStageIndex] = useState(0);
//   const [remainingStars, setRemainingStars] = useState(initialStars);
//   const [gameStatus, setGameStatus] = useState<TracingGameStatus>("playing");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [canvasResetKey, setCanvasResetKey] = useState(0);
//   const [stageKey, setStageKey] = useState(0);

//   // 비동기 처리 중 중복 방지
//   const processingRef = useRef(false);
//   const remainingStarsRef = useRef(remainingStars);
//   remainingStarsRef.current = remainingStars;
//   const gameStatusRef = useRef(gameStatus);
//   gameStatusRef.current = gameStatus;

//   const bumpCanvasReset = useCallback(() => {
//     setCanvasResetKey((k) => k + 1);
//   }, []);

//   /**
//    * 유효한 그리기 시도 후 손가락을 뗐을 때 (미완성)
//    * - 별 1개 차감
//    * - 이미 인정된 경로 진행률/완성 구간은 유지 (이어 그리기)
//    * - 별이 0이 되면 재도전 모달
//    * - 재도전 모달을 누르기 전까지는 진행률을 초기화하지 않음
//    */
//   const handleFailedAttempt = useCallback(() => {
//     if (processingRef.current) return;
//     if (gameStatusRef.current !== "playing") return;

//     processingRef.current = true;
//     setIsProcessing(true);

//     setRemainingStars((prev) => {
//       const next = Math.max(0, prev - 1);

//       if (next <= 0) {
//         // 별 0 → 재도전 모달. 진행률은 유지했다가 재도전 시 초기화
//         setGameStatus("retry");
//       }
//       // 별이 남아 있으면 캔버스/진행률을 리셋하지 않음
//       // → 마지막으로 인정된 지점부터 이어 그릴 수 있음

//       return next;
//     });

//     // 짧은 락으로 연속 실패 콜백 방지
//     setTimeout(() => {
//       processingRef.current = false;
//       setIsProcessing(false);
//     }, 120);
//   }, []);

//   const handleStageComplete = useCallback(() => {
//     if (processingRef.current) return;
//     if (gameStatusRef.current !== "playing") return;

//     processingRef.current = true;
//     setIsProcessing(true);
//     setGameStatus("success");

//     // 성공 시점의 남은 별 (성공해도 별은 변하지 않음)
//     const starsSnapshot = remainingStarsRef.current;

//     const run = async () => {
//       try {
//         // 남은 별 개수에 맞춰 음계 재생 (도레미파솔 ...)
//         // 실제 프로젝트: await playEarnedNotes(starsSnapshot);
//         const play = playNotesRef.current;
//         if (play) {
//           await Promise.resolve(play(starsSnapshot));
//         } else {
//           const ms = Math.max(300, starsSnapshot * 220 + 150);
//           await new Promise((r) => setTimeout(r, ms));
//         }
//       } catch (e) {
//         console.log("음계 재생 중 오류 (무시하고 진행):", e);
//       }

//       // 다음 스테이지 또는 전체 완료
//       setCurrentStageIndex((idx) => {
//         const nextIdx = idx + 1;

//         if (nextIdx >= totalStages) {
//           setGameStatus("completed");
//           return idx; // 마지막 스테이지 인덱스 유지
//         }

//         // 스테이지가 바뀌면 별 5개로 다시 충전
//         setRemainingStars(initialStars);
//         setGameStatus("playing");
//         setStageKey((k) => k + 1);
//         bumpCanvasReset();
//         return nextIdx;
//       });

//       processingRef.current = false;
//       setIsProcessing(false);
//     };

//     void run();
//   }, [totalStages, bumpCanvasReset, initialStars]);

//   const handleRetry = useCallback(() => {
//     // 재도전: 현재 스테이지 유지, 별 5개 충전, 해당 스테이지 진행률 처음부터 초기화
//     setRemainingStars(initialStars);
//     setGameStatus("playing");
//     processingRef.current = false;
//     setIsProcessing(false);
//     bumpCanvasReset(); // 진행률·완성 구간 전부 초기화
//   }, [initialStars, bumpCanvasReset]);

//   const handleResetGame = useCallback(() => {
//     setCurrentStageIndex(0);
//     setRemainingStars(initialStars);
//     setGameStatus("playing");
//     processingRef.current = false;
//     setIsProcessing(false);
//     setStageKey((k) => k + 1);
//     bumpCanvasReset();
//   }, [initialStars, bumpCanvasReset]);

//   return {
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
//   };
// }

import { useCallback, useRef, useState } from "react";

/**
 * 게임 진행 상태
 * - playing: 진행 중
 * - success: 스테이지 성공 확정 + 음계 재생 중 (ResultModal 아직 안 띄움)
 * - result: 음계 재생 완료 → ResultModal 표시
 * - retry: 별 0개 → 재도전 대기
 * - completed: 20스테이지 전체 완료
 */
export type TracingGameStatus =
  | "playing"
  | "success"
  | "result"
  | "retry"
  | "completed";

/** 스테이지 성공 결과 (ResultModal / 완료 화면용) */
export interface TracingStageResult {
  stageIndex: number;
  stageNo: string;
  title: string;
  mission: string;
  remainingStars: number;
  /** 간단 점수: 남은 별 × 100 */
  score: number;
  isLastStage: boolean;
}

export interface UseTracingGameOptions {
  /**
   * 남은 별 개수만큼 음계 재생.
   * Promise를 반환하면 재생이 끝난 뒤 ResultModal을 연다.
   */
  playNotesForStars?: (remainingStars: number) => Promise<void> | void;
  totalStages?: number;
  initialStars?: number;
  /** 스테이지 결과 메타 정보 조회 (번호, 이름, 미션) */
  getStageMeta?: (stageIndex: number) => {
    stageNo: string;
    title: string;
    mission: string;
  };
}

export interface UseTracingGameResult {
  currentStageIndex: number;
  remainingStars: number;
  gameStatus: TracingGameStatus;
  isProcessing: boolean;
  totalStages: number;
  /** 방금 성공한 스테이지 결과 (result / completed 상태) */
  lastResult: TracingStageResult | null;

  handleFailedAttempt: () => void;
  handleStageComplete: () => void;
  handleRetry: () => void;
  /** ResultModal에서 「다음 스테이지」 */
  handleNextStage: () => void;
  handleResetGame: () => void;

  canvasResetKey: number;
  stageKey: number;
}

const DEFAULT_TOTAL = 20;
const DEFAULT_STARS = 5;

function calcScore(stars: number): number {
  return Math.max(0, stars) * 100;
}

/**
 * 스테이지마다 별 5개 + 20스테이지 연속 플레이
 * 성공 → 음계 → ResultModal → (버튼) 다음 스테이지 / 전체 완료
 */
export function useTracingGame(
  options: UseTracingGameOptions = {},
): UseTracingGameResult {
  const totalStages = options.totalStages ?? DEFAULT_TOTAL;
  const initialStars = options.initialStars ?? DEFAULT_STARS;

  const playNotesRef = useRef(options.playNotesForStars);
  playNotesRef.current = options.playNotesForStars;

  const getStageMetaRef = useRef(options.getStageMeta);
  getStageMetaRef.current = options.getStageMeta;

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [remainingStars, setRemainingStars] = useState(initialStars);
  const [gameStatus, setGameStatus] = useState<TracingGameStatus>("playing");
  const [isProcessing, setIsProcessing] = useState(false);
  const [canvasResetKey, setCanvasResetKey] = useState(0);
  const [stageKey, setStageKey] = useState(0);
  const [lastResult, setLastResult] = useState<TracingStageResult | null>(null);

  const processingRef = useRef(false);
  const remainingStarsRef = useRef(remainingStars);
  remainingStarsRef.current = remainingStars;
  const gameStatusRef = useRef(gameStatus);
  gameStatusRef.current = gameStatus;
  const stageIndexRef = useRef(currentStageIndex);
  stageIndexRef.current = currentStageIndex;

  const bumpCanvasReset = useCallback(() => {
    setCanvasResetKey((k) => k + 1);
  }, []);

  /**
   * 미완성으로 손가락을 뗐을 때
   * - 별 1개 차감, 진행률 유지 (이어 그리기)
   * - 별 0 → 재도전 모달
   */
  const handleFailedAttempt = useCallback(() => {
    if (processingRef.current) return;
    if (gameStatusRef.current !== "playing") return;

    processingRef.current = true;
    setIsProcessing(true);

    setRemainingStars((prev) => {
      const next = Math.max(0, prev - 1);
      if (next <= 0) {
        setGameStatus("retry");
      }
      return next;
    });

    setTimeout(() => {
      processingRef.current = false;
      setIsProcessing(false);
    }, 120);
  }, []);

  /**
   * 경로 완성 성공
   * 1) 입력 잠금 + success 상태
   * 2) 결과 데이터 확정
   * 3) 음계 재생
   * 4) 재생 끝나면 result 상태 → ResultModal
   *    (마지막 스테이지도 일단 result로 두고, 버튼에서 completed로)
   */
  const handleStageComplete = useCallback(() => {
    if (processingRef.current) return;
    if (gameStatusRef.current !== "playing") return;

    processingRef.current = true;
    setIsProcessing(true);
    setGameStatus("success");

    const starsSnapshot = remainingStarsRef.current;
    const idx = stageIndexRef.current;
    const isLast = idx >= totalStages - 1;

    const meta = getStageMetaRef.current?.(idx) ?? {
      stageNo: String(idx + 1).padStart(2, "0"),
      title: `스테이지 ${idx + 1}`,
      mission: "",
    };

    const result: TracingStageResult = {
      stageIndex: idx,
      stageNo: meta.stageNo,
      title: meta.title,
      mission: meta.mission,
      remainingStars: starsSnapshot,
      score: calcScore(starsSnapshot),
      isLastStage: isLast,
    };
    setLastResult(result);

    const run = async () => {
      try {
        const play = playNotesRef.current;
        if (play) {
          await Promise.resolve(play(starsSnapshot));
        } else {
          const ms = Math.max(300, starsSnapshot * 220 + 150);
          await new Promise((r) => setTimeout(r, ms));
        }
      } catch (e) {
        console.log("음계 재생 중 오류 (무시하고 진행):", e);
      }

      // 음계가 끝난 뒤에만 ResultModal 표시
      setGameStatus("result");
      // 버튼 누르기 전까지는 processing 유지(입력 잠금)
      // processingRef는 handleNextStage / handleResetGame 에서 해제
    };

    void run();
  }, [totalStages]);

  const handleRetry = useCallback(() => {
    setRemainingStars(initialStars);
    setGameStatus("playing");
    setLastResult(null);
    processingRef.current = false;
    setIsProcessing(false);
    bumpCanvasReset();
  }, [initialStars, bumpCanvasReset]);

  /**
   * ResultModal 「다음 스테이지」 / 마지막이면 전체 완료 화면으로
   */
  const handleNextStage = useCallback(() => {
    if (gameStatusRef.current !== "result") return;

    const idx = stageIndexRef.current;
    const nextIdx = idx + 1;

    if (nextIdx >= totalStages) {
      // 전체 게임 완료 화면
      setGameStatus("completed");
      processingRef.current = false;
      setIsProcessing(false);
      return;
    }

    // 다음 스테이지: 별 5개, 그리기 데이터 새로
    setCurrentStageIndex(nextIdx);
    setRemainingStars(initialStars);
    setGameStatus("playing");
    setLastResult(null);
    setStageKey((k) => k + 1);
    bumpCanvasReset();
    processingRef.current = false;
    setIsProcessing(false);
  }, [totalStages, initialStars, bumpCanvasReset]);

  const handleResetGame = useCallback(() => {
    setCurrentStageIndex(0);
    setRemainingStars(initialStars);
    setGameStatus("playing");
    setLastResult(null);
    processingRef.current = false;
    setIsProcessing(false);
    setStageKey((k) => k + 1);
    bumpCanvasReset();
  }, [initialStars, bumpCanvasReset]);

  return {
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
  };
}
