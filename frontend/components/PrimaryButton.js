import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export default function PrimaryButton({ label, onPress, variant = "solid", disabled = false }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        variant === "ghost" ? styles.ghostButton : styles.solidButton,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginVertical: 6,
  },
  solidButton: {
    backgroundColor: "#8cf7c5",
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: "#2e3242",
    backgroundColor: "#121521",
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    color: "#07110d",
    fontWeight: "800",
    fontSize: 15,
    textAlign: "center",
  },
  ghostLabel: {
    color: "#f5f7ff",
  },
});
