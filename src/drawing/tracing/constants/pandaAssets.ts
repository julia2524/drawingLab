import type { ImageSourcePropType } from "react-native";

/**
 * 팬더 이미지 소스 (교체 지점은 이 파일 하나)
 */

// 기본 팬더
export const PANDA_SOURCE: ImageSourcePropType = require("../../../../assets/images/baby-panda.png");

/**
 * 윙크 전용 팬더 이미지.
 *
 * 현재는 윙크 이미지가 없으므로 null.
 * 동일한 정지 이미지를 윙크로 간주하지 않기 위해, null이면 윙크 단계를 건너뛴다.
 *
 * 윙크 이미지가 준비되면:
 *   export const PANDA_WINK_SOURCE: ImageSourcePropType | null =
 *     require("../../../../assets/images/baby-panda-wink.png");
 */
export const PANDA_WINK_SOURCE: ImageSourcePropType | null = null;
