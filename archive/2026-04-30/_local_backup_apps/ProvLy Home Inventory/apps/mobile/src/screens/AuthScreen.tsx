import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useInventoryStore } from '../stores/inventoryStore';
import { itemsRepo } from '../db/repositories/itemsRepo';
import { useTheme } from '../stores/themeStore';
import { useTranslation } from 'react-i18next';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const { colors, isDark } = useTheme();
    const { signIn, signUp, signInWithGoogle } = useAuthStore();
    const { setupInventoryTemplate } = useInventoryStore();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();

    // Ask user if they want sample items to guide them
    const offerTemplateSetup = async () => {
        try {
            const items = await itemsRepo.listItems();
            const homes = await itemsRepo.listHomes();

            // Check if a sample home already exists
            const hasSampleHome = homes.some(h => h.name === '📌 Sample Home');
            if (hasSampleHome) return;

            // Check if user has real (non-sample) items
            const hasRealItems = items.some(item => !item.name.startsWith('📌'));

            // Only offer if no real items exist
            if (!hasRealItems) {
                // Clean out any old sample items from primary home to keep it clean
                const sampleItems = items.filter(item => item.name.startsWith('📌'));
                for (const item of sampleItems) {
                    await itemsRepo.softDeleteItem(item.id);
                }

                Alert.alert(
                    '🏠 Get Started Faster',
                    'Would you like us to add a Sample Home with example items? These show you what a well-documented inventory looks like.\n\nYour primary home stays untouched. You can delete the sample home anytime.',
                    [
                        {
                            text: 'No thanks',
                            style: 'cancel',
                            onPress: async () => {
                                await useInventoryStore.getState().fetchInventory();
                            }
                        },
                        {
                            text: 'Yes, add examples',
                            onPress: async () => {
                                console.log('UseInventory: Creating sample home with template');
                                try {
                                    // Create a new separate home for the samples
                                    const sampleHome = await itemsRepo.createHome({
                                        name: '📌 Sample Home',
                                        address: 'Example Property'
                                    });
                                    // Seed rooms + items into the sample home
                                    await setupInventoryTemplate('basic', sampleHome.id);
                                    // Set it as active so user sees it right away
                                    useInventoryStore.getState().setActiveHome(sampleHome.id);
                                } catch (error) {
                                    console.error('Failed to create sample home:', error);
                                }
                            }
                        }
                    ]
                );
            }
        } catch (e) {
            console.error('Failed to check inventory:', e);
        }
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert(t('common.error', 'Error'), t('auth.fillAllFields', 'Please fill in all fields'));
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert(t('auth.invalidEmail', 'Invalid Email'), t('auth.invalidEmailDesc', 'Please enter a valid email address'));
            return;
        }

        if (password.length < 6) {
            Alert.alert(t('auth.weakPassword', 'Weak Password'), t('auth.passwordTooShort', 'Password must be at least 6 characters'));
            return;
        }

        if (isSignUp && !acceptedTerms) {
            Alert.alert(t('auth.termsRequired', 'Terms Acceptance Required'), t('auth.termsRequiredDesc', 'You must agree to the Terms of Service and User Liability Agreement to create an account.'));
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                const data = await signUp(email, password);

                // If Supabase auto-confirmed and logged in, we'll have a session
                if (data?.session) {
                    // Ask if they want sample items
                    await offerTemplateSetup();
                } else {
                    Alert.alert(t('common.success', 'Success'), t('auth.accountCreated', 'Account created! Please check your email to confirm, then sign in.'));
                    setIsSignUp(false);
                }
            } else {
                await signIn(email, password);
                // Ask if they want sample items (only shows if inventory is empty)
                await offerTemplateSetup();
            }
        } catch (error: any) {
            console.error('Auth Error:', error);

            if (error.message?.includes('Email not confirmed')) {
                Alert.alert(
                    t('auth.verificationRequired', 'Verification Required'),
                    t('auth.verificationRequiredDesc', 'Please check your email to confirm your account before signing in.')
                );
            } else if (error.message?.includes('User already registered')) {
                Alert.alert(t('auth.accountExists', 'Account Exists'), t('auth.accountExistsDesc', 'This email is already registered. Please sign in instead.'));
                setIsSignUp(false);
            } else if (error.message?.includes('Invalid login credentials')) {
                Alert.alert(t('auth.loginFailed', 'Login Failed'), t('auth.signInError', 'Incorrect email or password. please try again.'));
            } else {
                Alert.alert(t('auth.authFailed', 'Authentication Failed'), error.message);
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style={isDark ? "light" : "dark"} />
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.content}>
                    <Image
                        source={require('../../assets/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.title, { color: colors.text }]}>ProvLy</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('auth.homeInventory', 'Home Inventory')}</Text>

                    <View style={styles.form}>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                            placeholder={t('auth.email', 'Email')}
                            placeholderTextColor={colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                            placeholder={t('auth.password', 'Password')}
                            placeholderTextColor={colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        {isSignUp && (
                            <View style={styles.termsContainer}>
                                <TouchableOpacity
                                    style={styles.checkboxContainer}
                                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                                >
                                    <MaterialCommunityIcons
                                        name={acceptedTerms ? "checkbox-marked" : "checkbox-blank-outline"}
                                        size={24}
                                        color={colors.primary}
                                    />
                                </TouchableOpacity>
                                <View style={styles.termsTextContainer}>
                                    <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                                        {t('auth.termsAgree', 'I agree to the')}{' '}
                                        <Text
                                            style={[styles.termsLink, { color: colors.primary }]}
                                            onPress={() => navigation.navigate('Legal', { type: 'terms' })}
                                        >
                                            {t('auth.termsOfService', 'Terms of Service')}
                                        </Text>
                                        {' '}{t('auth.and', 'and')}{' '}
                                        <Text
                                            style={[styles.termsLink, { color: colors.primary }]}
                                            onPress={() => navigation.navigate('Legal', { type: 'privacy' })}
                                        >
                                            {t('auth.privacyPolicy', 'User Liability Agreement')}
                                        </Text>
                                        .
                                    </Text>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
                            onPress={handleAuth}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? t('common.loading', 'Loading...') : isSignUp ? t('auth.createAccount', 'Create Secured Account') : t('auth.signIn', 'Sign In')}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
                            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                        </View>

                        <TouchableOpacity
                            style={[styles.googleButton, { borderColor: colors.border }]}
                            onPress={async () => {
                                try {
                                    setLoading(true);
                                    await signInWithGoogle();
                                } catch (error: any) {
                                    Alert.alert(
                                        t('auth.googleSignInFailed', 'Google Sign-In Failed'),
                                        error.message || t('auth.pleaseTryAgain', 'Please try again.')
                                    );
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                        >
                            <Text style={styles.googleButtonText}>
                                {t('auth.continueWithGoogle', 'Continue with Google')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => setIsSignUp(!isSignUp)}
                        >
                            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
                                {isSignUp ? t('auth.hasAccountPrompt', 'Already have an account?') : t('auth.noAccountPrompt', "Don't have an account?")}
                            </Text>
                            <Text style={[styles.switchAction, { color: colors.primary }]}>
                                {isSignUp ? t('auth.switchToSignIn', 'Sign In') : t('auth.switchToSignUp', 'Sign Up')}
                            </Text>
                        </TouchableOpacity>

                    </View>

                    <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
                        {t('auth.cloudRequired', 'Create an account to securely store and sync your inventory.')}
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B1220',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 24,
    },
    content: {
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
        padding: 20,
    },
    logo: {
        width: 120,
        height: 120,
        alignSelf: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 48,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    form: {
        gap: 16,
    },
    input: {
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#FFFFFF',
    },
    button: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    switchButton: {
        padding: 16,
        alignItems: 'center',
        gap: 4,
    },
    switchText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    switchAction: {
        fontSize: 16,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
    },
    checkboxContainer: {
        paddingRight: 12,
        paddingTop: 2,
    },
    termsTextContainer: {
        flex: 1,
    },
    termsText: {
        color: '#94A3B8',
        fontSize: 13,
    },
    termsLink: {
        color: '#4F46E5',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    guestButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
        backgroundColor: 'rgba(51, 65, 85, 0.3)',
    },
    guestButtonText: {
        color: '#94A3B8',
        fontSize: 15,
        fontWeight: '600',
    },
    footerNote: {
        marginTop: 24,
        textAlign: 'center',
        fontSize: 12,
        paddingHorizontal: 20,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 13,
        fontWeight: '500',
    },
    googleButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    googleButtonText: {
        color: '#1F1F1F',
        fontSize: 16,
        fontWeight: '600',
    },
});
