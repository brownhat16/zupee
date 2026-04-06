import React from "react";
import { StyleSheet, Text, View } from "react-native";

import PrimaryButton from "../components/PrimaryButton";
import ScreenBackdrop from "../components/ScreenBackdrop";
import { theme } from "../theme";

export default function ResultScreen({ result, onHome }) {
  if (!result) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScreenBackdrop />
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>{result.title}</Text>
        <Text style={styles.title}>Round complete.</Text>
        <Text style={styles.message}>{result.message}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.metricBlock}>
          <Text style={styles.metricLabel}>Score now</Text>
          <Text style={styles.metric}>{result.score}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricBlock}>
          <Text style={styles.metricLabel}>Streak now</Text>
          <Text style={styles.metric}>{result.streak}</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>What to do next</Text>
        <Text style={styles.summaryText}>
          Go back home, check the shared scoreboard, and jump into the next round while the context is still fresh.
        </Text>
      </View>

      <PrimaryButton label="Back to Home" note="Return to the live game picker" onPress={onHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  heroCard: {
    backgroundColor: "rgba(16, 34, 44, 0.82)",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
  },
  eyebrow: {
    color: theme.colors.teal,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 38,
    fontWeight: "900",
    marginTop: 12,
  },
  message: {
    color: theme.colors.textSoft,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
  },
  card: {
    marginVertical: 24,
    backgroundColor: "rgba(16, 34, 44, 0.76)",
    borderRadius: theme.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  metric: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 8,
  },
  metricBlock: {
    flex: 1,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  metricDivider: {
    width: 1,
    height: 44,
    backgroundColor: theme.colors.border,
    marginHorizontal: 12,
  },
  summaryCard: {
    backgroundColor: "rgba(244, 107, 69, 0.11)",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    marginBottom: 14,
  },
  summaryTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  summaryText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});
