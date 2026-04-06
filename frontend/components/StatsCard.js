import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

export default function StatsCard({ score, streak, gamesPlayed = 0 }) {
  return (
    <View style={styles.card}>
      <View style={styles.stat}>
        <Text style={styles.label}>Score</Text>
        <Text style={styles.value}>{score}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={styles.label}>Streak</Text>
        <Text style={styles.value}>{streak}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={styles.label}>Rounds</Text>
        <Text style={styles.value}>{gamesPlayed}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(16, 34, 44, 0.86)",
    borderRadius: theme.radius.lg,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  stat: {
    flex: 1,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  value: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 6,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.border,
    marginHorizontal: 10,
  },
});
