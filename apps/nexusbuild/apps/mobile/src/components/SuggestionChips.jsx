import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Suggestion chips component for quick replies and contextual suggestions
 */
export default function SuggestionChips({ suggestions, onPress }) {
  const { theme } = useTheme();
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const handlePress = (suggestion) => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
        () => {},
      );
    }
    if (typeof onPress === "function") {
      try {
        const result = onPress(suggestion);
        void Promise.resolve(result).catch((error) => {
          console.warn("Suggestion tap failed:", error);
        });
      } catch (error) {
        console.warn("Suggestion tap failed:", error);
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      marginVertical: theme.spacing.sm,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    chipWrapper: {
      borderRadius: theme.borderRadius.full,
      overflow: "hidden",
    },
    chip: {
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.glassBorder,
    },
    chipInner: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: `${theme.colors.glassBg}80`,
    },
    chipText: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.sm,
      fontWeight: "500",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(suggestion)}
            style={styles.chipWrapper}
            activeOpacity={0.7}
          >
            <View style={styles.chip}>
              <View style={styles.chipInner}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {suggestion}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
