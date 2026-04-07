import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { playCricket } from "../api/client";
import ChatBubble from "../components/ChatBubble";
import MotionFade from "../components/MotionFade";
import PrimaryButton from "../components/PrimaryButton";
import ScreenBackdrop from "../components/ScreenBackdrop";
import { theme } from "../theme";

export default function CricketGameScreen({ personality, chatSessionId, onBack, onShowResult }) {
  const [messages, setMessages] = useState([
    { id: "intro", sender: "ai", text: "Next over runs? Dekhte hain tera cricket IQ kitna sharp hai." },
  ]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [lastChoice, setLastChoice] = useState(null);

  const handlePick = async (choice) => {
    setLastChoice(choice);
    setLoading(true);
    setMessages((current) => [...current, { id: `${Date.now()}-pick`, sender: "user", text: choice }]);
    try {
      const result = await playCricket(choice, personality, chatSessionId);
      setScore(result.score);
      setPendingResult({
        title: "Cricket Battle",
        message: result.reaction,
        score: result.score,
        streak: result.streak,
      });
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-result`,
          sender: "ai",
          text: `Actual: ${result.actual_runs} runs (${result.actual_bucket}). ${result.reaction}`,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-error`, sender: "ai", text: "Backend so raha hai. Thoda server check kar." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MotionFade delay={40} offset={22}>
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>FAST READ MODE</Text>
            <Text style={styles.header}>Cricket Prediction</Text>
            <Text style={styles.helper}>
              Pick the run bucket you believe lands next, then see whether your read was clean or completely off.
            </Text>
            <View style={styles.statusRow}>
              <View style={styles.statusPill}>
                <Text style={styles.statusLabel}>Live score</Text>
                <Text style={styles.statusValue}>{score ?? "--"}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusLabel}>Last pick</Text>
                <Text style={styles.statusValue}>{lastChoice || "None"}</Text>
              </View>
            </View>
          </View>
        </MotionFade>

        <MotionFade delay={100} offset={22}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Choose a bucket</Text>
            <PrimaryButton
              label="<6"
              note="Play this when you expect a low run burst"
              onPress={() => handlePick("<6")}
              disabled={loading}
            />
            <PrimaryButton
              label="6-10"
              note="Balanced call when you want the most natural bucket"
              onPress={() => handlePick("6-10")}
              variant="tint"
              disabled={loading}
            />
            <PrimaryButton
              label="10+"
              note="High-risk call for a bigger swing"
              onPress={() => handlePick("10+")}
              variant="ghost"
              disabled={loading}
            />
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={theme.colors.teal} />
                <Text style={styles.loadingText}>Reading the over and locking the result...</Text>
              </View>
            ) : null}
          </View>
        </MotionFade>

        <MotionFade delay={160} offset={22}>
          <View style={styles.chatShell}>
            <Text style={styles.sectionTitle}>Round feed</Text>
            <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
              {messages.map((message) => (
                <ChatBubble key={message.id} text={message.text} sender={message.sender} />
              ))}
            </ScrollView>
          </View>
        </MotionFade>

        {pendingResult ? (
          <MotionFade delay={200} offset={18}>
            <View style={styles.resultPreview}>
              <Text style={styles.previewTitle}>Result ready</Text>
              <Text style={styles.previewText}>You’ve got a resolved round and updated score. Jump in when you want the summary view.</Text>
              <PrimaryButton label="View Result" onPress={() => onShowResult(pendingResult)} />
            </View>
          </MotionFade>
        ) : null}

        <MotionFade delay={220} offset={18}>
          <PrimaryButton label="Back to Home" onPress={onBack} variant="ghost" disabled={loading} />
        </MotionFade>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: "rgba(16, 34, 44, 0.82)",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
  },
  eyebrow: {
    color: theme.colors.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  header: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 10,
  },
  helper: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  statusRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  statusPill: {
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(6, 16, 22, 0.42)",
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  statusValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },
  sectionCard: {
    marginTop: 18,
    backgroundColor: "rgba(16, 34, 44, 0.76)",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  loadingText: {
    color: theme.colors.textMuted,
    marginLeft: 10,
    fontSize: 13,
  },
  chatShell: {
    marginTop: 18,
    backgroundColor: "rgba(16, 34, 44, 0.76)",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
  },
  chatArea: {
    maxHeight: 280,
  },
  chatContent: {
    paddingVertical: 8,
  },
  resultPreview: {
    marginTop: 18,
    backgroundColor: "rgba(244, 107, 69, 0.11)",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
  },
  previewTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  previewText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});
