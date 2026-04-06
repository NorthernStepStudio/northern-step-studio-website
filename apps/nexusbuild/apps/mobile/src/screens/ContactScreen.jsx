import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    ActivityIndicator,
    Image,
    Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';

import SuggestionChips from '../components/SuggestionChips';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../core/config';
import api from '../services/api';
import { addBugReport } from '../services/bugReportStorage';
import { FEATURE_COLORS } from '../core/constants';

const SUBJECT_SUGGESTIONS = [
    'Bug Report',
    'Feature Request',
    'Account Issue',
    'Order Status',
    'Partnership',
    'Other'
];

const MAX_IMAGES = 5;

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ContactScreen({ route, navigation }) {
    const { theme } = useTheme();
    const { addContactNotification } = useNotifications();
    const { initialSubject } = route.params || {};

    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: initialSubject || '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [attachedImages, setAttachedImages] = useState([]);

    const validateEmail = (email) => {
        if (!email) {
            setEmailError('');
            return true; // Will be caught by required check
        }
        if (!EMAIL_REGEX.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    const pickImages = async () => {
        if (attachedImages.length >= MAX_IMAGES) {
            if (Platform.OS === 'web') {
                window.alert(`Maximum ${MAX_IMAGES} images allowed`);
            } else {
                Alert.alert('Limit Reached', `Maximum ${MAX_IMAGES} images allowed`);
            }
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsMultipleSelection: true,
            selectionLimit: MAX_IMAGES - attachedImages.length,
            quality: 0.7,
        });

        if (!result.canceled && result.assets) {
            const newImages = result.assets.slice(0, MAX_IMAGES - attachedImages.length);
            setAttachedImages([...attachedImages, ...newImages]);
        }
    };

    const removeImage = (index) => {
        setAttachedImages(attachedImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!form.name || !form.email || !form.message) {
            if (Platform.OS === 'web') {
                window.alert('Please fill in all required fields');
            } else {
                Alert.alert('Missing Fields', 'Please fill in all required fields');
            }
            return;
        }

        // Validate email format
        if (!validateEmail(form.email)) {
            if (Platform.OS === 'web') {
                window.alert('Please enter a valid email address');
            } else {
                Alert.alert('Invalid Email', 'Please enter a valid email address');
            }
            return;
        }

        // Validate message length
        if (form.message.length < 10) {
            if (Platform.OS === 'web') {
                window.alert('Message must be at least 10 characters');
            } else {
                Alert.alert('Message Too Short', 'Please enter at least 10 characters');
            }
            return;
        }

        // Treat all contact submissions as reports so they get saved locally and appear in Admin Console
        const isBugReport = true;

        let category = 'other';
        const lowerSubject = form.subject.toLowerCase();
        if (lowerSubject.includes('bug')) category = 'bug';
        else if (lowerSubject.includes('feature')) category = 'feature';
        else if (lowerSubject.includes('issue')) category = 'bug';

        setLoading(true);

        try {
            if (isBugReport) {
                const token = await AsyncStorage.getItem('authToken');
                const baseUrl = api.defaults.baseURL;

                if (attachedImages.length > 0) {
                    // With images: use FormData
                    const formData = new FormData();
                    formData.append('category', category);
                    formData.append('description', `[${form.subject}] ${form.message.trim()}\n\nFrom: ${form.name} (${form.email})`);
                    formData.append('email', form.email.trim());

                    // Add images with robust type checking
                    for (const img of attachedImages) {
                        if (Platform.OS === 'web') {
                            // Web: fetch blob and append
                            const response = await fetch(img.uri);
                            const blob = await response.blob();
                            formData.append('image', blob, img.fileName || 'screenshot.jpg');
                        } else {
                            // Native: append file info
                            const filename = img.fileName || img.uri.split('/').pop() || 'screenshot.jpg';
                            const match = /\.(\w+)$/.exec(filename);
                            const type = match ? `image/${match[1]}` : `image/jpeg`;

                            formData.append('image', {
                                uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
                                name: filename,
                                type: img.mimeType || type,
                            });
                        }
                    }

                    const response = await fetch(`${baseUrl}/reports`, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': token ? `Bearer ${token}` : '',
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Upload failed');
                    }
                } else {
                    // Without images: use JSON
                    await api.post('/reports', {
                        category,
                        description: `[${form.subject}] ${form.message.trim()}\n\nFrom: ${form.name} (${form.email})`,
                        email: form.email.trim(),
                        message: form.message.trim(),
                    });
                }
            } else {
                // Regular contact form (not a bug report)
                await api.post('/contact/submit', {
                    name: form.name.trim(),
                    email: form.email.trim(),
                    subject: form.subject.trim(),
                    message: form.message.trim(),
                });
            }


            // Add admin notification
            addContactNotification(form.name.trim(), form.subject.trim());

            // Also save to local storage for Admin panel - MARK AS SYNCED if API succeeded
            if (isBugReport) {
                await addBugReport({
                    description: `[${form.subject}] ${form.message.trim()}`,
                    email: form.email.trim(),
                    name: form.name.trim(),
                    hasImages: attachedImages.length > 0,
                    imageUris: attachedImages.map(img => img.uri),
                    synced: true // IMPORTANT: Mark as synced since we just uploaded it
                });
            }

            setSubmitted(true);
        } catch (error) {
            console.log('API failed, saving locally...');
            // Save to local storage when API fails
            const isBugReportLocal = true; // Always save locally
            if (isBugReportLocal) {
                await addBugReport({
                    category,
                    description: `[${form.subject}] ${form.message.trim()}`,
                    email: form.email.trim(),
                    name: form.name.trim(),
                    hasImages: attachedImages.length > 0,
                    imageUris: attachedImages.map(img => img.uri),
                });
            }

            // Still show success and add notification
            addContactNotification(form.name.trim(), form.subject.trim());
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout scrollable={false}>
            {/* Simple Header like Legal */}
            <View style={[styles.simpleHeader, { borderBottomColor: theme.colors.glassBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitleText, { color: theme.colors.textPrimary }]}>Contact Us</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
                {/* Hero */}
                <View style={styles.heroSection}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.accentPrimary + '20' }]}>
                        <Ionicons name="mail" size={40} color={theme.colors.accentPrimary} />
                    </View>
                    <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
                        Contact Us
                    </Text>
                    <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
                        We'd love to hear from you!
                    </Text>
                </View>

                {submitted ? (
                    /* Success State */
                    <GlassCard style={styles.successCard}>
                        <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
                        <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>
                            Message Sent!
                        </Text>
                        <Text style={[styles.successText, { color: theme.colors.textSecondary }]}>
                            Thank you for reaching out. We'll get back to you within 24-48 hours.
                        </Text>
                        <TouchableOpacity
                            style={[styles.backButton, { backgroundColor: theme.colors.accentPrimary }]}
                            onPress={() => navigation.navigate('HomeTab', { screen: 'Home' })}
                        >
                            <Text style={styles.backButtonText}>Back to Home</Text>
                        </TouchableOpacity>
                    </GlassCard>
                ) : (
                    /* Contact Form */
                    <GlassCard style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                                Name <Text style={{ color: theme.colors.error }}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgSecondary,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.glassBorder,
                                }]}
                                placeholder="Your name"
                                placeholderTextColor={theme.colors.textMuted}
                                value={form.name}
                                onChangeText={(text) => setForm({ ...form, name: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                                Email <Text style={{ color: theme.colors.error }}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgSecondary,
                                    color: theme.colors.textPrimary,
                                    borderColor: emailError ? theme.colors.error : theme.colors.glassBorder,
                                }]}
                                placeholder="your@email.com"
                                placeholderTextColor={theme.colors.textMuted}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={form.email}
                                onChangeText={(text) => {
                                    setForm({ ...form, email: text });
                                    if (emailError) validateEmail(text);
                                }}
                                onBlur={() => validateEmail(form.email)}
                            />
                            {emailError ? (
                                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                    {emailError}
                                </Text>
                            ) : null}
                        </View>



                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Subject</Text>
                            <SuggestionChips
                                suggestions={SUBJECT_SUGGESTIONS}
                                onPress={(suggestion) => setForm({ ...form, subject: suggestion })}
                            />
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.bgSecondary,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.glassBorder,
                                    marginTop: 4
                                }]}
                                placeholder="What's this about?"
                                placeholderTextColor={theme.colors.textMuted}
                                value={form.subject}
                                onChangeText={(text) => setForm({ ...form, subject: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                                Message <Text style={{ color: theme.colors.error }}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.textArea, {
                                    backgroundColor: theme.colors.bgSecondary,
                                    color: theme.colors.textPrimary,
                                    borderColor: theme.colors.glassBorder,
                                }]}
                                placeholder="Tell us what's on your mind..."
                                placeholderTextColor={theme.colors.textMuted}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                                value={form.message}
                                onChangeText={(text) => setForm({ ...form, message: text })}
                            />
                        </View>

                        {/* Image Attachments */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                                Attachments ({attachedImages.length}/{MAX_IMAGES})
                            </Text>

                            {/* Image Grid */}
                            {attachedImages.length > 0 && (
                                <View style={styles.imageGrid}>
                                    {attachedImages.map((image, index) => (
                                        <View key={index} style={styles.imageContainer}>
                                            <Image
                                                source={{ uri: image.uri }}
                                                style={styles.attachedImage}
                                            />
                                            <TouchableOpacity
                                                style={[styles.removeImageBtn, { backgroundColor: theme.colors.error }]}
                                                onPress={() => removeImage(index)}
                                            >
                                                <Ionicons name="close" size={14} color="#FFF" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Add Image Button */}
                            {attachedImages.length < MAX_IMAGES && (
                                <TouchableOpacity
                                    style={[styles.addImageBtn, {
                                        borderColor: theme.colors.accentPrimary,
                                        backgroundColor: theme.colors.accentPrimary + '10',
                                    }]}
                                    onPress={pickImages}
                                >
                                    <Ionicons name="image-outline" size={20} color={theme.colors.accentPrimary} />
                                    <Text style={[styles.addImageText, { color: theme.colors.accentPrimary }]}>
                                        Add Images
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, {
                                backgroundColor: loading ? theme.colors.textMuted : theme.colors.accentPrimary,
                                opacity: loading ? 0.7 : 1,
                            }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Ionicons name="send" size={20} color="#FFF" />
                            )}
                            <Text style={styles.submitButtonText}>
                                {loading ? 'Sending...' : 'Send Message'}
                            </Text>
                        </TouchableOpacity>
                    </GlassCard>
                )}

                {/* Contact Info Cards */}
                <View style={styles.infoCards}>
                    <GlassCard style={styles.infoCard}>
                        <Ionicons name="mail-outline" size={24} color={theme.colors.accentPrimary} />
                        <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>Email Us</Text>
                        <Text style={[styles.infoText, { color: theme.colors.accentPrimary }]}>contact@northernstepstudio.com</Text>
                    </GlassCard>
                    <GlassCard style={styles.infoCard}>
                        <Ionicons name="time-outline" size={24} color={theme.colors.warning} />
                        <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>Response Time</Text>
                        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>24-48 hours</Text>
                    </GlassCard>
                    <TouchableOpacity onPress={() => navigation.navigate('ChatTab', {
                        screen: 'ChatMain',
                        params: { helpMode: true, mode: 'general' }
                    })}>
                        <GlassCard style={styles.infoCard}>
                            <Ionicons name="chatbubbles-outline" size={24} color={FEATURE_COLORS.CHAT} />
                            <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>Live Chat</Text>
                            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>Ask Nexus AI</Text>
                        </GlassCard>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('https://northernstepstudio.com')}>
                        <GlassCard style={styles.infoCard}>
                            <Ionicons name="globe-outline" size={24} color={theme.colors.accentPrimary} />
                            <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>Website</Text>
                            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>northernstepstudio.com</Text>
                        </GlassCard>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    simpleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    headerTitleText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backBtn: {
        padding: 4,
    },
    container: {
        flex: 1,
        ...(Platform.OS === 'web' && {
            height: '100vh',
            overflow: 'hidden',
        }),
    },
    scrollView: {
        flex: 1,
        ...(Platform.OS === 'web' && {
            overflow: 'auto',
            height: '100%',
        }),
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 60,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 16,
    },
    formCard: {
        padding: 24,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
    textArea: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
        minHeight: 120,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 10,
        marginTop: 8,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    successCard: {
        padding: 40,
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    successText: {
        fontSize: 15,
        textAlign: 'center',
        maxWidth: 300,
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        marginTop: 8,
    },
    backButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    infoCards: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    infoCard: {
        padding: 16,
        alignItems: 'center',
        minWidth: 100,
        gap: 8,
    },
    infoTitle: {
        fontSize: 13,
        fontWeight: '600',
    },
    infoText: {
        fontSize: 11,
    },
    // Image attachment styles
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 12,
    },
    imageContainer: {
        position: 'relative',
    },
    attachedImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addImageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        gap: 8,
    },
    addImageText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
