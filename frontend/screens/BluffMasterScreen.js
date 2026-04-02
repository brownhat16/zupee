import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { askBluff, guessBluff, startBluff } from "../api/client";
import ChatBubble from "../components/ChatBubble";
import PrimaryButton from "../components/PrimaryButton";

export default function BluffMasterScreen({ personality, onBack, onShowResult }) {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [guess, setGuess] = useState("");
  const [questionsLeft, setQuestionsLeft] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    startBluff(personality)
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
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [personality]);

  const handleAsk = async () => {
    if (!question.trim() || !sessionId) {
      return;
    }
    const nextQuestion = question.trim();
    setQuestion("");
    setMessages((current) => [...current, { id: `${Date.now()}-q`, sender: "user", text: nextQuestion }]);
    try {
      const response = await askBluff(sessionId, nextQuestion, personality);
      setQuestionsLeft(response.questions_left);
      setMessages((current) => [...current, { id: `${Date.now()}-a`, sender: "ai", text: response.answer }]);
    } catch (error) {
      setMessages((current) => [...current, { id: `${Date.now()}-e`, sender: "ai", text: "Ab sawaal band. Guess maar." }]);
    }
  };

  const handleGuess = async () => {
    if (!guess.trim() || !sessionId) {
      return;
    }
    const numericGuess = Number(guess);
    if (Number.isNaN(numericGuess)) {
      return;
    }
    setMessages((current) => [...current, { id: `${Date.now()}-guess`, sender: "user", text: `My guess: ${numericGuess}` }]);
    try {
      const response = await guessBluff(sessionId, numericGuess, personality);
      onShowResult({
        title: "Bluff Master",
        message: response.message,
        score: response.score,
        streak: response.streak,
      });
    } catch (error) {
      setMessages((current) => [...current, { id: `${Date.now()}-ge`, sender: "ai", text: "Guess process fail hua." }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bluff Master AI</Text>
      <Text style={styles.meta}>Questions left: {questionsLeft}</Text>
      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map((message) => (
          <ChatBubble key={message.id} text={message.text} sender={message.sender} />
        ))}
      </ScrollView>

      <TextInput
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
        placeholder="Ask a question..."
        placeholderTextColor="#5c647d"
        editable={!loading}
      />
      <PrimaryButton label="Ask AI" onPress={handleAsk} disabled={loading} />

      <TextInput
        style={styles.input}
        value={guess}
        onChangeText={setGuess}
        placeholder="Guess the number (1-50)"
        placeholderTextColor="#5c647d"
        keyboardType="number-pad"
        editable={!loading}
      />
      <PrimaryButton label="Guess Answer" onPress={handleGuess} variant="ghost" disabled={loading} />
      <PrimaryButton label="Back" onPress={onBack} variant="ghost" />
    </View>
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
