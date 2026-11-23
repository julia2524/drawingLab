import React, { useEffect, useRef } from "react";

import { Animated, Image, StyleSheet } from "react-native";

import type { ImageSourcePropType } from "react-native";

export type PandaAnimationPhase =
  | "WAITING"
  | "TRACING"
  | "WALKING"
  | "EATING"
  | "COMPLETED";

interface PandaMoverProps {
  source: ImageSourcePropType;
  translateX: Animated.AnimatedInterpolation<number>;
  pathY: number;
  width?: number;
  height?: number;
  phase: PandaAnimationPhase;
}

export default function PandaMover({
  source,
  translateX,
  pathY,
  width = 112,
  height = 140,
  phase,
}: PandaMoverProps) {
  const bounceY = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animationRef.current?.stop();

    bounceY.setValue(0);
    rotation.setValue(0);
    scale.setValue(1);

    if (phase === "WALKING") {
      const walking = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(bounceY, {
              toValue: -4,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(rotation, {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(bounceY, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(rotation, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );

      animationRef.current = walking;
      walking.start();
    }

    if (phase === "EATING") {
      // 먹을 때는 몸 전체를 위아래로 튀기지 않고
      // 살짝 좌우로 흔들며 오물오물하는 느낌만 표현
      const eating = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(rotation, {
              toValue: 1,
              duration: 260,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.025,
              duration: 260,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(rotation, {
              toValue: -1,
              duration: 260,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 260,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );

      animationRef.current = eating;
      eating.start();
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [phase, bounceY, rotation, scale]);

  const rotate = rotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-2deg", "0deg", "2deg"],
  });

  const top = pathY - height + 8;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          width,
          height,
          top,
          transform: [
            { translateX },
            { translateY: bounceY },
            { rotate },
            { scale },
          ],
        },
      ]}
    >
      <Image source={source} resizeMode="contain" style={styles.pandaImage} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  pandaImage: {
    width: "100%",
    height: "100%",
  },
});
