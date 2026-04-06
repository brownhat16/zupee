import React from "react";
import { StyleSheet, View } from "react-native";

import { theme } from "../theme";

export default function ScreenBackdrop() {
  return (
    <View pointerEvents="none" style={styles.layer}>
      <View style={[styles.orb, styles.orbCoral]} />
      <View style={[styles.orb, styles.orbTeal]} />
      <View style={[styles.orb, styles.orbGold]} />
      <View style={styles.grid} />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: "absolute",
    borderRadius: theme.radius.pill,
    opacity: 0.28,
  },
  orbCoral: {
    width: 240,
    height: 240,
    backgroundColor: theme.colors.coral,
    top: -80,
    left: -60,
  },
  orbTeal: {
    width: 220,
    height: 220,
    backgroundColor: theme.colors.teal,
    top: 120,
    right: -80,
  },
  orbGold: {
    width: 180,
    height: 180,
    backgroundColor: theme.colors.gold,
    bottom: -30,
    left: "32%",
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    margin: 14,
    borderRadius: 40,
  },
});
