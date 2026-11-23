import type {
  TracingLineType,
  TracingLineVariant,
} from "../types/tracing.types";

/**
 * 12가지 선 유형의 화면용 정보 + 판정 설정
 *
 * 새 선/난이도를 추가할 때는 pathGenerators와 이 목록만 고치면 된다.
 */

export type TracingLineGroup = "A" | "B" | "C" | "D";

export interface TracingLineInfo {
  type: TracingLineType;
  no: string;
  group: TracingLineGroup;
  /** 선택 칩에 보이는 짧은 이름 */
  shortLabel: string;
  /** 정식 이름 */
  title: string;
  /** 미션 문구 */
  mission: string;
  /** 보조 안내 문구 */
  hint: string;
  /** 세부 변형 이름 (0, 1) */
  variants?: [string, string];
  /** 곡선/복잡한 경로는 순서 판정을 켠다. 기존 직선은 기존 동작 그대로. */
  ordered: boolean;
  /** 기본 허용 거리에 곱하는 배율 (곡선은 아이가 따라가기 쉽게 조금 넉넉하게) */
  toleranceScale: number;
}

export const LINE_GROUP_LABEL: Record<TracingLineGroup, string> = {
  A: "직선",
  B: "곡선",
  C: "방향 전환",
  D: "회전",
};

export const TRACING_LINES: TracingLineInfo[] = [
  {
    type: "horizontal",
    no: "01",
    group: "A",
    shortLabel: "가로선",
    title: "가로줄 긋기",
    mission: "팬더 친구를 만나러 가자!",
    hint: "점선을 따라 옆으로 쭉~ 그려봐",
    ordered: false,
    toleranceScale: 1,
  },
  {
    type: "vertical",
    no: "02",
    group: "A",
    shortLabel: "세로선",
    title: "세로줄 긋기",
    mission: "팬더가 나무에서 내려와요!",
    hint: "위에서 아래로 쭉~ 그려봐",
    ordered: false,
    toleranceScale: 1,
  },
  {
    type: "ascending",
    no: "03",
    group: "A",
    shortLabel: "올라가는 사선",
    title: "올라가는 사선",
    mission: "팬더가 언덕을 올라가요!",
    hint: "오른쪽 위로 올라가 봐",
    ordered: false,
    toleranceScale: 1,
  },
  {
    type: "descending",
    no: "04",
    group: "A",
    shortLabel: "내려가는 사선",
    title: "내려가는 사선",
    mission: "팬더가 미끄럼틀을 타요!",
    hint: "오른쪽 아래로 미끄러져 봐",
    ordered: false,
    toleranceScale: 1,
  },
  {
    type: "vertical_curve",
    no: "05",
    group: "B",
    shortLabel: "세로 곡선",
    title: "세로 곡선",
    mission: "팬더가 나무 사이로 지나가요!",
    hint: "위에서 아래로 살살 휘어져요",
    variants: ["오른쪽 볼록", "왼쪽 볼록"],
    ordered: true,
    toleranceScale: 1.2,
  },
  {
    type: "horizontal_curve",
    no: "06",
    group: "B",
    shortLabel: "가로 곡선",
    title: "가로 곡선",
    mission: "팬더가 강을 건너가요!",
    hint: "위아래로 둥글게 따라가 봐",
    variants: ["위쪽 볼록", "아래쪽 볼록"],
    ordered: true,
    toleranceScale: 1.2,
  },
  {
    type: "meandering",
    no: "07",
    group: "C",
    shortLabel: "구불구불",
    title: "구불구불선",
    mission: "팬더가 숲속 길을 걸어가요!",
    hint: "구불구불 천천히 따라가 봐",
    variants: ["가로", "세로"],
    ordered: true,
    toleranceScale: 1.2,
  },
  {
    type: "wave",
    no: "08",
    group: "C",
    shortLabel: "물결",
    title: "물결선",
    mission: "팬더가 파도를 따라가요!",
    hint: "출렁출렁 파도를 따라가 봐",
    ordered: true,
    toleranceScale: 1.2,
  },
  {
    type: "bounce",
    no: "09",
    group: "C",
    shortLabel: "깡충",
    title: "깡충선",
    mission: "팬더가 깡충깡충 뛰어요!",
    hint: "폴짝폴짝 언덕을 넘어 봐",
    ordered: true,
    toleranceScale: 1.2,
  },
  {
    type: "zigzag",
    no: "10",
    group: "C",
    shortLabel: "뾰족",
    title: "뾰족선",
    mission: "팬더가 산봉우리를 넘어가요!",
    hint: "뾰족뾰족 산을 따라가 봐",
    ordered: true,
    toleranceScale: 1.2,
  },
  {
    type: "loop",
    no: "11",
    group: "D",
    shortLabel: "뱅글 꼬불",
    title: "뱅글 꼬불선",
    mission: "팬더가 덩굴을 타고 가요!",
    hint: "뱅글뱅글 고리를 그려 봐",
    variants: ["아래로", "위로"],
    ordered: true,
    toleranceScale: 1.2,
  },
  {
    type: "spiral",
    no: "12",
    group: "D",
    shortLabel: "달팽이",
    title: "달팽이 뱅글선",
    mission: "팬더가 달팽이 집을 찾아가요!",
    hint: "빙글빙글 따라가 봐",
    variants: ["안으로", "밖으로"],
    ordered: true,
    toleranceScale: 1.2,
  },
];

export const getLineInfo = (type: TracingLineType): TracingLineInfo => {
  const info = TRACING_LINES.find((line) => line.type === type);

  if (!info) {
    throw new Error(`알 수 없는 선 유형: ${type}`);
  }

  return info;
};

export type { TracingLineVariant };
