import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>GAMEBUDDY AI</Text>
      <Text style={styles.title}>Play. Predict. Compete.</Text>
      <Text style={styles.subtitle}>Your savage entertainment sidekick is booting up.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#07070c",
  },
  eyebrow: {
    color: "#8cf7c5",
    fontSize: 14,
    letterSpacing: 2.2,
    marginBottom: 16,
    fontWeight: "800",
  },
  title: {
    color: "#f7f8fc",
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "900",
    maxWidth: 260,
  },
  subtitle: {
    color: "#98a2bd",
    fontSize: 16,
    marginTop: 16,
    lineHeight: 24,
    maxWidth: 260,
  },
});
