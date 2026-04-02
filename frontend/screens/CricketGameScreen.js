import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { playCricket } from "../api/client";
import ChatBubble from "../components/ChatBubble";
import PrimaryButton from "../components/PrimaryButton";

export default function CricketGameScreen({ personality, onBack, onShowResult }) {
  const [messages, setMessages] = useState([
    { id: "intro", sender: "ai", text: "Next over runs? Dekhte hain tera cricket IQ kitna sharp hai." },
  ]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);

  const handlePick = async (choice) => {
    setLoading(true);
    setMessages((current) => [...current, { id: `${Date.now()}-pick`, sender: "user", text: choice }]);
    try {
      const result = await playCricket(choice, personality);
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
      <Text style={styles.header}>Cricket Prediction Battle</Text>
      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map((message) => (
          <ChatBubble key={message.id} text={message.text} sender={message.sender} />
        ))}
      </ScrollView>

      <Text style={styles.meta}>Live score {score ?? "--"}</Text>
      <PrimaryButton label="<6" onPress={() => handlePick("<6")} disabled={loading} />
      <PrimaryButton label="6-10" onPress={() => handlePick("6-10")} variant="ghost" disabled={loading} />
      <PrimaryButton label="10+" onPress={() => handlePick("10+")} variant="ghost" disabled={loading} />
      {pendingResult && <PrimaryButton label="View Result" onPress={() => onShowResult(pendingResult)} />}
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
    marginBottom: 12,
  },
  chatArea: {
    flex: 1,
    marginBottom: 12,
  },
  chatContent: {
    paddingVertical: 8,
  },
  meta: {
    color: "#96a0bd",
    marginBottom: 8,
    fontSize: 13,
    letterSpacing: 0.6,
  },
});
