import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

export default function VersusBanner({
  leftLabel = "You",
  rightLabel = "Jayyy",
  centerLabel = "Next over",
  score = "0-0",
}) {
  return (
    <View style={styles.container}>
      <View style={[styles.side, styles.left]}>
        <Text style={styles.sideLabel}>{leftLabel}</Text>
        <Text style={styles.sub} numberOfLines={1}>Player</Text>
      </View>

      <View style={styles.centerBlock}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.centerLabel}>{centerLabel}</Text>
      </View>

      <View style={[styles.side, styles.right]}>
        <Text style={styles.sideLabel}>{rightLabel}</Text>
        <Text style={styles.sub} numberOfLines={1}>AI Companion</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(9, 20, 27, 0.85)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(121, 224, 200, 0.4)",
    overflow: "hidden",
  },
  side: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  left: {
    backgroundColor: "rgba(121, 224, 200, 0.12)",
  },
  right: {
    backgroundColor: "rgba(244, 107, 69, 0.12)",
    alignItems: "flex-end",
  },
  sideLabel: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 14,
    textTransform: "uppercase",
  },
  sub: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  centerBlock: {
    minWidth: 110,
    backgroundColor: "rgba(121, 224, 200, 0.22)",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(121, 224, 200, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  score: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  centerLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
