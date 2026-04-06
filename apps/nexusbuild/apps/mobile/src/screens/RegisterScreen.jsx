import React, { useState } from "react";
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
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import GlassCard from "../components/GlassCard";
import Layout from "../components/Layout";
import { useTheme } from "../contexts/ThemeContext";

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const { register, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const goToLogin = (params = {}) => {
    navigation.navigate("ProfileTab", { screen: "Login", params });
  };
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (!agreedToTerms) {
      Alert.alert("Error", "You must agree to the Terms and Privacy Policy");
      return;
    }

    const result = await register(username, email, password);
    if (result.success) {
      if (result.verificationRequired) {
        Alert.alert(
          "Check your email",
          result.message ||
            "We sent a verification link. Confirm it before logging in.",
        );
        goToLogin({ email });
        return;
      }

      // Reset navigation to prevent the register screen from staying underneath
      navigation.reset({
        index: 0,
        routes: [{ name: "ProfileTab" }],
      });
    } else {
      Alert.alert("Registration Failed", result.error);
    }
  };

  return (
    <Layout scrollable={false} showChatButton={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { padding: theme.spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Title */}
          <View style={[styles.header, { marginBottom: theme.spacing.xl }]}>
            <Image
              source={require("../../assets/icon.png")}
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                marginBottom: theme.spacing.md,
              }}
              resizeMode="contain"
            />
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text
                style={{
                  fontSize: 32,
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
              Create your account
            </Text>
          </View>

          {/* Register Form */}
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
                Username
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
                  name="person-outline"
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
                  placeholder="johndoe"
                  placeholderTextColor={theme.colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
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
                Confirm Password
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
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View
              style={[
                styles.legalWrapper,
                {
                  marginVertical: theme.spacing.md,
                  paddingHorizontal: theme.spacing.xs,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: theme.colors.accentPrimary },
                    agreedToTerms && {
                      backgroundColor: theme.colors.accentPrimary,
                    },
                  ]}
                >
                  {agreedToTerms && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Legal")}>
                <Text
                  style={[
                    styles.legalText,
                    {
                      fontSize: theme.fontSize.sm,
                      color: theme.colors.textSecondary,
                    },
                  ]}
                >
                  I agree to the{" "}
                  <View style={styles.legalLinksRow}>
                    <Text
                      style={[
                        styles.legalLink,
                        { color: theme.colors.accentPrimary },
                      ]}
                    >
                      Terms of Service
                    </Text>
                    <Text
                      style={[
                        styles.legalText,
                        {
                          fontSize: theme.fontSize.sm,
                          color: theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {" "}
                      &{" "}
                    </Text>
                    <Text
                      style={[
                        styles.legalLink,
                        { color: theme.colors.accentPrimary },
                      ]}
                    >
                      Privacy Policy
                    </Text>
                  </View>
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.btnPrimary,
                {
                  borderRadius: theme.borderRadius.full,
                  ...theme.shadows.button,
                  marginTop: theme.spacing.md,
                },
              ]}
              onPress={handleRegister}
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
                      Create Account
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>

          {/* Login Link */}
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
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={goToLogin}>
              <Text
                style={[
                  styles.footerLink,
                  {
                    fontSize: theme.fontSize.base,
                    color: theme.colors.accentPrimary,
                  },
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
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
    // color: '#FFFFFF', // Removed hardcoded white
  },
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
  legalWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  legalText: {
    lineHeight: 20,
  },
  legalLinksRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  legalLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
