import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

export default function PrimaryButton({
  label,
  onPress,
  variant = "solid",
  disabled = false,
  note = null,
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "ghost" && styles.ghostButton,
        variant === "tint" && styles.tintButton,
        variant === "solid" && styles.solidButton,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View>
        <Text
          style={[
            styles.label,
            variant !== "solid" && styles.ghostLabel,
          ]}
        >
          {label}
        </Text>
        {note ? (
          <Text
            style={[
              styles.note,
              variant === "solid" ? styles.solidNote : styles.ghostNote,
            ]}
          >
            {note}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.md,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  solidButton: {
    backgroundColor: theme.colors.teal,
  },
  ghostButton: {
    backgroundColor: "rgba(16, 34, 44, 0.86)",
  },
  tintButton: {
    backgroundColor: "rgba(242, 199, 110, 0.12)",
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  label: {
    color: theme.colors.backgroundDeep,
    fontWeight: "800",
    fontSize: 15,
  },
  ghostLabel: {
    color: theme.colors.text,
  },
  note: {
    fontSize: 12,
    marginTop: 3,
  },
  solidNote: {
    color: "#13382E",
  },
  ghostNote: {
    color: theme.colors.textMuted,
  },
});
