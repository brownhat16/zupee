import React from "react";
import { StyleSheet, View } from "react-native";
import Markdown from "react-native-markdown-display";

import { theme } from "../theme";

export default function ChatBubble({ text, sender = "ai" }) {
  const isUser = sender === "user";
  return (
    <View style={[styles.wrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Markdown
          style={isUser ? markdownUserStyles : markdownAIStyles}
          mergeStyle
        >
          {`**${isUser ? "You" : "GameBuddy"}**\n${text}`}
        </Markdown>
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
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  aiSender: {
    color: theme.colors.textMuted,
  },
  userSender: {
    color: "#114B3C",
  },
});

const markdownBase = {
  body: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  strong: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 4,
    fontWeight: "800",
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
  listUnorderedItemText: {
    color: theme.colors.text,
  },
  bullet_list: {
    marginTop: 4,
    marginBottom: 0,
  },
};

const markdownAIStyles = StyleSheet.create({
  ...markdownBase,
  strong: {
    ...markdownBase.strong,
    color: theme.colors.textMuted,
  },
});

const markdownUserStyles = StyleSheet.create({
  ...markdownBase,
  body: {
    ...markdownBase.body,
    color: theme.colors.backgroundDeep,
  },
  strong: {
    ...markdownBase.strong,
    color: "#114B3C",
  },
});
