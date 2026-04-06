import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./screens/HomeScreen";
import CricketGameScreen from "./screens/CricketGameScreen";
import BluffMasterScreen from "./screens/BluffMasterScreen";
import ResultScreen from "./screens/ResultScreen";
import SplashScreen from "./screens/SplashScreen";
import { getStats } from "./api/client";
import { theme } from "./theme";

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [stats, setStats] = useState({ score: 0, streak: 0 });
  const [personality, setPersonality] = useState("savage");
  const [resultPayload, setResultPayload] = useState(null);
  const [chatSessionId, setChatSessionId] = useState(null);

  useEffect(() => {
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
