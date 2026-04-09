import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { askBluff, guessBluff, startBluff } from "../api/client";
import ChatBubble from "../components/ChatBubble";
import MotionFade from "../components/MotionFade";
import PrimaryButton from "../components/PrimaryButton";
import ScreenBackdrop from "../components/ScreenBackdrop";
import TypingIndicator from "../components/TypingIndicator";
import JayAvatar from "../components/JayAvatar";
import { theme } from "../theme";

export default function BluffMasterScreen({ personality, chatSessionId, onBack, onShowResult }) {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [guess, setGuess] = useState("");
  const [questionsLeft, setQuestionsLeft] = useState(5);
  const [isStarting, setIsStarting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStarterTips, setShowStarterTips] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setIsStarting(true);
    setShowStarterTips(true);
    startBluff(personality, chatSessionId)
      .then((data) => {
        if (!alive) {
          return;
        }
        setSessionId(data.session_id);
        setQuestionsLeft(data.questions_left);
        const nextMessages = [{ id: "intro", sender: "ai", text: data.intro }];
        if (data.starter_question) {
          nextMessages.push({ id: "starter-question", sender: "ai", text: data.starter_question });
        }
        setMessages(nextMessages);
      })
      .catch(() => {
        if (alive) {
          setMessages([{ id: "error", sender: "ai", text: "Bluff room load nahi hua. Backend check kar." }]);
        }
      })
      .finally(() => {
        if (alive) {
          setIsStarting(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [personality]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const isBusy = isStarting || isSubmitting;
  const canAsk = Boolean(sessionId) && !isBusy && questionsLeft > 0;
  const canGuess = Boolean(sessionId) && !isBusy;

  const handleAsk = async (overrideText = null) => {
    if (!sessionId || isBusy) {
      return;
    }
    if (!question.trim() && (overrideText === null || !overrideText.trim())) {
      return;
    }

    const nextQuestion = (overrideText ?? question).trim();
    if (!nextQuestion) {
      return;
    }
    if (questionsLeft <= 0) {
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-limit`, sender: "ai", text: "Questions khatam. Ab seedha guess maar." },
      ]);
      return;
    }

    setQuestion("");
    setMessages((current) => [...current, { id: `${Date.now()}-q`, sender: "user", text: nextQuestion }]);
    setShowStarterTips(false);
    Keyboard.dismiss();

    try {
      setIsSubmitting(true);
      Haptics.selectionAsync();
      const response = await askBluff(sessionId, nextQuestion, personality, chatSessionId);
      setQuestionsLeft(response.questions_left);
      setMessages((current) => [...current, { id: `${Date.now()}-a`, sender: "ai", text: response.answer }]);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-e`, sender: "ai", text: error.message || "Ab sawaal band. Guess maar." },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuess = async () => {
    if (!guess.trim() || !sessionId || isBusy) {
      return;
    }

    const numericGuess = Number(guess);
    if (Number.isNaN(numericGuess) || numericGuess < 1 || numericGuess > 50) {
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-invalid-guess`, sender: "ai", text: "Guess 1 se 50 ke beech ka number hona chahiye." },
      ]);
      return;
    }

    setGuess("");
    setMessages((current) => [...current, { id: `${Date.now()}-guess`, sender: "user", text: `My guess: ${numericGuess}` }]);
    setShowStarterTips(false);
    Keyboard.dismiss();
    try {
      setIsSubmitting(true);
      Haptics.selectionAsync();
      const response = await guessBluff(sessionId, numericGuess, personality, chatSessionId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onShowResult({
        title: "Bluff Master",
        message: response.message,
        score: response.score,
        streak: response.streak,
      });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-ge`, sender: "ai", text: error.message || "Guess process fail hua." },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
    >
      <ScreenBackdrop />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <MotionFade delay={40} offset={22}>
          <View style={styles.heroCard}>
            <JayAvatar
              headline="Jayyy joined your bluff room"
              subline="I’ll drop tips and keep the streak alive."
              size={52}
            />
            <Text style={styles.eyebrow}>MIND GAME MODE</Text>
            <Text style={styles.header}>Bluff Master</Text>
            <Text style={styles.helper}>
              Ask five yes/no questions, then commit to one guess. Product rule is explicit: clues may be true or false.
            </Text>
            <View style={styles.metricRow}>
              <View style={styles.metricPill}>
                <Text style={styles.metricLabel}>Questions left</Text>
                <Text style={styles.metricValue}>{questionsLeft}</Text>
              </View>
              <View style={styles.metricPill}>
                <Text style={styles.metricLabel}>Mode</Text>
                <Text style={styles.metricValue}>{personality === "chill" ? "Chill" : "Savage"}</Text>
              </View>
            </View>
          </View>
        </MotionFade>

        <MotionFade delay={90} offset={22}>
          <View style={styles.ruleCard}>
            <Text style={styles.ruleTitle}>Best prompt style</Text>
            <Text style={styles.ruleBody}>Use narrow yes/no checks like “is it even?”, “greater than 25?”, or “divisible by 3?”.</Text>
          </View>
        </MotionFade>

        <MotionFade delay={140} offset={22}>
          <View style={styles.chatShell}>
            <Text style={styles.sectionTitle}>Round feed</Text>
            <ScrollView
              ref={scrollViewRef}
              style={styles.chatArea}
              contentContainerStyle={styles.chatContent}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              onScroll={(event) => {
                const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
                const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
                setShowScrollButton(!isNearBottom && messages.length > 6);
              }}
              scrollEventThrottle={16}
            >
              {messages.map((message) => (
                <ChatBubble key={message.id} text={message.text} sender={message.sender} />
              ))}
            </ScrollView>
            {showScrollButton ? (
              <Pressable style={styles.scrollPill} onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
                <Text style={styles.scrollPillText}>Jump to latest</Text>
              </Pressable>
            ) : null}
          </View>
        </MotionFade>

        <MotionFade delay={190} offset={22}>
          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Ask the AI</Text>
            {showStarterTips && questionsLeft > 0 ? (
              <View style={styles.suggestionRow}>
                {["Is it even?", "Is it over 25?", "Is it divisible by 3?"].map((tip) => (
                  <Pressable
                    key={tip}
                    onPress={() => handleAsk(tip)}
                    style={({ pressed }) => [
                      styles.suggestionChip,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.suggestionText}>{tip}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <TextInput
              style={styles.input}
              value={question}
              onChangeText={setQuestion}
              placeholder={questionsLeft > 0 ? "Ask a yes/no question..." : "No questions left. Make your guess."}
              placeholderTextColor={theme.colors.textMuted}
              editable={canAsk}
            />
            <PrimaryButton
              label="Send Question"
              note={questionsLeft > 0 ? "Clarification prompts stay free when possible" : "Question limit reached"}
              onPress={handleAsk}
              disabled={!canAsk}
            />
          </View>
        </MotionFade>

        <MotionFade delay={240} offset={22}>
          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Make the final guess</Text>
            <TextInput
              style={styles.input}
              value={guess}
              onChangeText={setGuess}
              placeholder="Guess the number (1-50)"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
              editable={canGuess}
            />
            <PrimaryButton
              label="Lock Guess"
              note="One number only, between 1 and 50"
              onPress={handleGuess}
              variant="ghost"
              disabled={!canGuess}
            />
            {isBusy ? (
              <View style={styles.loadingRow}>
                <TypingIndicator
                  label={isStarting ? "Building the bluff round..." : "Resolving your move..."}
                  compact
                />
              </View>
            ) : null}
          </View>
        </MotionFade>

        <MotionFade delay={280} offset={18}>
          <PrimaryButton label="Back to Home" onPress={onBack} variant="ghost" disabled={isSubmitting} />
        </MotionFade>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 34,
  },
  heroCard: {
    backgroundColor: "rgba(16, 34, 44, 0.82)",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
  },
  eyebrow: {
    color: theme.colors.teal,
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
    marginTop: 10,
    lineHeight: 22,
  },
  metricRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  metricPill: {
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(6, 16, 22, 0.42)",
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },
  ruleCard: {
    marginTop: 16,
    backgroundColor: "rgba(244, 107, 69, 0.11)",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
  },
  ruleTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  ruleBody: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  chatShell: {
    marginTop: 16,
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
  chatArea: {
    maxHeight: 280,
  },
  chatContent: {
    paddingVertical: 8,
  },
  panel: {
    marginTop: 16,
    backgroundColor: "rgba(16, 34, 44, 0.76)",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
  },
  input: {
    backgroundColor: "rgba(6, 16, 22, 0.42)",
    color: theme.colors.text,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginLeft: 10,
  },
  scrollPill: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(244, 107, 69, 0.16)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scrollPillText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 12,
  },
  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
    marginTop: 2,
  },
  suggestionChip: {
    backgroundColor: "rgba(244, 107, 69, 0.16)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  suggestionText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
});
