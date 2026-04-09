import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

export default function JayDock({ messages = [] }) {
  const lastAiMessage = useMemo(() => {
    const reversed = [...messages].reverse();
    const aiMsg = reversed.find((m) => m.sender === "ai");
    return aiMsg?.text || "Jayyy is standing by.";
  }, [messages]);

  return (
    <View style={styles.dock}>
      <Image source={require("../assets/jayyy-bot.png")} style={styles.avatar} />
      <View style={styles.bubble}>
        <Text style={styles.name}>Jayyy</Text>
        <Text style={styles.message} numberOfLines={3}>
          {lastAiMessage}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "20%",
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    pointerEvents: "none",
  },
  avatar: {
    width: 80,
    height: 110,
    resizeMode: "contain",
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(9, 20, 27, 0.92)",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(121, 224, 200, 0.5)",
  },
  name: {
    color: theme.colors.teal,
    fontWeight: "900",
    fontSize: 13,
    marginBottom: 4,
  },
  message: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
});
