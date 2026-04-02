import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function StatsCard({ score, streak }) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.label}>Score</Text>
        <Text style={styles.value}>{score}</Text>
      </View>
      <View>
        <Text style={styles.label}>Streak</Text>
        <Text style={styles.value}>{streak}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#10131d",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#212637",
  },
  label: {
    color: "#96a0bd",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  value: {
    color: "#f7f8fc",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 6,
  },
});
