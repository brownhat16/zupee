import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

export default function ChatBubble({ text, sender = "ai" }) {
  const isUser = sender === "user";
  return (
    <View style={[styles.wrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.sender, isUser ? styles.userSender : styles.aiSender]}>
          {isUser ? "You" : "GameBuddy"}
        </Text>
        <Text style={[styles.text, isUser && styles.userText]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    width: "100%",
  },
  aiWrapper: {
    alignItems: "flex-start",
  },
  userWrapper: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "84%",
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  aiBubble: {
    backgroundColor: "rgba(16, 34, 44, 0.9)",
    borderTopLeftRadius: 8,
  },
  userBubble: {
    backgroundColor: theme.colors.teal,
    borderTopRightRadius: 8,
  },
  text: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: theme.colors.backgroundDeep,
  },
  sender: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  aiSender: {
    color: theme.colors.textMuted,
  },
  userSender: {
    color: "#114B3C",
  },
});
