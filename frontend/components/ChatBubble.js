import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ChatBubble({ text, sender = "ai" }) {
  const isUser = sender === "user";
  return (
    <View style={[styles.wrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
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
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  aiBubble: {
    backgroundColor: "#171a27",
    borderTopLeftRadius: 6,
  },
  userBubble: {
    backgroundColor: "#8cf7c5",
    borderTopRightRadius: 6,
  },
  text: {
    color: "#f2f5ff",
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: "#07110d",
  },
});
