import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function MotionFade({ children, delay = 0, offset = 16, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(offset)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 320,
      delay,
      useNativeDriver: true,
    }).start();

    Animated.timing(translate, {
      toValue: 0,
      duration: 320,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, opacity, translate]);

  return (
    <Animated.View style={[styles.base, style, { opacity, transform: [{ translateY: translate }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
  },
});
