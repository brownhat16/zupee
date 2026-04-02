import React from "react";
import { StyleSheet, Text, View } from "react-native";

import PrimaryButton from "../components/PrimaryButton";

export default function ResultScreen({ result, onHome }) {
  if (!result) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{result.title}</Text>
      <Text style={styles.title}>Result Locked</Text>
      <Text style={styles.message}>{result.message}</Text>

      <View style={styles.card}>
        <Text style={styles.metric}>Score: {result.score}</Text>
        <Text style={styles.metric}>Streak: {result.streak}</Text>
      </View>

      <PrimaryButton label="Back to Home" onPress={onHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#07070c",
  },
  eyebrow: {
    color: "#8cf7c5",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: "#f7f8fc",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 12,
  },
  message: {
    color: "#abb4cb",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
  },
  card: {
    marginVertical: 24,
    backgroundColor: "#10131d",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#212637",
  },
  metric: {
    color: "#f7f8fc",
    fontSize: 18,
    fontWeight: "800",
    marginVertical: 4,
  },
});
