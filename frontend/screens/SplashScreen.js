import React from "react";
import { StyleSheet, Text, View } from "react-native";

import ScreenBackdrop from "../components/ScreenBackdrop";
import MotionFade from "../components/MotionFade";
import { theme } from "../theme";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <ScreenBackdrop />
      <MotionFade delay={40} offset={18}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>GAMEBUDDY AI</Text>
        </View>
      </MotionFade>
      <MotionFade delay={110} offset={18}>
        <Text style={styles.title}>Predict fast. Bluff smarter.</Text>
      </MotionFade>
      <MotionFade delay={200} offset={18}>
        <Text style={styles.subtitle}>
          A mini-game companion built like a real product, not a demo screen.
        </Text>
      </MotionFade>
      <MotionFade delay={280} offset={18}>
        <View style={styles.footerCard}>
          <Text style={styles.footerLabel}>Loading live modes</Text>
          <Text style={styles.footerValue}>Cricket Prediction + Bluff Master</Text>
        </View>
      </MotionFade>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: theme.colors.background,
    position: "relative",
    overflow: "hidden",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: {
    color: theme.colors.teal,
    fontSize: 12,
    letterSpacing: 1.8,
    fontWeight: "800",
  },
  title: {
    color: theme.colors.text,
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "900",
    maxWidth: 300,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    marginTop: 16,
    lineHeight: 24,
    maxWidth: 300,
  },
  footerCard: {
    marginTop: 26,
    backgroundColor: "rgba(16, 34, 44, 0.82)",
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: 18,
  },
  footerLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  footerValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },
});
