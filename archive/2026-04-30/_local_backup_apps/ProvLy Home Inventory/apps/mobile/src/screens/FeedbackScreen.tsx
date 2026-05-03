import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Linking,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import * as MailComposer from 'expo-mail-composer';
import * as ImagePicker from 'expo-image-picker';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { BRAND } from '../config/brand';

type FeedbackType = 'bug' | 'suggestion' | 'question' | null;

const SUPPORT_EMAIL = BRAND.supportEmail;

export default function FeedbackScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { session } = useAuthStore();

    const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [sending, setSending] = useState(false);
    const [attachments, setAttachments] = useState<string[]>([]);

    const feedbackOptions = [
        {
            type: 'bug' as FeedbackType,
            icon: 'bug-outline',
            title: 'Report a Bug',
            subtitle: 'Something not working correctly?',
            color: '#EF4444',
        },
        {
            type: 'suggestion' as FeedbackType,
            icon: 'lightbulb-outline',
            title: 'Feature Suggestion',
            subtitle: 'Have an idea to improve the app?',
            color: '#F59E0B',
        },
        {
            type: 'question' as FeedbackType,
            icon: 'help-circle-outline',
            title: 'Ask a Question',
            subtitle: 'Need help with something?',
            color: '#3B82F6',
        },
    ];

    const getDeviceInfo = () => {
        return `
---
Device: ${Device.modelName || 'Unknown'}
OS: ${Platform.OS} ${Platform.Version}
App Version: ${Constants.expoConfig?.version || '1.0.0'}
User ID: ${session?.user?.id?.slice(0, 8) || 'Anonymous'}...
Attachments: ${attachments.length > 0 ? `${attachments.length} screenshot(s)` : 'None'}
---`;
    };

    const pickImage = async () => {
        if (attachments.length >= 3) {
            Alert.alert('Limit Reached', 'You can attach up to 3 screenshots.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsMultipleSelection: false,
        });

        if (!result.canceled && result.assets[0]) {
            setAttachments([...attachments, result.assets[0].uri]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSendFeedback = async () => {
        if (!feedbackType) {
            Alert.alert('Select Type', 'Please select a feedback type.');
            return;
        }
        if (!subject.trim()) {
            Alert.alert('Missing Subject', 'Please enter a subject.');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Missing Description', 'Please describe your feedback.');
            return;
        }

        setSending(true);

        const typeLabel = feedbackType === 'bug' ? '🐛 Bug Report' :
            feedbackType === 'suggestion' ? '💡 Suggestion' : '❓ Question';

        const emailBody = `${typeLabel}

${description}

${getDeviceInfo()}`;

        try {
            const isAvailable = await MailComposer.isAvailableAsync();

            if (isAvailable) {
                await MailComposer.composeAsync({
                    recipients: [SUPPORT_EMAIL],
                    subject: `[ProvLy ${typeLabel}] ${subject}`,
                    body: emailBody,
                    attachments: attachments,
                });

                const successMessage = feedbackType === 'bug'
                    ? "Thanks! Our team will investigate this bug and work on a fix."
                    : feedbackType === 'suggestion'
                        ? "Great idea! We'll review this suggestion for our future updates."
                        : "Thanks for reaching out! We'll get back to you with an answer shortly.";

                Alert.alert(
                    'Thank You! 🙏',
                    successMessage,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                const fallbackMessage = feedbackType === 'bug'
                    ? "Our team will investigate and work on a fix."
                    : feedbackType === 'suggestion'
                        ? "We'll review this suggestion for our future updates."
                        : "We'll get back to you with an answer shortly.";

                // Fallback: Copy to clipboard or show email
                Alert.alert(
                    'Email Not Available',
                    `Please send your feedback to:\n\n${SUPPORT_EMAIL}\n\nSubject: ${subject}\n\n${fallbackMessage}${attachments.length > 0 ? '\n\n(Note: Please attach screenshots manually)' : ''}`,
                    [
                        { text: 'OK' },
                        {
                            text: 'Open Email App',
                            onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[ProvLy ${typeLabel}] ${subject}`)}&body=${encodeURIComponent(emailBody)}`)
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to send feedback. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleReset = () => {
        setFeedbackType(null);
        setSubject('');
        setDescription('');
        setAttachments([]);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Feedback</Text>
                <TouchableOpacity
                    onPress={handleReset}
                    style={[styles.resetButton, { backgroundColor: colors.surfaceVariant }]}
                >
                    <MaterialCommunityIcons name="refresh" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Intro */}
                    <View style={styles.intro}>
                        <MaterialCommunityIcons
                            name="message-text-outline"
                            size={48}
                            color={colors.primary}
                        />
                        <Text style={[styles.introTitle, { color: colors.text }]}>
                            We'd Love Your Feedback
                        </Text>
                        <Text style={[styles.introSubtitle, { color: colors.textSecondary }]}>
                            Help us improve {BRAND.appName} by sharing your thoughts.
                        </Text>
                    </View>

                    {/* Feedback Type Selection */}
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                        WHAT TYPE OF FEEDBACK?
                    </Text>
                    <View style={styles.typeOptions}>
                        {feedbackOptions.map((option) => (
                            <TouchableOpacity
                                key={option.type}
                                style={[
                                    styles.typeCard,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: feedbackType === option.type ? option.color : colors.border,
                                        borderWidth: feedbackType === option.type ? 2 : 1,
                                    }
                                ]}
                                onPress={() => setFeedbackType(option.type)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.typeIconContainer, { backgroundColor: `${option.color}20` }]}>
                                    <MaterialCommunityIcons
                                        name={option.icon as any}
                                        size={28}
                                        color={option.color}
                                    />
                                </View>
                                <View style={styles.typeTextContainer}>
                                    <Text style={[styles.typeTitle, { color: colors.text }]}>
                                        {option.title}
                                    </Text>
                                    <Text style={[styles.typeSubtitle, { color: colors.textSecondary }]}>
                                        {option.subtitle}
                                    </Text>
                                </View>
                                {feedbackType === option.type && (
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={24}
                                        color={option.color}
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Form Fields */}
                    {feedbackType && (
                        <View style={styles.formSection}>
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                                DETAILS
                            </Text>

                            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Subject</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder={
                                        feedbackType === 'bug' ? "e.g., App crashes when scanning" :
                                            feedbackType === 'suggestion' ? "e.g., Add dark mode for photos" :
                                                "e.g., How do I export to PDF?"
                                    }
                                    placeholderTextColor={colors.textSecondary}
                                    value={subject}
                                    onChangeText={setSubject}
                                    maxLength={100}
                                />
                            </View>

                            <View style={[styles.inputContainer, styles.textareaContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Description</Text>
                                <TextInput
                                    style={[styles.textarea, { color: colors.text }]}
                                    placeholder={
                                        feedbackType === 'bug' ? "Please describe what happened, and steps to reproduce the issue..." :
                                            feedbackType === 'suggestion' ? "Tell us more about your idea and how it would help..." :
                                                "What do you need help with?"
                                    }
                                    placeholderTextColor={colors.textSecondary}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                    maxLength={1000}
                                />
                                <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                                    {description.length}/1000
                                </Text>
                            </View>

                            {/* Screenshots */}
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 8 }]}>
                                SCREENSHOTS (OPTIONAL)
                            </Text>
                            <View style={styles.attachmentSection}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attachmentRow}>
                                    {attachments.map((uri, index) => (
                                        <View key={index} style={styles.attachmentItem}>
                                            <Image source={{ uri }} style={styles.attachmentImage} />
                                            <TouchableOpacity
                                                style={styles.removeAttachmentButton}
                                                onPress={() => removeAttachment(index)}
                                            >
                                                <MaterialCommunityIcons name="close-circle" size={22} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {attachments.length < 3 && (
                                        <TouchableOpacity
                                            style={[styles.addAttachmentButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                            onPress={pickImage}
                                        >
                                            <MaterialCommunityIcons name="camera-plus-outline" size={28} color={colors.primary} />
                                            <Text style={[styles.addAttachmentText, { color: colors.textSecondary }]}>
                                                Add
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </ScrollView>
                                <Text style={[styles.attachmentHint, { color: colors.textSecondary }]}>
                                    Add up to 3 screenshots to help illustrate your feedback
                                </Text>
                            </View>

                            {/* Device Info Note */}
                            <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}>
                                <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
                                <Text style={[styles.infoText, { color: colors.text }]}>
                                    We'll include device info to help diagnose issues. No personal data is shared.
                                </Text>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    { backgroundColor: colors.primary },
                                    sending && { opacity: 0.7 }
                                ]}
                                onPress={handleSendFeedback}
                                disabled={sending}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons
                                    name={sending ? "loading" : "send"}
                                    size={22}
                                    color="#FFF"
                                />
                                <Text style={styles.submitButtonText}>
                                    {sending ? 'Sending...' : 'Send Feedback'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            You can also reach us at
                        </Text>
                        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
                            <Text style={[styles.footerEmail, { color: colors.primary }]}>
                                {SUPPORT_EMAIL}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    resetButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: 24,
        paddingBottom: 60,
    },
    intro: {
        alignItems: 'center',
        marginBottom: 32,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    introSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
    },
    typeOptions: {
        gap: 12,
        marginBottom: 24,
    },
    typeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    typeIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    typeTextContainer: {
        flex: 1,
    },
    typeTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    typeSubtitle: {
        fontSize: 13,
    },
    formSection: {
        marginTop: 8,
    },
    inputContainer: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    textareaContainer: {
        minHeight: 160,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        fontSize: 16,
        padding: 0,
    },
    textarea: {
        fontSize: 16,
        padding: 0,
        minHeight: 100,
    },
    charCount: {
        fontSize: 11,
        textAlign: 'right',
        marginTop: 8,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 10,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
    },
    footerText: {
        fontSize: 14,
    },
    footerEmail: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 4,
    },
    // Attachment styles
    attachmentSection: {
        marginBottom: 16,
    },
    attachmentRow: {
        gap: 12,
        paddingVertical: 4,
    },
    attachmentItem: {
        position: 'relative',
    },
    attachmentImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    removeAttachmentButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#FFF',
        borderRadius: 12,
    },
    addAttachmentButton: {
        width: 80,
        height: 80,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addAttachmentText: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    attachmentHint: {
        fontSize: 12,
        marginTop: 8,
    },
});
