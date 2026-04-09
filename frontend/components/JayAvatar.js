import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

export default function JayAvatar({ headline = "Jayyy here", subline = "Your AI co-op partner", size = 58 }) {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/icon.png")} style={[styles.avatar, { width: size, height: size }]} />
      <View style={styles.copy}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.subline}>{subline}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  avatar: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  copy: {
    flex: 1,
  },
  headline: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  subline: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
