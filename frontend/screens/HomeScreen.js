import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import PrimaryButton from "../components/PrimaryButton";
import ScreenBackdrop from "../components/ScreenBackdrop";
import StatsCard from "../components/StatsCard";
import { sendChat } from "../api/client";
import { theme } from "../theme";

export default function HomeScreen({
  stats,
  personality,
  chatSessionId,
  onChatSessionChange,
  onPersonalityChange,
  onPlayCricket,
  onPlayBluff,
}) {
  const [greeting, setGreeting] = useState("Yo player, mood set kar. Kya todna hai aaj?");
  const [isGreetingLoading, setIsGreetingLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setIsGreetingLoading(true);
    sendChat(
      "Give me a short welcome line for the home screen.",
      personality,
      chatSessionId,
      {
        screen: "home",
        score: stats.score,
        streak: stats.streak,
        games_played: stats.games_played ?? 0,
      },
    )
      .then((data) => {
        if (alive) {
          setGreeting(data.reply);
          setIsGreetingLoading(false);
          if (data.session_id) {
            onChatSessionChange(data.session_id);
          }
        }
      })
      .catch(() => {
        if (alive) {
          setGreeting("Yo player, mood set kar. Kya todna hai aaj?");
          setIsGreetingLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [personality]);

  return (
    <View style={styles.screen}>
      <ScreenBackdrop />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>LIVE PRODUCT</Text>
          <Text style={styles.title}>Choose your next quick-hit game.</Text>
          <View style={styles.greetingCard}>
            {isGreetingLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={theme.colors.teal} />
                <Text style={styles.loadingText}>Setting the tone for this session...</Text>
              </View>
            ) : (
              <Text style={styles.greeting}>{greeting}</Text>
            )}
          </View>
          <Text style={styles.subcopy}>
            Two live modes, one shared scoreboard, and fast rounds that make sense on mobile.
          </Text>
        </View>

        <StatsCard
          score={stats.score}
          streak={stats.streak}
          gamesPlayed={stats.games_played ?? 0}
        />

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Pick the AI tone</Text>
          <Text style={styles.panelBody}>Choose whether the assistant sounds sharper or calmer across the whole session.</Text>
          <View style={styles.toggleRow}>
            <PrimaryButton
              label="Savage"
              note="Sharper copy and higher heat"
              onPress={() => onPersonalityChange("savage")}
              variant={personality === "savage" ? "solid" : "ghost"}
            />
            <PrimaryButton
              label="Chill"
              note="Cleaner guidance and softer tone"
              onPress={() => onPersonalityChange("chill")}
              variant={personality === "chill" ? "solid" : "ghost"}
            />
          </View>
        </View>

        <View style={styles.catalogHeader}>
          <Text style={styles.sectionTitle}>Playable right now</Text>
          <Text style={styles.sectionBody}>Pick a game in one tap. Each card tells you exactly what kind of round you’re getting.</Text>
        </View>

        <View style={[styles.gameCard, styles.cricketCard]}>
          <Text style={styles.gameEyebrow}>Fast Read</Text>
          <Text style={styles.gameTitle}>Cricket Prediction</Text>
          <Text style={styles.gameBody}>
            Predict which run bucket lands next. Shortest path to a result, strongest fit when you want a quick win-or-miss moment.
          </Text>
          <View style={styles.tagRow}>
            <Text style={styles.tag}>10-point upside</Text>
            <Text style={styles.tag}>Instant reveal</Text>
          </View>
          <PrimaryButton
            label="Start Cricket Prediction"
            note="Pick <6, 6-10, or 10+"
            onPress={onPlayCricket}
          />
        </View>

        <View style={[styles.gameCard, styles.bluffCard]}>
          <Text style={styles.gameEyebrow}>Mind Game</Text>
          <Text style={styles.gameTitle}>Bluff Master</Text>
          <Text style={styles.gameBody}>
            Ask up to five yes/no questions and then guess the hidden number. The rule is explicit: clues may mislead you.
          </Text>
          <View style={styles.ruleCard}>
            <Text style={styles.ruleLabel}>Rule</Text>
            <Text style={styles.ruleText}>The AI’s clues may be true or false, so cross-check before you commit.</Text>
          </View>
          <PrimaryButton
            label="Start Bluff Master"
            note="Best when you want a slower, smarter round"
            onPress={onPlayBluff}
            variant="ghost"
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{stats.scope_label || "Shared deployment stats"}</Text>
          <Text style={styles.infoBody}>
            {stats.scope_description || "These stats are shared across the current deployed API instance."}
          </Text>
          <Text style={styles.infoFoot}>
            {stats.reset_behavior || "Reset depends on backend storage, not on this device alone."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "rgba(16, 34, 44, 0.82)",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
  },
  kicker: {
    color: theme.colors.coral,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 36,
    fontWeight: "900",
    marginTop: 14,
    lineHeight: 40,
  },
  greetingCard: {
    marginTop: 18,
    backgroundColor: "rgba(6, 16, 22, 0.48)",
    borderRadius: theme.radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  greeting: {
    color: theme.colors.textSoft,
    fontSize: 16,
    lineHeight: 24,
  },
  subcopy: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: theme.colors.textMuted,
    marginLeft: 10,
    fontSize: 14,
  },
  panel: {
    backgroundColor: "rgba(16, 34, 44, 0.76)",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  panelBody: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  toggleRow: {
    marginTop: 12,
  },
  catalogHeader: {
    marginTop: 26,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  sectionBody: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  gameCard: {
    marginTop: 16,
    borderRadius: theme.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cricketCard: {
    backgroundColor: "rgba(244, 107, 69, 0.11)",
  },
  bluffCard: {
    backgroundColor: "rgba(121, 224, 200, 0.11)",
  },
  gameEyebrow: {
    color: theme.colors.gold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontWeight: "800",
  },
  gameTitle: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 8,
  },
  gameBody: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
    marginBottom: 10,
  },
  tag: {
    color: theme.colors.text,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: "700",
  },
  ruleCard: {
    backgroundColor: "rgba(6, 16, 22, 0.42)",
    borderRadius: theme.radius.md,
    padding: 14,
    marginTop: 14,
    marginBottom: 10,
  },
  ruleLabel: {
    color: theme.colors.coral,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  ruleText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  infoCard: {
    marginTop: 18,
    backgroundColor: "rgba(16, 34, 44, 0.74)",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
  },
  infoTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  infoBody: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  infoFoot: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
});
