import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import HomeScreen from "./screens/HomeScreen";
import CricketGameScreen from "./screens/CricketGameScreen";
import BluffMasterScreen from "./screens/BluffMasterScreen";
import ResultScreen from "./screens/ResultScreen";
import SplashScreen from "./screens/SplashScreen";
import { getStats } from "./api/client";
import { theme } from "./theme";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [stats, setStats] = useState({ score: 0, streak: 0 });
  const [personality, setPersonality] = useState("savage");
  const [resultPayload, setResultPayload] = useState(null);
  const [chatSessionId, setChatSessionId] = useState(null);

  useEffect(() => {
    requestAndScheduleReminder();

    const timer = setTimeout(() => {
      setScreen("home");
      refreshStats();
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const refreshStats = async () => {
    try {
      const nextStats = await getStats();
      setStats(nextStats);
    } catch (error) {
      setStats((current) => current);
    }
  };

  const requestAndScheduleReminder = async () => {
    if (!Device.isDevice) {
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Come back and play!",
        body: "Your streak is waiting. Jump into a round and keep it alive.",
      },
      trigger: { seconds: 60 * 60 * 24, repeats: false },
    });
  };

  const openResult = (payload) => {
    setResultPayload(payload);
    setStats({ score: payload.score, streak: payload.streak });
    setScreen("result");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {screen === "splash" && <SplashScreen />}
      {screen === "home" && (
        <HomeScreen
          stats={stats}
          personality={personality}
          chatSessionId={chatSessionId}
          onChatSessionChange={setChatSessionId}
          onPersonalityChange={setPersonality}
          onPlayCricket={() => setScreen("cricket")}
          onPlayBluff={() => setScreen("bluff")}
        />
      )}
      {screen === "cricket" && (
        <CricketGameScreen
          personality={personality}
          chatSessionId={chatSessionId}
          onBack={() => {
            refreshStats();
            setScreen("home");
          }}
          onShowResult={openResult}
        />
      )}
      {screen === "bluff" && (
        <BluffMasterScreen
          personality={personality}
          chatSessionId={chatSessionId}
          onBack={() => {
            refreshStats();
            setScreen("home");
          }}
          onShowResult={openResult}
        />
      )}
      {screen === "result" && (
        <ResultScreen
          result={resultPayload}
          onHome={() => {
            refreshStats();
            setScreen("home");
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
