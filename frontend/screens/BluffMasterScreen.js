import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { askBluff, guessBluff, startBluff } from "../api/client";
import ChatBubble from "../components/ChatBubble";
import PrimaryButton from "../components/PrimaryButton";

export default function BluffMasterScreen({ personality, chatSessionId, onBack, onShowResult }) {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [guess, setGuess] = useState("");
  const [questionsLeft, setQuestionsLeft] = useState(5);
  const [isStarting, setIsStarting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setIsStarting(true);
    startBluff(personality, chatSessionId)
      .then((data) => {
        if (!alive) {
          return;
        }
        setSessionId(data.session_id);
        setQuestionsLeft(data.questions_left);
        setMessages([{ id: "intro", sender: "ai", text: data.intro }]);
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

  const handleAsk = async () => {
    if (!question.trim() || !sessionId || isBusy) {
      return;
    }
    if (questionsLeft <= 0) {
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-limit`, sender: "ai", text: "Questions khatam. Ab seedha guess maar." },
      ]);
      return;
    }

    const nextQuestion = question.trim();
    setQuestion("");
    setMessages((current) => [...current, { id: `${Date.now()}-q`, sender: "user", text: nextQuestion }]);

    try {
      setIsSubmitting(true);
      const response = await askBluff(sessionId, nextQuestion, personality, chatSessionId);
      setQuestionsLeft(response.questions_left);
      setMessages((current) => [...current, { id: `${Date.now()}-a`, sender: "ai", text: response.answer }]);
    } catch (error) {
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
    try {
      setIsSubmitting(true);
      const response = await guessBluff(sessionId, numericGuess, personality, chatSessionId);
      onShowResult({
        title: "Bluff Master",
        message: response.message,
        score: response.score,
        streak: response.streak,
      });
    } catch (error) {
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
      <Text style={styles.header}>Bluff Master AI</Text>
      <Text style={styles.meta}>Questions left: {questionsLeft}</Text>
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} text={message.text} sender={message.sender} />
        ))}
      </ScrollView>

      <TextInput
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
        placeholder={questionsLeft > 0 ? "Ask a question..." : "No questions left. Make your guess."}
        placeholderTextColor="#5c647d"
        editable={canAsk}
      />
      <PrimaryButton label="Ask AI" onPress={handleAsk} disabled={!canAsk} />

      <TextInput
        style={styles.input}
        value={guess}
        onChangeText={setGuess}
        placeholder="Guess the number (1-50)"
        placeholderTextColor="#5c647d"
        keyboardType="number-pad"
        editable={canGuess}
      />
      <PrimaryButton label="Guess Answer" onPress={handleGuess} variant="ghost" disabled={!canGuess} />
      <PrimaryButton label="Back" onPress={onBack} variant="ghost" disabled={isSubmitting} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#07070c",
  },
  header: {
    color: "#f7f8fc",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 12,
  },
  meta: {
    color: "#96a0bd",
    marginTop: 8,
    marginBottom: 12,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 8,
  },
  input: {
    backgroundColor: "#10131d",
    color: "#f7f8fc",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#212637",
  },
});
