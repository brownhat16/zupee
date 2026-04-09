import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

const DOTS = [0, 1, 2];

export default function TypingIndicator({ label = "AI is thinking...", compact = false }) {
  const scales = useRef(DOTS.map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const animations = scales.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 120),
          Animated.timing(value, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.3,
            duration: 260,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(120),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());

    return () => animations.forEach((animation) => animation.stop());
  }, [scales]);

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={styles.dotsRow}>
        {DOTS.map((dot, index) => (
          <Animated.View
            key={dot}
            style={[
              styles.dot,
              {
                transform: [{ scale: scales[index] }],
                opacity: scales[index].interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.4, 1],
                }),
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, compact && styles.compactLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(6, 16, 22, 0.5)",
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  compactContainer: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: theme.colors.teal,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  compactLabel: {
    fontSize: 12,
  },
});
