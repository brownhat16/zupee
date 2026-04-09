import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import { playCricket } from "../api/client";
import ChatBubble from "../components/ChatBubble";
import MotionFade from "../components/MotionFade";
import PrimaryButton from "../components/PrimaryButton";
import ScreenBackdrop from "../components/ScreenBackdrop";
import TypingIndicator from "../components/TypingIndicator";
import JayAvatar from "../components/JayAvatar";
import VersusBanner from "../components/VersusBanner";
import JayDock from "../components/JayDock";
import BackButton from "../components/BackButton";
import { theme } from "../theme";

export default function CricketGameScreen({ personality, chatSessionId, onBack, onShowResult }) {
  const [messages, setMessages] = useState([
    { id: "intro", sender: "ai", text: "Next over runs? Dekhte hain tera cricket IQ kitna sharp hai." },
  ]);
  const chatRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [lastChoice, setLastChoice] = useState(null);
  const [jayyyLastChoice, setJayyyLastChoice] = useState(null);
  const [lastLatency, setLastLatency] = useState(null);
  const [payoutInfo, setPayoutInfo] = useState(null);
  const [coachNote, setCoachNote] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [actualRuns, setActualRuns] = useState(null);
  const [actualBucket, setActualBucket] = useState(null);

  useEffect(() => {
    chatRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handlePick = async (choice) => {
    Haptics.selectionAsync();
    
    // Generate Jayyy's pick instantly on the client to solve latency blocking
    const options = ["<6", "6-10", "10+"];
    const instantJayyyChoice = options[Math.floor(Math.random() * options.length)];
    
    setLastChoice(choice);
    setJayyyLastChoice(instantJayyyChoice);
    setLoading(true);
    setMessages((current) => [...current, { id: `${Date.now()}-pick`, sender: "user", text: choice }]);
    try {
      setErrorMessage(null);
      const result = await playCricket(choice, instantJayyyChoice, personality, chatSessionId);
      setScore(result.score);
      setPendingResult({
        title: "Cricket Battle",
        message: result.reaction,
        score: result.score,
        streak: result.streak,
        payout_base: result.payout_base,
        payout_multiplier: result.payout_multiplier,
        latency_ms: result.latency_ms,
      });
      setActualRuns(result.actual_runs);
      setActualBucket(result.actual_bucket);
      // Intentionally not overwriting jayyyLastChoice with result.jayyy_choice to prevent UI flicker
      setLastLatency(result.latency_ms);
      setPayoutInfo({
        base: result.payout_base,
        multiplier: result.payout_multiplier || 1,
        delta: result.score_delta,
        streak: result.streak,
      });
      setCoachNote(
        result.win
          ? "You read the over right. Staying on the same bucket is reasonable unless odds shift."
          : result.actual_bucket === "10+"
          ? "Over just spiked. Consider mid bucket 6-10 for a safer bounce-back."
          : "Try mixing in <6 for dot-ball bursts if pace looks tight.",
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-result`,
          sender: "ai",
          text: `Jayyy: ${result.reaction}\nActual: ${result.actual_runs} runs (${result.actual_bucket})\nYour pick: ${choice}\nJayyy's pick: ${instantJayyyChoice}`,
        },
        ...(result.streak_save_offer
          ? [
              {
                id: `${Date.now()}-streak-offer`,
                sender: "ai",
                text: `Streak safety available: watch an ad or pay 50 coins to keep streak ${result.streak_save_offer.streak_before_loss}.`,
              },
            ]
          : []),
      ]);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(error.message || "Backend so raha hai. Thoda server check kar.");
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
            <BackButton onPress={onBack} />
            <JayAvatar
              headline="Jayyy is in this over with you"
              subline="I’ll track streaks and cue rematches."
              size={52}
            />
            <Text style={styles.eyebrow}>FAST READ MODE</Text>
            <Text style={styles.header}>Cricket Prediction</Text>
            <Text style={styles.helper}>
              Pick the run bucket you believe lands next, then see whether your read was clean or completely off.
            </Text>
            <View style={{ marginTop: 14 }}>
              <VersusBanner
                leftLabel="You"
                rightLabel="Jayyy"
                score={score !== null ? `${score}` : "--"}
                centerLabel="CURRENT SCORE"
              />
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusPill}>
                <Text style={styles.statusLabel}>Your pick</Text>
                <Text style={styles.statusValue}>{lastChoice || "--"}</Text>
              </View>
              <View style={[styles.statusPill, styles.actualPill]}>
                <Text style={[styles.statusLabel, { color: theme.colors.gold }]}>Actual</Text>
                <Text style={[styles.statusValue, { color: theme.colors.gold }]}>
                  {actualRuns !== null ? `${actualRuns} (${actualBucket ?? "--"})` : "--"}
                </Text>
              </View>
              <View style={[styles.statusPill, { borderColor: theme.colors.coral }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.coral }]}>Jayyy's pick</Text>
                <Text style={[styles.statusValue, { color: theme.colors.coral }]}>{jayyyLastChoice || "--"}</Text>
              </View>
            </View>
          </View>
        </MotionFade>

        <MotionFade delay={100} offset={22}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Choose a bucket</Text>
            <Text style={styles.payoutLegend}>
              Risk/Reward: 6-10 = +5 · {"<6"} = +10 · 10+ = +20. Streak 3+ doubles wins.
            </Text>
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
                <TypingIndicator label="Reading the over and locking the result..." compact />
              </View>
            ) : null}
            {payoutInfo ? (
              <View style={styles.payoutRow}>
                <Text style={styles.payoutText}>
                  Last: {payoutInfo.delta > 0 ? "+" : ""}{payoutInfo.delta} (base {payoutInfo.base} ×{" "}
                  {payoutInfo.multiplier}) · Streak {payoutInfo.streak}
                </Text>
              </View>
            ) : null}
            {actualRuns !== null ? (
              <View style={styles.actualBox}>
                <Text style={styles.actualLabel}>Actual runs</Text>
                <Text style={styles.actualValue}>{actualRuns} ({actualBucket})</Text>
                <Text style={styles.actualHint}>Compare this to your pick to see the gap.</Text>
              </View>
            ) : null}
          </View>
        </MotionFade>

        <MotionFade delay={160} offset={22}>
          <View style={styles.chatShell}>
            <Text style={styles.sectionTitle}>Round feed</Text>
            <ScrollView
              ref={chatRef}
              style={styles.chatArea}
              contentContainerStyle={styles.chatContent}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => chatRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((message) => (
                <ChatBubble key={message.id} text={message.text} sender={message.sender} />
              ))}
            </ScrollView>
            {errorMessage ? (
              <View style={styles.errorRow}>
                <Text style={styles.errorText}>{errorMessage}</Text>
                <PrimaryButton
                  label="Retry last pick"
                  onPress={() => handlePick(lastChoice || "6-10")}
                  variant="ghost"
                  disabled={loading}
                />
              </View>
            ) : null}
          </View>
        </MotionFade>

        {pendingResult ? (
          <MotionFade delay={200} offset={18}>
            <View style={styles.resultPreview}>
              <Text style={styles.previewTitle}>Result ready</Text>
              <Text style={styles.previewText}>
                You’ve got a resolved round and updated score. Jump in when you want the summary view.
              </Text>
              {pendingResult.payout_base ? (
                <Text style={styles.previewMeta}>
                  Payout {pendingResult.payout_base} × {pendingResult.payout_multiplier || 1} | Latency{" "}
                  {pendingResult.latency_ms ?? "--"} ms
                </Text>
              ) : null}
              {coachNote ? <Text style={styles.previewCoach}>{coachNote}</Text> : null}
              <PrimaryButton label="View Result" onPress={() => onShowResult(pendingResult)} />
              <PrimaryButton
                label="Play another over"
                note="Rematch quickly with warm odds"
                onPress={() => handlePick(lastChoice || "6-10")}
                variant="ghost"
                disabled={loading}
              />
            </View>
          </MotionFade>
        ) : null}

        <MotionFade delay={220} offset={18}>
          <PrimaryButton label="Back to Home" onPress={onBack} variant="ghost" disabled={loading} />
        </MotionFade>
      </ScrollView>
      <JayDock messages={messages} />
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
    paddingBottom: 220, // reserve space for JayDock overlay
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
  actualPill: {
    backgroundColor: "rgba(242, 199, 110, 0.12)",
    borderColor: theme.colors.gold,
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
  payoutLegend: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  payoutRow: {
    marginTop: 10,
    padding: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(244, 107, 69, 0.14)",
  },
  payoutText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  actualBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(121, 224, 200, 0.1)",
  },
  actualLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "800",
  },
  actualValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },
  actualHint: {
    color: theme.colors.textSoft,
    fontSize: 12,
    marginTop: 4,
  },
  errorRow: {
    marginTop: 12,
    padding: 12,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(255, 143, 122, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 143, 122, 0.5)",
    gap: 8,
  },
  errorText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
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
  previewMeta: {
    color: theme.colors.text,
    fontSize: 13,
    marginTop: 6,
    fontWeight: "700",
  },
  previewCoach: {
    color: theme.colors.textSoft,
    fontSize: 13,
    marginTop: 6,
  },
});
