import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import PrimaryButton from "../components/PrimaryButton";
import StatsCard from "../components/StatsCard";
import { sendChat } from "../api/client";

export default function HomeScreen({
  stats,
  personality,
  onPersonalityChange,
  onPlayCricket,
  onPlayBluff,
}) {
  const [greeting, setGreeting] = useState("Yo player, mood set kar. Kya todna hai aaj?");

  useEffect(() => {
    let alive = true;
    sendChat("Give me a short welcome line for the home screen.", personality)
      .then((data) => {
        if (alive) {
          setGreeting(data.reply);
        }
      })
      .catch(() => {
        if (alive) {
          setGreeting("Yo player, mood set kar. Kya todna hai aaj?");
        }
      });

    return () => {
      alive = false;
    };
  }, [personality]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>GAME ON</Text>
      <Text style={styles.title}>GameBuddy AI</Text>
      <Text style={styles.greeting}>{greeting}</Text>

      <StatsCard score={stats.score} streak={stats.streak} />

      <View style={styles.toggleRow}>
        <PrimaryButton
          label="Savage"
          onPress={() => onPersonalityChange("savage")}
          variant={personality === "savage" ? "solid" : "ghost"}
        />
        <PrimaryButton
          label="Chill"
          onPress={() => onPersonalityChange("chill")}
          variant={personality === "chill" ? "solid" : "ghost"}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pick your chaos</Text>
        <PrimaryButton label="Play Cricket Battle" onPress={onPlayCricket} />
        <PrimaryButton label="Play Bluff Master" onPress={onPlayBluff} variant="ghost" />
      </View>

      <View style={styles.leaderboard}>
        <Text style={styles.sectionTitle}>Dummy leaderboard</Text>
        <Text style={styles.boardText}>1. You - {stats.score} pts</Text>
        <Text style={styles.boardText}>2. AI Haters Club - 88 pts</Text>
        <Text style={styles.boardText}>3. Lucky Noobs - 64 pts</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 32,
    backgroundColor: "#07070c",
  },
  kicker: {
    color: "#ff7b72",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: "#f7f8fc",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 12,
  },
  greeting: {
    color: "#a8b0c8",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    color: "#f7f8fc",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  leaderboard: {
    marginTop: 26,
    backgroundColor: "#10131d",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#212637",
  },
  boardText: {
    color: "#aeb5ca",
    fontSize: 14,
    marginTop: 8,
  },
});
