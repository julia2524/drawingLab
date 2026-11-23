import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";

interface BambooEatingAnimationProps {
  source: ImageSourcePropType;
  width?: number;
  height?: number;
  visible?: boolean;
  onComplete?: () => void;
}

export default function BambooEatingAnimation({
  source,
  width = 180,
  height = 190,
  visible = true,
  onComplete,
}: BambooEatingAnimationProps) {
  const pandaScale = useRef(new Animated.Value(1)).current;
  const bambooRotate = useRef(new Animated.Value(0)).current;
  const leafRotate = useRef(new Animated.Value(0)).current;

  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!visible) {
      animationRef.current?.stop();
      pandaScale.setValue(1);
      bambooRotate.setValue(0);
      leafRotate.setValue(0);
      return;
    }

    const createChewAnimation = () =>
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pandaScale, {
            toValue: 1.035,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bambooRotate, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(leafRotate, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pandaScale, {
            toValue: 1,
            duration: 180,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bambooRotate, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(leafRotate, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
      ]);

    animationRef.current = Animated.sequence([
      createChewAnimation(),
      createChewAnimation(),
      createChewAnimation(),
    ]);

    animationRef.current.start(({ finished }) => {
      if (finished) {
        onCompleteRef.current?.();
      }
    });

    return () => {
      animationRef.current?.stop();
    };
  }, [visible, pandaScale, bambooRotate, leafRotate]);

  const bambooRotation = bambooRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-3deg", "3deg"],
  });

  const leafRotation = leafRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-8deg", "8deg"],
  });

  return (
    <View pointerEvents="none" style={[styles.container, { width, height }]}>
      {/* 대나무 */}
      <Animated.View
        style={[
          styles.bambooWrapper,
          { transform: [{ rotate: bambooRotation }] },
        ]}
      >
        <View style={styles.bambooStalk}>
          <View style={styles.bambooHighlight} />
          <View style={styles.bambooJointTop} />
          <View style={styles.bambooJointBottom} />
        </View>

        <Animated.View
          style={[
            styles.leaf,
            styles.leafLeft,
            { transform: [{ rotate: leafRotation }] },
          ]}
        />

        <Animated.View
          style={[
            styles.leaf,
            styles.leafRight,
            { transform: [{ rotate: leafRotation }] },
          ]}
        />
      </Animated.View>

      {/* 기존 팬더곰 */}
      <Animated.View
        style={[styles.pandaWrapper, { transform: [{ scale: pandaScale }] }]}
      >
        <Image source={source} resizeMode="contain" style={styles.panda} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bambooWrapper: {
    position: "absolute",
    width: 34,
    height: 112,
    left: "53%",
    top: 12,
    zIndex: 2,
    alignItems: "center",
  },
  bambooStalk: {
    width: 19,
    height: 105,
    borderRadius: 9,
    backgroundColor: "#77BD63",
    borderWidth: 1.5,
    borderColor: "#559D4D",
    overflow: "hidden",
  },
  bambooHighlight: {
    position: "absolute",
    left: 4,
    top: 5,
    width: 4,
    height: 90,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  bambooJointTop: {
    position: "absolute",
    top: 25,
    left: 0,
    width: "100%",
    height: 3,
    backgroundColor: "#4E984A",
  },
  bambooJointBottom: {
    position: "absolute",
    top: 70,
    left: 0,
    width: "100%",
    height: 3,
    backgroundColor: "#4E984A",
  },
  leaf: {
    position: "absolute",
    width: 29,
    height: 13,
    borderRadius: 20,
    backgroundColor: "#65B95B",
    borderWidth: 1,
    borderColor: "#4E984A",
  },
  leafLeft: {
    top: 4,
    left: -12,
    transform: [{ rotate: "-35deg" }],
  },
  leafRight: {
    top: 0,
    right: -13,
    transform: [{ rotate: "35deg" }],
  },
  pandaWrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 3,
  },
  panda: {
    width: "100%",
    height: "100%",
  },
});
