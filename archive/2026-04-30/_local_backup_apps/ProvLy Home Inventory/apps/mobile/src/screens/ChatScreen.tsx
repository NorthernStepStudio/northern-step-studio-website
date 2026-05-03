import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useAgent, Message } from '../hooks/useAgent';
import { useTheme } from '../stores/themeStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ActionButton } from '../chatbot/rulesEngine';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';

export default function ChatScreen() {
    const navigation = useNavigation<any>();
    const flatListRef = useRef<FlatList>(null);
    const [inputText, setInputText] = React.useState('');
    const { messages, sendMessage, isLoading, clearHistory } = useAgent();
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { session } = useAuthStore();

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 2) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) {
            return;
        }
        sendMessage(inputText);
        setInputText('');
    };

    const handleActionPress = (action: ActionButton) => {
        if (action.screen === 'help') {
            sendMessage('Help');
            return;
        }

        // Map legacy or mismatched names
        let targetScreen = action.screen;
        if (targetScreen === 'ProfileTab') targetScreen = 'SettingsTab';

        try {
            navigation.navigate(targetScreen, action.params);
        } catch (error) {
            console.error('[ChatScreen] Navigation failed:', targetScreen, error);
            // Fallback to home if navigation fails
            navigation.navigate('HomeTab');
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[
                styles.messageContainer,
                isUser ? styles.userContainer : styles.assistantContainer
            ]}>
                {!isUser && (
                    <View style={styles.assistantAvatar}>
                        <Image
                            source={require('../../assets/brand-logo.jpg')}
                            style={styles.fullAvatar}
                            resizeMode="cover"
                        />
                    </View>
                )}
                <View style={[styles.messageBubbleContainer, isUser && { alignItems: 'flex-end' }]}>
                    <View style={[
                        styles.bubble,
                        isUser
                            ? [styles.userBubble, { backgroundColor: colors.primary }]
                            : [styles.assistantBubble, { backgroundColor: colors.surface }]
                    ]}>
                        <Text style={[
                            styles.messageText,
                            { color: isUser ? '#FFFFFF' : colors.text }
                        ]}>
                            {item.text}
                        </Text>
                        <Text style={[
                            styles.timestamp,
                            { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
                        ]}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>

                    {/* Action Buttons for Assistant */}
                    {!isUser && item.actions && item.actions.length > 0 && (
                        <View style={styles.actionsContainer}>
                            {item.actions.map((action, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                    onPress={() => handleActionPress(action)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.actionButtonText}>{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {isUser && (
                    <View style={styles.userAvatar}>
                        {session?.user?.user_metadata?.avatar_url ? (
                            <Image
                                source={{ uri: session.user.user_metadata.avatar_url }}
                                style={styles.fullAvatar}
                            />
                        ) : (
                            <View style={styles.avatarLogoContainer}>
                                <Image
                                    source={require('../../assets/icon.png')}
                                    style={styles.avatarLogo}
                                    resizeMode="contain"
                                />
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{t('helper.assistant', 'ProvLy Assistant')}</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.primary }]}>{t('helper.inventoryHelper', 'Inventory Helper')}</Text>
                </View>
                <TouchableOpacity onPress={clearHistory} style={styles.resetButton}>
                    <MaterialCommunityIcons name="refresh" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Chat Area */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListFooterComponent={
                        !messages.some(m => m.role === 'user') ? (
                            <View style={styles.footerSuggestions}>
                                <View style={styles.suggestions}>
                                    <TouchableOpacity
                                        style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        onPress={() => sendMessage("What's my inventory summary?")}
                                    >
                                        <Text style={[styles.suggestionText, { color: colors.text }]}>📊 {t('helper.suggestSummary', 'Inventory Summary')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        onPress={() => sendMessage("What's missing photos?")}
                                    >
                                        <Text style={[styles.suggestionText, { color: colors.text }]}>📸 {t('helper.suggestMissing', 'Missing Photos')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        onPress={() => sendMessage(t('helper.missingSerial', "What items need serial numbers?"))}
                                    >
                                        <Text style={[styles.suggestionText, { color: colors.text }]}>🆔 {t('helper.suggestSerial', 'Serial Numbers')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        onPress={() => sendMessage("How do I file a claim?")}
                                    >
                                        <Text style={[styles.suggestionText, { color: colors.text }]}>📋 {t('helper.suggestClaims', 'Claims Help')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        onPress={() => sendMessage("What is ProvLy?")}
                                    >
                                        <Text style={[styles.suggestionText, { color: colors.text }]}>ℹ️ {t('helper.aboutApp', 'About This App')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ height: 20 }} />
                            </View>
                        ) : (
                            <View style={{ height: 40 }} />
                        )
                    }
                />

                {/* Follow-up Suggestions */}
                {messages.length > 0 && !isLoading && (
                    <View style={[styles.followUpContainer, { backgroundColor: colors.background }]}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.followUpScroll}
                        >
                            <TouchableOpacity
                                style={[styles.followUpChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => sendMessage("Show my most valuable items")}
                            >
                                <Text style={[styles.followUpText, { color: colors.text }]}>💰 {t('helper.mostValuable', 'Most Valuable')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.followUpChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => sendMessage("What items are missing prices?")}
                            >
                                <Text style={[styles.followUpText, { color: colors.text }]}>💰 {t('helper.needReceipts', 'Missing Prices?')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.followUpChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => sendMessage(t('helper.missingSerial', "What items need serial numbers?"))}
                            >
                                <Text style={[styles.followUpText, { color: colors.text }]}>🆔 {t('helper.suggestSerial', 'Serial Numbers')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.followUpChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => sendMessage("How do I export my inventory?")}
                            >
                                <Text style={[styles.followUpText, { color: colors.text }]}>📤 {t('helper.exportHelp', 'Export Help')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.followUpChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => sendMessage("What rooms have the most items?")}
                            >
                                <Text style={[styles.followUpText, { color: colors.text }]}>🏠 {t('helper.roomStats', 'Room Stats')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.followUpChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => sendMessage("How can I improve my claim readiness?")}
                            >
                                <Text style={[styles.followUpText, { color: colors.text }]}>✅ {t('helper.improveClaims', 'Improve Claims')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.followUpChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => sendMessage("What categories do I have?")}
                            >
                                <Text style={[styles.followUpText, { color: colors.text }]}>📂 {t('helper.categories', 'Categories')}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}

                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom || 8 }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                        placeholder={t('helper.askAboutInventory', 'Ask about your inventory...')}
                        placeholderTextColor={colors.textSecondary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        returnKeyType="send"
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            { backgroundColor: colors.primary },
                            (!inputText.trim() && !isLoading) && styles.sendButtonDisabled
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                </View>
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
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    messageContainer: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    assistantContainer: {
        justifyContent: 'flex-start',
    },
    assistantAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginTop: 4,
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginLeft: 8,
        overflow: 'hidden',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    avatarLogoContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLogo: {
        width: 24,
        height: 24,
    },
    fullAvatar: {
        width: '100%',
        height: '100%',
    },
    messageBubbleContainer: {
        flex: 1,
        maxWidth: '85%',
    },
    bubble: {
        padding: 14,
        borderRadius: 18,
    },
    userBubble: {
        borderBottomRightRadius: 4,
        alignSelf: 'flex-end',
    },
    assistantBubble: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    timestamp: {
        fontSize: 10,
        marginTop: 6,
        alignSelf: 'flex-end',
    },
    actionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 12,
        fontSize: 16,
        marginRight: 10,
        maxHeight: 100,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    headerContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    footerSuggestions: {
        marginTop: 10,
    },
    emptyLogo: {
        width: 80,
        height: 80,
        borderRadius: 20,
        marginBottom: 24,
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        maxWidth: '80%',
        marginBottom: 32,
    },
    suggestions: {
        width: '100%',
        gap: 12,
    },
    suggestionChip: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
    },
    suggestionText: {
        fontSize: 15,
        fontWeight: '600',
    },
    followUpContainer: {
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    followUpScroll: {
        paddingHorizontal: 12,
        gap: 8,
    },
    followUpChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
    },
    followUpText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
