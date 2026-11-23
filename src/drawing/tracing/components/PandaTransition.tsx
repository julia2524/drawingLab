import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import type { DrawingPoint } from "../../types/drawing.types";

/**
 * 완성 시 출발 팬더가 사라지고 목적지 팬더가 나타나는 전환 연출.
 *
 * - 진행률/터치 좌표 계산에는 관여하지 않는다 (시각 전용).
 * - isTraceCompleted의 false → true 전환에서 한 번만 실행한다.
 * - true → false (다시 하기)가 되면 처음 상태로 되돌린다.
 */

interface PandaTransitionProps {
  source: ImageSourcePropType;
  /** 윙크 전용 이미지. 없으면 윙크 단계를 건너뛴다. */
  winkSource?: ImageSourcePropType | null;
  startPoint: DrawingPoint;
  endPoint: DrawingPoint;
  isTraceCompleted: boolean;
  width: number;
  height: number;
  pandaWidth?: number;
  pandaHeight?: number;
  onTransitionComplete?: () => void;
}

const EXIT_DURATION = 350;
const ENTER_DELAY = 250;
const ENTER_DURATION = 400;
const WINK_DELAY = 800; // 등장 후 윙크까지 대기
const WINK_DURATION = 600;

export default function PandaTransition({
  source,
  winkSource = null,
  startPoint,
  endPoint,
  isTraceCompleted,
  width,
  height,
  pandaWidth = 112,
  pandaHeight = 140,
  onTransitionComplete,
}: PandaTransitionProps) {
  const startOpacity = useSharedValue(1);
  const startScale = useSharedValue(1);
  const endOpacity = useSharedValue(0);
  const endScale = useSharedValue(0.85);
  const flagOpacity = useSharedValue(1);

  const [isWinking, setIsWinking] = useState(false);

  const hasPlayedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onCompleteRef = useRef(onTransitionComplete);

  onCompleteRef.current = onTransitionComplete;

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };

    // 완성 전/초기화: 처음 상태로 복귀
    if (!isTraceCompleted) {
      clearTimers();

      cancelAnimation(startOpacity);
      cancelAnimation(startScale);
      cancelAnimation(endOpacity);
      cancelAnimation(endScale);
      cancelAnimation(flagOpacity);

      startOpacity.value = 1;
      startScale.value = 1;
      endOpacity.value = 0;
      endScale.value = 0.85;
      flagOpacity.value = 1;

      hasPlayedRef.current = false;
      setIsWinking(false);

      return;
    }

    // 중복 실행 방지
    if (hasPlayedRef.current) return;

    hasPlayedRef.current = true;

    // 출발 팬더: 부드럽게 퇴장
    startOpacity.value = withTiming(0, {
      duration: EXIT_DURATION,
      easing: Easing.out(Easing.quad),
    });
    startScale.value = withTiming(0.92, { duration: EXIT_DURATION });

    // 목적지 표시(깃발): 팬더가 오기 전에 사라짐
    flagOpacity.value = withTiming(0, { duration: EXIT_DURATION });

    // 목적지 팬더: opacity + scale로 등장 후 부드럽게 정착
    endOpacity.value = withDelay(
      ENTER_DELAY,
      withTiming(1, { duration: ENTER_DURATION }),
    );
    endScale.value = withDelay(
      ENTER_DELAY,
      withSpring(1, { damping: 12, stiffness: 140, mass: 0.8 }),
    );

    // 윙크 (전용 이미지가 있을 때만)
    if (winkSource) {
      timersRef.current.push(
        setTimeout(
          () => {
            setIsWinking(true);
          },
          ENTER_DELAY + ENTER_DURATION + WINK_DELAY,
        ),
      );

      timersRef.current.push(
        setTimeout(
          () => {
            setIsWinking(false);
            onCompleteRef.current?.();
          },
          ENTER_DELAY + ENTER_DURATION + WINK_DELAY + WINK_DURATION,
        ),
      );
    } else {
      timersRef.current.push(
        setTimeout(
          () => {
            onCompleteRef.current?.();
          },
          ENTER_DELAY + ENTER_DURATION + 300,
        ),
      );
    }
    // 타이머 정리는 초기화 분기와 언마운트 효과가 담당한다.
    // (StrictMode의 개발용 이중 실행에서 타이머가 지워지는 것을 방지)
  }, [
    isTraceCompleted,
    winkSource,
    startOpacity,
    startScale,
    endOpacity,
    endScale,
    flagOpacity,
  ]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const startStyle = useAnimatedStyle(() => ({
    opacity: startOpacity.value,
    transform: [{ scale: startScale.value }],
  }));

  const endStyle = useAnimatedStyle(() => ({
    opacity: endOpacity.value,
    transform: [{ scale: endScale.value }],
  }));

  const flagStyle = useAnimatedStyle(() => ({
    opacity: flagOpacity.value,
  }));

  const clampLeft = (centerX: number) =>
    Math.min(Math.max(centerX - pandaWidth / 2, 0), width - pandaWidth);

  const pandaTop = (pathY: number) => pathY - pandaHeight + 8;

  return (
    <View pointerEvents="none" style={[styles.container, { width, height }]}>
      {/* 목적지 표시 (완성 전) */}
      <Animated.View
        style={[
          styles.flag,
          { left: endPoint.x - 11, top: endPoint.y - 34 },
          flagStyle,
        ]}
      >
        <Ionicons name="flag" size={22} color="#F2A65A" />
      </Animated.View>

      {/* 출발 팬더 */}
      <Animated.View
        style={[
          styles.panda,
          {
            width: pandaWidth,
            height: pandaHeight,
            left: clampLeft(startPoint.x),
            top: pandaTop(startPoint.y),
          },
          startStyle,
        ]}
      >
        <Image source={source} resizeMode="contain" style={styles.pandaImage} />
      </Animated.View>

      {/* 목적지 팬더 */}
      <Animated.View
        style={[
          styles.panda,
          {
            width: pandaWidth,
            height: pandaHeight,
            left: clampLeft(endPoint.x),
            top: pandaTop(endPoint.y),
          },
          endStyle,
        ]}
      >
        <Image
          source={isWinking && winkSource ? winkSource : source}
          resizeMode="contain"
          style={styles.pandaImage}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },

  panda: {
    position: "absolute",
    zIndex: 10,
  },

  pandaImage: {
    width: "100%",
    height: "100%",
  },

  flag: {
    position: "absolute",
    zIndex: 9,
  },
});
