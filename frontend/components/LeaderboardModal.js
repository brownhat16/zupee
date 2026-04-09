import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import { getLeaderboard } from "../api/client";
import { theme } from "../theme";
import TypingIndicator from "./TypingIndicator";

const screenHeight = Dimensions.get("window").height;

export default function LeaderboardModal({ visible, onClose, prefetchedEntries = [] }) {
  const [entries, setEntries] = useState(prefetchedEntries);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.selectionAsync();
      Animated.timing(slide, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
      fetchLeaderboard();
    } else {
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slide]);

  useEffect(() => {
    if (prefetchedEntries.length) {
      setEntries(prefetchedEntries);
    }
  }, [prefetchedEntries]);

  const fetchLeaderboard = async () => {
    if (!visible && entries.length) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard();
      setEntries(data.entries || []);
    } catch (err) {
      setError(err.message || "Could not load leaderboard.");
    } finally {
      setLoading(false);
    }
  };

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * 0.5, 0],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Leaderboard</Text>
              <Text style={styles.subtitle}>Top 10 global slots. We merged in your live stats.</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closePill}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingZone}>
              <TypingIndicator label="Fetching ranks..." />
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!loading ? (
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {entries.map((entry) => (
                <View
                  key={`${entry.name}-${entry.rank}`}
                  style={[styles.row, entry.is_user && styles.userRow]}
                >
                  <View style={[styles.badge, entry.rank <= 3 && styles.topBadge]}>
                    <Text style={styles.badgeText}>{entry.rank}</Text>
                  </View>
                  <View style={styles.meta}>
                    <Text style={[styles.name, entry.is_user && styles.userName]}>{entry.name}</Text>
                    <Text style={styles.metaLine}>
                      Score {entry.score} · {entry.games_played || 0} rounds
                    </Text>
                  </View>
                  <View style={styles.streakPill}>
                    <Text style={styles.streakText}>🔥 {entry.streak || 0}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    paddingTop: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: "#0b1923",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    elevation: 16,
  },
  handle: {
    width: 60,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  closePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  closeText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  loadingZone: {
    paddingVertical: 12,
  },
  errorText: {
    color: theme.colors.coral,
    marginBottom: 8,
  },
  list: {
    maxHeight: screenHeight * 0.5,
  },
  listContent: {
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: theme.radius.md,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  userRow: {
    borderColor: theme.colors.teal,
    backgroundColor: "rgba(20, 116, 111, 0.12)",
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginRight: 12,
  },
  topBadge: {
    backgroundColor: "rgba(244, 107, 69, 0.18)",
  },
  badgeText: {
    color: theme.colors.text,
    fontWeight: "900",
  },
  meta: {
    flex: 1,
  },
  name: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  userName: {
    color: theme.colors.teal,
  },
  metaLine: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  streakPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(244, 107, 69, 0.16)",
    borderRadius: theme.radius.pill,
  },
  streakText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 12,
  },
});
