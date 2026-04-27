import React from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ExternalLink, LockKeyhole } from 'lucide-react-native';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';
import { isStudioAuthDisabled } from '../../src/services/studioAuth';
import { colors, radii, spacing, typography } from '../../src/theme';

const ADMIN_EMAIL = 'admin@northernstepstudio.com';

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export default function SignInScreen() {
  const { signIn, error, loginUrl, authOrigin } = useAuth();
  const authDisabled = isStudioAuthDisabled();
  const [email, setEmail] = React.useState(ADMIN_EMAIL);
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleOpenAdminConsole = React.useCallback(async () => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(loginUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      await Linking.openURL(loginUrl);
    } catch (openError) {
      setLocalError(toErrorMessage(openError, 'Unable to open admin console login.'));
    }
  }, [loginUrl]);

  const handleSignIn = React.useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required.');
      return;
    }

    setSubmitting(true);
    setLocalError(null);

    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (signInError: unknown) {
      setLocalError(toErrorMessage(signInError, 'Unable to sign in to admin console right now.'));
    } finally {
      setSubmitting(false);
    }
  }, [email, password, signIn]);

  const connectionHint =
    error && error.toLowerCase().includes('failed to fetch')
      ? `Auth service is unreachable from this origin. Ensure ${authOrigin} allows your localhost in CORS.`
      : null;

  if (authDisabled) {
    return (
      <View style={styles.screen}>
        <GlassCard style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconWrap}>
              <LockKeyhole size={18} color={colors.accent.secondary} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>MGBoard Access Enabled</Text>
              <Text style={styles.subtitle}>Auth sign-in is disabled for this build.</Text>
            </View>
          </View>
          <Button title="Enter MGBoard" onPress={() => router.replace('/(tabs)')} size="md" />
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <GlassCard style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <LockKeyhole size={18} color={colors.accent.secondary} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>MGBoard Admin Access</Text>
            <Text style={styles.subtitle}>Sign in with Northern Step Studio admin credentials.</Text>
          </View>
        </View>

        <Input
          label="Admin Email"
          value={email}
          onChangeText={setEmail}
          placeholder="admin@northernstepstudio.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
        />

        {localError ? <Text style={styles.errorText}>{localError}</Text> : null}
        {!localError && connectionHint ? <Text style={styles.warningText}>{connectionHint}</Text> : null}

        <View style={styles.actions}>
          <Button
            title="Open Admin Console"
            onPress={handleOpenAdminConsole}
            variant="secondary"
            size="md"
            icon={<ExternalLink size={14} color={colors.text.primary} />}
            style={styles.secondaryAction}
          />
          <Button
            title="Sign In"
            onPress={handleSignIn}
            loading={submitting}
            size="md"
            style={styles.primaryAction}
          />
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerTextWrap: {
    flex: 1,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.lg,
    backgroundColor: colors.accent.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  title: {
    ...typography.subheading,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  secondaryAction: {
    flex: 1,
  },
  primaryAction: {
    flex: 1,
  },
  errorText: {
    ...typography.caption,
    color: colors.accent.danger,
  },
  warningText: {
    ...typography.caption,
    color: colors.accent.warning,
  },
});
