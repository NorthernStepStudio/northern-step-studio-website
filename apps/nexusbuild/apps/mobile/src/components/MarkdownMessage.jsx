import React from "react";
import { View, Text, StyleSheet, Platform, Linking } from "react-native";
import Markdown from "react-native-markdown-display";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Markdown message component for rendering formatted chat messages
 * Includes custom link handling that works on both web and mobile
 */
export default function MarkdownMessage(props) {
  const { content, onLinkPress } = props;
  const { theme } = useTheme();

  const markdownStyles = {
    // Body text
    body: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.base,
      lineHeight: 20,
      letterSpacing: -0.1,
    },

    // Headings
    heading1: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    heading2: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.base,
      fontWeight: "700",
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    heading3: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.base,
      fontWeight: "700",
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },

    // Paragraphs
    paragraph: {
      marginTop: 0,
      marginBottom: theme.spacing.xs,
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.base,
      lineHeight: 20,
    },

    // Lists
    bullet_list: {
      marginBottom: theme.spacing.xs,
    },
    ordered_list: {
      marginBottom: theme.spacing.xs,
    },
    list_item: {
      marginBottom: 2,
      flexDirection: "row",
    },
    bullet_list_icon: {
      color: theme.colors.accentPrimary,
      fontSize: theme.fontSize.base,
      marginRight: theme.spacing.xs,
    },
    ordered_list_icon: {
      color: theme.colors.accentPrimary,
      fontSize: theme.fontSize.base,
      marginRight: theme.spacing.xs,
    },

    // Code
    code_inline: {
      backgroundColor: theme.colors.glassBg,
      borderWidth: 1,
      borderColor: theme.colors.glassBorder,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontFamily: "monospace",
      fontSize: theme.fontSize.sm,
      color: theme.colors.accentPrimary,
    },
    code_block: {
      backgroundColor: theme.colors.glassBg,
      borderWidth: 1,
      borderColor: theme.colors.glassBorder,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginVertical: theme.spacing.xs,
    },
    fence: {
      backgroundColor: theme.colors.glassBg,
      borderWidth: 1,
      borderColor: theme.colors.glassBorder,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginVertical: theme.spacing.xs,
    },

    // Tables
    table: {
      borderWidth: 1,
      borderColor: theme.colors.glassBorder,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.xs,
    },
    thead: {
      backgroundColor: theme.colors.glassBg,
    },
    tbody: {},
    th: {
      padding: theme.spacing.xs,
      borderBottomWidth: 1,
      borderColor: theme.colors.glassBorder,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: theme.colors.glassBorder,
    },
    td: {
      padding: theme.spacing.xs,
      color: theme.colors.textPrimary,
    },

    // Links - styled but click handled by custom rule
    link: {
      color: theme.colors.accentPrimary,
      textDecorationLine: "underline",
      fontWeight: "600",
    },

    // Blockquotes
    blockquote: {
      backgroundColor: theme.colors.surface,
      borderLeftWidth: 2,
      borderLeftColor: theme.colors.accentPrimary,
      paddingLeft: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginVertical: theme.spacing.xs,
    },

    // Emphasis
    strong: {
      fontWeight: "bold",
      color: theme.colors.textPrimary,
    },
    em: {
      fontStyle: "italic",
      color: theme.colors.textPrimary,
    },

    // Horizontal rule
    hr: {
      backgroundColor: theme.colors.glassBorder,
      height: 1,
      marginVertical: theme.spacing.md,
    },
  };

  // Handle link press - works for both nexus:// and regular URLs
  const handleLinkPress = (url) => {
    if (!url) return false;

    if (url.startsWith("nexus://")) {
      if (onLinkPress) {
        return onLinkPress(url);
      }
      return false;
    }

    if (onLinkPress) {
      const result = onLinkPress(url);
      if (result === false) return;
    }

    if (Platform.OS === "web") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      Linking.openURL(url).catch(() => {});
    }

    return true;
  };

  const rules = {
    link: (node, children, parent, styles) => {
      const url = node.attributes?.href || "";
      return (
        <Text
          key={node.key}
          style={styles.link}
          onPress={() => handleLinkPress(url)}
          accessibilityRole="link"
        >
          {children}
        </Text>
      );
    },
  };

  return (
    <View style={localStyles.container}>
      <Markdown style={markdownStyles} rules={rules}>
        {content}
      </Markdown>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
