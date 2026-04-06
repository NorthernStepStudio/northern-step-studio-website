import React from "react";
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { theme } from "../constants/theme";

export function FeedbackModal({
  visible,
  title = "Psychology Debrief",
  message,
  buttonLabel = "CONTINUE",
  onContinue
}: {
  visible: boolean;
  title?: string;
  message: string;
  buttonLabel?: string;
  onContinue: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {title.toUpperCase()}
          </Text>

          <Text style={styles.message}>
            {message}
          </Text>

          <Pressable
            onPress={onContinue}
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.9 : 1 }
            ]}
          >
            <Text style={styles.buttonText}>
              {buttonLabel.toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    padding: 32
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40
  },
  title: {
    color: theme.colors.accent,
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 24,
    letterSpacing: 2,
    fontFamily: "monospace"
  },
  message: {
    color: theme.colors.text,
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 40,
    fontWeight: "700"
  },
  button: {
    backgroundColor: theme.colors.text,
    paddingVertical: 20,
    borderRadius: 2,
    alignItems: "center"
  },
  buttonText: {
    color: theme.colors.bg,
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 1
  }
});
