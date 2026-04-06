import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import GlassCard from "../components/GlassCard";
import Layout from "../components/Layout";
import { useTheme } from "../contexts/ThemeContext";
import { useAdminSettings } from "../contexts/AdminSettingsContext";

export default function LoginScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { login, loading } = useAuth();
  const { isMaintenanceMode } = useAdminSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const prefillEmail = route?.params?.email;

  useEffect(() => {
    if (typeof prefillEmail === "string" && prefillEmail.trim()) {
      setEmail(prefillEmail.trim());
    }
  }, [prefillEmail]);

  const handleLogin = async () => {
    // Pass actual entered values (or defaults for quick dev login)
    const result = await login(email, password);
    if (result.success) {
      // If we are in maintenance mode (and using the isolated auth stack), we don't need to navigate.
      // The App.js MaintenanceWrapper will detect the user change and unmount this stack automatically.
      // Attempting to navigate here causes "action reset not handled" errors because ProfileMain doesn't exist in the maintenance stack.
      if (isMaintenanceMode) {
        return;
      }

      try {
        // Reset the ProfileStack to ProfileMain and navigate to HomeTab
        // This clears the Login screen from the stack
        navigation.reset({
          index: 0,
          routes: [{ name: "ProfileMain" }],
        });
        // Then navigate to Home tab
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate("HomeTab");
        }
      } catch (e) {
        console.log("Login navigation failed:", e.message);
      }
    } else {
      Alert.alert(
        result.verificationRequired ? "Verify your email" : "Login Failed",
        result.error || "Please try again",
      );
    }
  };

  return (
    <Layout scrollable={false} showChatButton={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={[styles.content, { padding: theme.spacing.lg }]}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              zIndex: 10,
              padding: 10,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Logo/Title - Clickable to go Home */}
          <TouchableOpacity
            style={[styles.header, { marginBottom: theme.spacing.xl }]}
            onPress={() => !isMaintenanceMode && navigation.navigate("HomeTab")}
          >
            <Image
              source={require("../../assets/images/budget_pc.png")}
              style={{
                width: 120,
                height: 120,
                borderRadius: 24,
                marginBottom: theme.spacing.md,
              }}
              resizeMode="contain"
            />
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text
                style={{
                  fontSize: 42,
                  fontWeight: "800",
                  color: theme.colors.textPrimary,
                  letterSpacing: -1,
                  textAlign: "center",
                }}
              >
                Nexus
                <Text style={{ color: theme.colors.accentPrimary }}>Build</Text>
              </Text>
            </View>
            <Text
              style={[
                styles.subtitle,
                {
                  fontSize: theme.fontSize.lg,
                  color: theme.colors.textSecondary,
                  marginTop: theme.spacing.xs,
                },
              ]}
            >
              Welcome back!
            </Text>
          </TouchableOpacity>

          {/* Login Form */}
          <GlassCard style={[styles.formCard, { padding: theme.spacing.xl }]}>
            <View
              style={[styles.inputGroup, { marginBottom: theme.spacing.lg }]}
            >
              <Text
                style={[
                  styles.label,
                  {
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.textPrimary,
                    marginBottom: theme.spacing.sm,
                  },
                ]}
              >
                Email
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.glassBg,
                    borderColor: theme.colors.glassBorder,
                    borderRadius: theme.borderRadius.md,
                    paddingHorizontal: theme.spacing.md,
                    gap: theme.spacing.sm,
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.colors.textMuted}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      fontSize: theme.fontSize.base,
                      paddingVertical: theme.spacing.md,
                      color: theme.colors.textPrimary,
                    },
                  ]}
                  placeholder="your@email.com"
                  placeholderTextColor={theme.colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View
              style={[styles.inputGroup, { marginBottom: theme.spacing.lg }]}
            >
              <Text
                style={[
                  styles.label,
                  {
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.textPrimary,
                    marginBottom: theme.spacing.sm,
                  },
                ]}
              >
                Password
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.glassBg,
                    borderColor: theme.colors.glassBorder,
                    borderRadius: theme.borderRadius.md,
                    paddingHorizontal: theme.spacing.md,
                    gap: theme.spacing.sm,
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.colors.textMuted}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      fontSize: theme.fontSize.base,
                      paddingVertical: theme.spacing.md,
                      color: theme.colors.textPrimary,
                    },
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.forgotPassword,
                { marginBottom: theme.spacing.lg },
              ]}
            >
              <Text
                style={[
                  styles.forgotPasswordText,
                  {
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.accentPrimary,
                  },
                ]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btnPrimary,
                {
                  borderRadius: theme.borderRadius.full,
                  ...theme.shadows.button,
                },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={theme.gradients.primary}
                style={[
                  styles.btnGradient,
                  {
                    gap: theme.spacing.sm,
                    paddingVertical: theme.spacing.md,
                  },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.btnPrimaryText,
                        { fontSize: theme.fontSize.lg },
                      ]}
                    >
                      Login
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>

          {/* Register Link */}
          <View style={[styles.footer, { marginTop: theme.spacing.xl }]}>
            <Text
              style={[
                styles.footerText,
                {
                  fontSize: theme.fontSize.base,
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text
                style={[
                  styles.footerLink,
                  {
                    fontSize: theme.fontSize.base,
                    color: theme.colors.accentPrimary,
                  },
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
  },
  subtitle: {},
  formCard: {},
  inputGroup: {},
  label: {
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  input: {
    flex: 1,
    color: "#020617", // Fallback, but should typically use dynamic style if possible.
    // Actually, StyleSheet.create is static here usually.
    // But LoginScreen uses a static StyleSheet? No, let's look.
    // It has `const styles = StyleSheet.create(...)` at the bottom.
    // BUT, the component uses `theme` from `useTheme()`.
    // To support dynamic theme in input text color, we should use inline style or array style in the component render.
    // The render uses: style={[styles.input, { fontSize: theme.fontSize.base ... }]}
    // We should add `color: theme.colors.textPrimary` to that inline style array.
    // AND remove `color: '#FFFFFF'` from the static style.
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {},
  btnPrimary: {
    overflow: "hidden",
  },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: "white",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {},
  footerLink: {
    fontWeight: "600",
  },
});
