import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Switch,
    TextInput,
    Image,
    ActivityIndicator,
    Modal,
    Platform,
    Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useBuild } from '../contexts/BuildContext';
import { useChatUI } from '../contexts/ChatUIContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePriceTracking } from '../contexts/PriceTrackingContext';
import { useNotifications } from '../contexts/NotificationContext';
import GlassCard from '../components/GlassCard';
import { AVATAR_FRAMES } from '../core/constants';
import { FEATURES, getWebAdminConsoleUrl } from '../core/config';
import { darkTheme, sharedTheme } from '../theme/themes';
import { useTranslation } from '../core/i18n';
import { eventTracker } from '../state/eventTracker';
import { isTokens, restorePurchases } from '../billing/revenuecat';

// Static theme REMOVED - using dynamic theme only
// const theme = { ...darkTheme, ...sharedTheme };

export default function ProfileScreen({ navigation }) {
    const { user, logout, isAuthenticated, updateUser } = useAuth();
    const { savedBuilds = [], loadUserBuilds, syncBuilds } = useBuild(); // added syncBuilds
    const { refreshEntitlements } = useChatUI();
    const { theme, isDark, toggleTheme } = useTheme(); // Renamed currentTheme to theme for clarity/consistency
    const { trackedParts, getTrackedCount } = usePriceTracking();
    const { addProfileUpdatedNotification } = useNotifications();
    const { t } = useTranslation();
    const adminConsoleUrl = getWebAdminConsoleUrl();

    // Create dynamic styles
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    const [profileImage, setProfileImage] = useState(null);
    const [selectedFrame, setSelectedFrame] = useState('default');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editBio, setEditBio] = useState('');
    const [editName, setEditName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [saving, setSaving] = useState(false);

    const [syncing, setSyncing] = useState(false);
    const [pinnedBuilds, setPinnedBuilds] = useState([]);
    const [buildPhoto, setBuildPhoto] = useState(null);
    const [tokensActive, setTokensActive] = useState(false);

    // Pick user's own build photo
    const pickBuildPhoto = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant camera roll access to upload build photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const photoUri = result.assets[0].uri;
                setBuildPhoto(photoUri);
                // Save to AsyncStorage for persistence
                await AsyncStorage.setItem('nexusbuild_build_photo', photoUri);
                Alert.alert('Success', 'Build photo saved!');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    // ... (existing useEffects and handlers)

    const handleSync = async () => {
        setSyncing(true);
        try {
            const result = await syncBuilds();
            if (result.success) {
                Alert.alert(
                    'Sync Complete',
                    `Synced ${result.stats.total} builds (${result.stats.created} new, ${result.stats.updated} updated).`
                );
            } else {
                Alert.alert('Sync Failed', result.error || 'Unknown error');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleRestorePurchases = async () => {
        try {
            setSaving(true);
            await restorePurchases();
            const active = await isTokens();
            setTokensActive(active);
            await refreshEntitlements?.();
            Alert.alert('Restored', active ? 'Tokens are active.' : 'No active Token plan found.');
        } catch (error) {
            Alert.alert('Restore Failed', error?.message || 'Please try again.');
        } finally {
            setSaving(false);
        }
    };


    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated && user) {
                loadData();
            }
        }, [isAuthenticated, user])
    );

    useEffect(() => {
        eventTracker.track('profile_view', { authenticated: isAuthenticated });
    }, []);

    // Sync frame selection when user profile updates
    useEffect(() => {
        if (user?.profile?.frameId) {
            setSelectedFrame(user.profile.frameId);
        }
    }, [user?.profile?.frameId]);

    useEffect(() => {
        let mounted = true;
        isTokens()
            .then((active) => {
                if (mounted) setTokensActive(active);
            })
            .catch(() => {
                if (mounted) setTokensActive(false);
            });
        return () => {
            mounted = false;
        };
    }, []);


    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated && user) {
                loadData();
            }
        }, [isAuthenticated, user])
    );

    // Sync frame selection when user profile updates
    useEffect(() => {
        if (user?.profile?.frameId) {
            setSelectedFrame(user.profile.frameId);
        }
    }, [user?.profile?.frameId]);

    useEffect(() => {
        let mounted = true;
        isTokens()
            .then((active) => {
                if (mounted) setTokensActive(active);
            })
            .catch(() => {
                if (mounted) setTokensActive(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    // Check for admin notifications on mount
    useEffect(() => {
        const checkNotifications = async () => {
            if (user?.role === 'admin') {
                try {
                    const data = await AsyncStorage.getItem('admin_notifications');
                    if (data) {
                        const notifications = JSON.parse(data);
                        const unread = notifications.filter(n => !n.read);
                        if (unread.length > 0) {
                            if (Platform.OS === 'web') {
                                window.alert(`🔔 Admin Alert: ${unread[0].title}\n${unread[0].message}`);
                            } else {
                                Alert.alert('🔔 Admin Alert', `${unread[0].title}\n${unread[0].message}`, [
                                    { text: 'OK', onPress: () => markNotificationsRead(notifications) }
                                ]);
                            }
                        }
                    }
                } catch (err) {
                    console.log('Error checking admin notes', err);
                }
            }
        };

        if (isAuthenticated) {
            checkNotifications();
        }
    }, [isAuthenticated, user]);

    const markNotificationsRead = async (all) => {
        const updated = all.map(n => ({ ...n, read: true }));
        await AsyncStorage.setItem('admin_notifications', JSON.stringify(updated));
    };

    const loadData = async () => {
        try {
            await loadUserBuilds(user.id);

            // Load pinned builds (plural)
            const pinnedData = await AsyncStorage.getItem('nexusbuild_pinned_builds');
            let pinnedIds = [];

            if (pinnedData) {
                pinnedIds = JSON.parse(pinnedData);
            } else {
                // Fallback to legacy single pin
                const legacyPin = await AsyncStorage.getItem('nexusbuild_pinned_build');
                if (legacyPin) pinnedIds = [legacyPin];
            }

            if (pinnedIds.length > 0) {
                const buildsData = await AsyncStorage.getItem('nexusbuild_saved_builds');
                const builds = buildsData ? JSON.parse(buildsData) : [];

                // Map IDs to actual build objects
                const foundPins = pinnedIds.map(id =>
                    builds.find(b => b.id?.toString() === id.toString() || b.id === id)
                ).filter(Boolean); // Filter out nulls if build was deleted

                setPinnedBuilds(foundPins);
            } else {
                setPinnedBuilds([]);
            }

            // Load saved build photo
            const savedPhoto = await AsyncStorage.getItem('nexusbuild_build_photo');
            if (savedPhoto) {
                setBuildPhoto(savedPhoto);
            }
        } catch (e) {
            // Silently fail
        }
        if (user.profile?.bio) setEditBio(user.profile.bio);
        if (user.profile?.frameId) setSelectedFrame(user.profile.frameId);
        if (user.avatar) setProfileImage(user.avatar);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera roll access is required');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setProfileImage(`data:image/jpeg;base64,${asset.base64}`);
        }
    };

    const openEditModal = () => {
        setEditName(user?.displayName || user?.username || '');
        setEditBio(user?.profile?.bio || '');
        setSelectedFrame(user?.profile?.frameId || 'default');
        setShowEditModal(true);
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            if (showPasswordChange && newPassword) {
                if (newPassword !== newPasswordConfirm) {
                    throw new Error('Passwords do not match');
                }
                if (newPassword.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }
            }

            const updates = {
                displayName: editName,
                username: editName,
                profile: {
                    ...user?.profile,
                    bio: editBio,
                    frameId: selectedFrame,
                },
                avatar: profileImage,
                profile_image: profileImage,
            };

            if (showPasswordChange && newPassword) {
                updates.password = newPassword;
            }

            await updateUser(updates);
            // Trigger notification
            addProfileUpdatedNotification();
            // Web-compatible alert
            if (Platform.OS === 'web') {
                window.alert('Profile updated successfully!');
            } else {
                Alert.alert('Success', 'Profile updated successfully!');
            }
            setShowEditModal(false);
            setNewPassword('');
            setNewPasswordConfirm('');
            setShowPasswordChange(false);
        } catch (error) {
            const msg = error.message || 'Failed to update profile';
            if (Platform.OS === 'web') {
                window.alert(msg);
            } else {
                Alert.alert('Error', msg);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigation.navigate('HomeTab');
    };

    const goToLogin = () => {
        navigation.navigate('ProfileTab', { screen: 'Login' });
    };

    const goToRegister = () => {
        navigation.navigate('ProfileTab', { screen: 'Register' });
    };

    // Not logged in state
    if (!isAuthenticated) {
        return (
            <Layout>
                <Header navigation={navigation} />
                <View style={styles.notLoggedIn}>
                    <LinearGradient
                        colors={[theme.colors.accentPrimary + '20', 'transparent']}
                        style={styles.glowCircle}
                    />
                    <Ionicons name="person-circle-outline" size={120} color={theme.colors.textMuted} />
                    <Text style={styles.notLoggedInTitle}>Welcome to NexusBuild</Text>
                    <Text style={styles.notLoggedInText}>
                        Sign in to save your builds, use AI chat, and join the community
                    </Text>
                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={goToLogin}
                    >
                        <LinearGradient
                            colors={theme.gradients.primary}
                            style={styles.signInGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="log-in-outline" size={20} color="white" />
                            <Text style={styles.signInText}>Sign In</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={goToRegister}>
                        <Text style={styles.registerLink}>Don't have an account? <Text style={{ color: theme.colors.accentPrimary }}>Sign Up</Text></Text>
                    </TouchableOpacity>
                </View>
            </Layout>
        );
    }

    const isAdmin = user?.role === 'admin' || user?.is_admin === true || user?.is_moderator === true || user?.username === 'DevUser' || user?.email?.toLowerCase().endsWith('@nexusbuild.app') || user?.email === 'admin@nexus.com';
    const currentFrame = Object.values(AVATAR_FRAMES).find(f => f.id === selectedFrame) || AVATAR_FRAMES.DEFAULT;

    return (
        <Layout scrollable={false}>
            <Header navigation={navigation} />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* Profile Header Card */}
                <GlassCard style={styles.profileCard}>
                    <LinearGradient
                        colors={[theme.colors.accentPrimary + '30', 'transparent']}
                        style={styles.profileGlow}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                    />

                    {/* Avatar with Frame */}
                    <View style={styles.avatarContainer}>
                        {currentFrame.borderColor ? (
                            <LinearGradient
                                colors={currentFrame.borderColor}
                                style={[
                                    styles.frameBorder,
                                    { borderRadius: currentFrame.shape === 'square' ? 16 : currentFrame.shape === 'hexagon' ? 30 : 60 }
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {profileImage ? (
                                    <Image
                                        source={{ uri: profileImage }}
                                        style={[
                                            styles.avatarFramed,
                                            { borderRadius: currentFrame.shape === 'square' ? 12 : currentFrame.shape === 'hexagon' ? 25 : 50 }
                                        ]}
                                    />
                                ) : (
                                    <View style={[
                                        styles.avatarPlaceholderFramed,
                                        { borderRadius: currentFrame.shape === 'square' ? 12 : currentFrame.shape === 'hexagon' ? 25 : 50 }
                                    ]}>
                                        <Text style={styles.avatarInitial}>
                                            {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                        </Text>
                                    </View>
                                )}
                            </LinearGradient>
                        ) : (
                            profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarInitial}>
                                        {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                    </Text>
                                </View>
                            )
                        )}
                    </View>

                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.displayName}>{user?.displayName || user?.username || t('common.user')}</Text>
                            {isAdmin && (
                                <View style={styles.adminBadge}>
                                    <Ionicons name="shield-checkmark" size={12} color="#000" />
                                    <Text style={styles.adminText}>{t('common.admin')}</Text>
                                </View>
                            )}
                            {tokensActive && (
                                <View style={styles.proBadge}>
                                    <Ionicons name="star" size={12} color="#111827" />
                                    <Text style={styles.proText}>AI Tokens</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.bio}>{user?.profile?.bio || t('profile.defaultBio')}</Text>

                        {/* Edit Profile Button */}
                        <TouchableOpacity style={styles.editProfileBtn} onPress={openEditModal}>
                            <Ionicons name="create-outline" size={16} color={theme.colors.accentPrimary} />
                            <Text style={styles.editProfileText}>{t('profile.editProfile')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Ionicons name="construct" size={24} color={theme.colors.accentPrimary} />
                            <Text style={styles.statValue}>{savedBuilds.length}</Text>
                            <Text style={styles.statLabel}>{t('profile.stats.builds')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Ionicons name="star" size={24} color={theme.colors.warning} />
                            <Text style={styles.statValue}>Lvl 5</Text>
                            <Text style={styles.statLabel}>{t('profile.stats.rank')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Ionicons name="chatbubble-ellipses" size={24} color={theme.colors.accentSecondary} />
                            <Text style={styles.statValue}>{tokensActive ? 'Active' : 'Free'}</Text>
                            <Text style={styles.statLabel}>AI Power</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Pinned Build Section */}
                {(pinnedBuilds.length > 0) && (
                    <>
                        <Text style={styles.sectionTitle}>📌 Pinned Builds</Text>
                        {pinnedBuilds.map((build, index) => (
                            <GlassCard key={build.id || index} style={[styles.pinnedBuildCard, { marginBottom: 16 }]}>
                                <View style={styles.pinnedBuildHeader}>
                                    <Ionicons name="star" size={24} color={theme.colors.warning} />
                                    <Text style={styles.pinnedBuildName}>{build.name || 'My Build'}</Text>
                                </View>

                                <View style={styles.pinnedContentRow}>
                                    {/* Left Side: Parts List */}
                                    <View style={styles.pinnedPartsColumn}>
                                        {Object.entries(build.parts || {}).slice(0, 4).map(([key, part]) => (
                                            part && (
                                                <View key={key} style={styles.pinnedPart}>
                                                    <Text style={styles.pinnedPartCategory}>{key.toUpperCase()}</Text>
                                                    <Text numberOfLines={1} style={styles.pinnedPartName}>{part.name}</Text>
                                                </View>
                                            )
                                        ))}
                                    </View>

                                    {/* Right Side: Build Photo (Case Image Only) */}
                                    <View style={styles.buildPhotoContainerRight}>
                                        {build.parts?.case?.image_url ? (
                                            <Image
                                                source={{ uri: build.parts.case.image_url }}
                                                style={styles.buildPhoto}
                                            />
                                        ) : (
                                            <View style={styles.buildPhotoPlaceholder}>
                                                <Ionicons name="desktop-outline" size={32} color={theme.colors.textMuted} />
                                                <Text style={styles.buildPhotoHint}>No Case Image</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.pinnedBuildFooter}>
                                    <Text style={styles.pinnedBuildPrice}>
                                        ${build.total_price?.toFixed(2) || '0.00'}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.viewBuildBtn}
                                        onPress={() => {
                                            navigation.navigate('BuilderTab', {
                                                screen: 'BuilderMain',
                                                params: { initialBuild: build }
                                            });
                                        }}
                                    >
                                        <Text style={styles.viewBuildBtnText}>View Full Build</Text>
                                    </TouchableOpacity>
                                </View>
                            </GlassCard>
                        ))}
                    </>
                )}

                {/* Admin Dashboard (Only for Admins) */}
                {isAdmin && FEATURES.WEB_ADMIN_CONSOLE && (
                    <>
                        <Text style={styles.sectionTitle}>🛡️ Admin Control</Text>
                        <TouchableOpacity style={styles.actionCard} onPress={() => Linking.openURL(adminConsoleUrl)}>
                            <LinearGradient colors={['#EF444420', 'transparent']} style={styles.actionGlow} />
                        <Ionicons name="open-outline" size={32} color="#EF4444" />
                        <Text style={styles.actionText}>Open Website Admin</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>{t('profile.quickActions')}</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('BuilderTab', { screen: 'BuilderMain' })}>
                        <LinearGradient colors={['#FF6B6B20', 'transparent']} style={styles.actionGlow} />
                        <Ionicons name="add-circle" size={32} color="#FF6B6B" />
                        <Text style={styles.actionText}>{t('profile.newBuild') || 'Start Builder'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('GameLibrary')}>
                        <LinearGradient colors={['#8B5CF620', 'transparent']} style={styles.actionGlow} />
                        <Ionicons name="game-controller" size={32} color="#8B5CF6" />
                        <Text style={styles.actionText}>Game Library</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('WorkstationLibrary')}>
                        <LinearGradient colors={['#10B98120', 'transparent']} style={styles.actionGlow} />
                        <Ionicons name="desktop" size={32} color="#10B981" />
                        <Text style={styles.actionText}>Workstation</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('BuilderTab', { screen: 'MyBuilds' })}>
                        <LinearGradient colors={['#4ECDC420', 'transparent']} style={styles.actionGlow} />
                        <Ionicons name="albums" size={32} color="#4ECDC4" />
                        <Text style={styles.actionText}>{t('profile.myBuilds')}</Text>
                    </TouchableOpacity>


                    {/* Renamed Gallery to Community and Updated Icon/Nav */}
                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MenuTab', { screen: 'Community' })}>
                        <LinearGradient colors={['#A855F720', 'transparent']} style={styles.actionGlow} />
                        <Ionicons name="people" size={32} color="#A855F7" />
                        <Text style={styles.actionText}>{t('nav.community')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ChatTab', { screen: 'ChatMain', params: { mode: 'assistant' } })}>
                        <LinearGradient colors={['#8B5CF620', 'transparent']} style={styles.actionGlow} />
                        <Ionicons name="sparkles" size={32} color="#8B5CF6" />
                        <Text style={styles.actionText}>Assistant Chat</Text>
                    </TouchableOpacity>
                </View>

                {/* Settings Section */}
                <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
                <GlassCard style={styles.settingsCard}>
                    {/* Dark Mode Toggle */}
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Ionicons name={isDark ? "moon" : "sunny"} size={22} color={theme.colors.accentPrimary} />
                            <Text style={styles.settingText}>{t('profile.darkMode')}</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: theme.colors.accentPrimary }}
                            thumbColor={isDark ? '#fff' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                        />
                    </View>

                    <View style={styles.settingDivider} />

                    {/* Notifications */}
                    <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Notifications')}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="notifications-outline" size={22} color={theme.colors.textSecondary} />
                            <Text style={styles.settingText}>{t('profile.notifications')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>

                    {FEATURES.PRICE_TRACKING && (
                        <>
                            <View style={styles.settingDivider} />

                            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('TrackedParts')}>
                                <View style={styles.settingLeft}>
                                    <Ionicons name="pricetag-outline" size={22} color="#F59E0B" />
                                    <Text style={styles.settingText}>{t('profile.priceAlerts')}</Text>
                                    {getTrackedCount() > 0 && (
                                        <View style={{ backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 8 }}>
                                            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{getTrackedCount()}</Text>
                                        </View>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                            </TouchableOpacity>

                            <View style={styles.settingDivider} />
                        </>
                    )}
                    {/* Sync Builds */}
                    <TouchableOpacity style={styles.settingRow} onPress={handleSync} disabled={syncing}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="cloud-upload-outline" size={22} color={theme.colors.accentSecondary} />
                            <Text style={styles.settingText}>Cloud Backup</Text>
                        </View>
                        {syncing ? (
                            <ActivityIndicator size="small" color={theme.colors.accentSecondary} />
                        ) : (
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                        )}
                    </TouchableOpacity>

                    <View style={styles.settingDivider} />

                    {/* Upgrade */}
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => {
                            eventTracker.track('upgrade_click', { source: 'profile_settings' });
                            navigation.navigate('Store');
                        }}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="star-outline" size={22} color="#F59E0B" />
                            <Text style={styles.settingText}>Get AI Tokens</Text>
                            {tokensActive && (
                                <View style={{ backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 8 }}>
                                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>Tokens</Text>
                                </View>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.settingDivider} />

                    {/* Restore Purchases */}
                    <TouchableOpacity style={styles.settingRow} onPress={handleRestorePurchases}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="refresh-outline" size={22} color={theme.colors.accentPrimary} />
                            <Text style={styles.settingText}>Restore Purchases</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.settingDivider} />

                    {/* Help */}
                    <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('HelpSupport')}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="help-circle-outline" size={22} color={theme.colors.textSecondary} />
                            <Text style={styles.settingText}>{t('profile.helpAndSupport')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>


                </GlassCard>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
                    <Text style={styles.logoutText}>{t('profile.signOut')}</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={showEditModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <GlassCard style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('profile.editProfileModal.title')}</Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Avatar Edit */}
                            <View style={styles.modalAvatarSection}>
                                <TouchableOpacity onPress={pickImage} style={styles.modalAvatarContainer}>
                                    {profileImage ? (
                                        <Image source={{ uri: profileImage }} style={styles.modalAvatar} />
                                    ) : (
                                        <View style={styles.modalAvatarPlaceholder}>
                                            <Text style={styles.modalAvatarInitial}>
                                                {user?.displayName?.charAt(0) || 'U'}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.modalAvatarBadge}>
                                        <Ionicons name="camera" size={16} color="white" />
                                    </View>
                                </TouchableOpacity>
                                <Text style={styles.modalAvatarHint}>{t('profile.editProfileModal.changeAvatar')}</Text>
                            </View>

                            {/* Frame Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{t('profile.editProfileModal.avatarFrame')} {isAdmin && <Text style={{ color: theme.colors.warning }}>{t('profile.editProfileModal.unlocked')}</Text>}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 15, paddingVertical: 10 }}>
                                    {Object.values(AVATAR_FRAMES).map((frame) => {
                                        const isLocked = frame.locked && !isAdmin;
                                        const isSelected = selectedFrame === frame.id;
                                        return (
                                            <TouchableOpacity
                                                key={frame.id}
                                                onPress={() => !isLocked && setSelectedFrame(frame.id)}
                                                style={[
                                                    styles.frameOption,
                                                    isSelected && styles.frameOptionSelected,
                                                    isLocked && styles.frameOptionLocked
                                                ]}
                                            >
                                                {frame.borderColor ? (
                                                    <LinearGradient
                                                        colors={frame.borderColor}
                                                        style={[
                                                            styles.framePreview,
                                                            { borderRadius: frame.shape === 'square' ? 8 : frame.shape === 'hexagon' ? 15 : 30 }
                                                        ]}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 1 }}
                                                    >
                                                        <View style={[
                                                            styles.framePreviewInner,
                                                            { borderRadius: frame.shape === 'square' ? 6 : frame.shape === 'hexagon' ? 12 : 25 }
                                                        ]} />
                                                    </LinearGradient>
                                                ) : (
                                                    <View style={[styles.framePreview, { backgroundColor: theme.colors.bgTertiary, justifyContent: 'center', alignItems: 'center', borderRadius: 30 }]}>
                                                        <Ionicons name="ellipse-outline" size={24} color={theme.colors.textMuted} />
                                                    </View>
                                                )}
                                                {isLocked && (
                                                    <View style={styles.lockOverlay}>
                                                        <Ionicons name="lock-closed" size={16} color="white" />
                                                    </View>
                                                )}
                                                <Text style={[styles.frameLabel, isSelected && { color: theme.colors.accentPrimary }]}>{frame.name}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>

                            {/* Display Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{t('profile.editProfileModal.displayName')}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder={t('profile.editProfileModal.enterName')}
                                    placeholderTextColor={theme.colors.textMuted}
                                />
                            </View>

                            {/* Bio */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{t('profile.editProfileModal.bio')}</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={editBio}
                                    onChangeText={setEditBio}
                                    placeholder={t('profile.editProfileModal.bioPlaceholder')}
                                    placeholderTextColor={theme.colors.textMuted}
                                    multiline
                                    numberOfLines={3}
                                    maxLength={160}
                                />
                                <Text style={styles.charCount}>{editBio.length}/160</Text>
                            </View>

                            {/* Email Address (Read Only) */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{(() => { const val = t('profile.editProfileModal.email'); return val && !val.includes('.') ? val : 'Email Address'; })()}</Text>
                                <TextInput
                                    style={[styles.input, { opacity: 0.7, color: theme.colors.textSecondary }]}
                                    value={user?.email}
                                    editable={false}
                                />
                            </View>

                            {/* Password Change Section */}
                            <View style={[styles.inputGroup, { marginVertical: 10 }]}>
                                <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}
                                    onPress={() => setShowPasswordChange(!showPasswordChange)}
                                >
                                    <Text style={[styles.inputLabel, { marginBottom: 0 }]}>{(() => { const val = t('profile.editProfileModal.security'); return val && !val.includes('.') ? val : 'Security'; })()}</Text>
                                    <Ionicons name={showPasswordChange ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>

                                {showPasswordChange && (
                                    <View style={{ gap: 10 }}>
                                        <View>
                                            <Text style={[styles.label, { fontSize: 12, marginBottom: 5, color: theme.colors.textSecondary }]}>New Password</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={newPassword}
                                                onChangeText={setNewPassword}
                                                placeholder="New Password"
                                                placeholderTextColor={theme.colors.textMuted}
                                                secureTextEntry
                                            />
                                        </View>
                                        <View>
                                            <Text style={[styles.label, { fontSize: 12, marginBottom: 5, color: theme.colors.textSecondary }]}>Confirm Password</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={newPasswordConfirm}
                                                onChangeText={setNewPasswordConfirm}
                                                placeholder="Confirm New Password"
                                                placeholderTextColor={theme.colors.textMuted}
                                                secureTextEntry
                                            />
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* Save Button */}
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={saveProfile}
                                disabled={saving}
                            >
                                <LinearGradient
                                    colors={theme.gradients.primary}
                                    style={styles.saveGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark" size={20} color="white" />
                                            <Text style={styles.saveText}>{t('profile.editProfileModal.saveChanges')}</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </GlassCard>
                </View>
            </Modal>
        </Layout >
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 10,
        backgroundColor: theme.colors.bgPrimary,
    },
    frameOverlay: {
        position: 'absolute',
        width: 140, // Larger than avatar (100)
        height: 140,
        top: -20,
        left: -20,
        zIndex: 0, // Behind avatar
    },
    frameBorder: {
        width: 116, // Avatar (100) + padding (8*2)
        height: 116,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarFramed: {
        width: 100,
        height: 100,
    },
    avatarPlaceholderFramed: {
        width: 100,
        height: 100,
        backgroundColor: theme.colors.bgTertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    frameOption: {
        alignItems: 'center',
        padding: 5,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    frameOptionSelected: {
        borderColor: theme.colors.accentPrimary,
        backgroundColor: theme.colors.accentPrimary + '10',
    },
    frameOptionLocked: {
        opacity: 0.5,
    },
    framePreview: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    framePreviewInner: {
        width: 44,
        height: 44,
        backgroundColor: theme.colors.bgPrimary,
    },
    frameLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
    },
    lockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 20, // Leave label visible
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
    },

    // Not Logged In
    notLoggedIn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: theme.colors.bgPrimary,
    },
    glowCircle: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.5,
    },
    notLoggedInTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginTop: 20,
        textAlign: 'center',
    },
    notLoggedInText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 30,
        lineHeight: 24,
    },
    signInButton: {
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: 15,
        ...theme.shadows.button,
    },
    signInGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 50,
        gap: 10,
    },
    signInText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    registerLink: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },

    // Profile Card
    profileCard: {
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        overflow: 'hidden',
        backgroundColor: theme.colors.glassBg,
        borderColor: theme.colors.glassBorder,
        borderWidth: 1,
        borderRadius: 24,
    },
    profileGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: theme.colors.accentPrimary,
        zIndex: 1, // Above frame
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.bgTertiary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.accentPrimary,
        zIndex: 1, // Above frame
    },
    avatarInitial: {
        fontSize: 40,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    avatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.accentPrimary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.bgPrimary,
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
    },
    displayName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    adminText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    proBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDE68A',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    proText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#111827',
    },
    email: {
        fontSize: 14,
        color: theme.colors.textMuted,
        marginBottom: 8,
    },
    bio: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: theme.colors.glassBorder,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginVertical: 4,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: theme.colors.glassBorder,
    },
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: theme.colors.bgSecondary,
        marginTop: 10,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    editProfileText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },

    // Quick Actions
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 15,
        marginTop: 10,
        marginLeft: 4,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 30,
    },
    actionCard: {
        flexBasis: '30%', // Grid of 3 roughly
        flexGrow: 1,
        backgroundColor: theme.colors.glassBg,
        borderColor: theme.colors.glassBorder,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 110,
        overflow: 'hidden',
    },
    actionGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginTop: 10,
        textAlign: 'center',
    },

    // Settings
    settingsCard: {
        backgroundColor: theme.colors.glassBg,
        borderColor: theme.colors.glassBorder,
        borderWidth: 1,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 30,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    settingDivider: {
        height: 1,
        backgroundColor: theme.colors.glassBorder,
        marginLeft: 54, // Align with text
    },

    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: theme.colors.error + '10',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.error + '30',
        gap: 8,
        marginBottom: 40,
    },
    logoutText: {
        fontSize: 16,
        fontweight: '600',
        color: theme.colors.error,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.bgSecondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
        borderColor: theme.colors.glassBorder,
        borderWidth: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    modalAvatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalAvatarContainer: {
        position: 'relative',
    },
    modalAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    modalAvatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.bgTertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalAvatarInitial: {
        fontSize: 40,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    modalAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.accentPrimary,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.bgSecondary,
    },
    modalAvatarHint: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 8,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.colors.bgTertiary, // Use theme background, not input hardcode
        color: theme.colors.textPrimary,
        padding: 12,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        alignSelf: 'flex-end',
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 4,
    },
    saveButton: {
        borderRadius: 30,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 30,
        ...theme.shadows.button,
    },
    saveGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        gap: 10,
    },
    saveText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginTop: 6,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 50,
        backgroundColor: theme.colors.glassBorder,
    },

    // Section Title
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },

    // Actions Grid
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    actionCard: {
        width: '48%',
        backgroundColor: theme.colors.glassBg,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        overflow: 'hidden',
    },
    actionGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    actionText: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },

    // Settings Card
    settingsCard: {
        marginBottom: 20,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    settingDivider: {
        height: 1,
        backgroundColor: theme.colors.glassBorder,
        marginHorizontal: 16,
    },

    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: theme.colors.error + '40',
        borderRadius: 12,
        backgroundColor: theme.colors.error + '10',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.error,
    },

    // Edit Profile Button
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: theme.colors.accentPrimary + '20',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.accentPrimary,
    },
    editProfileText: {
        color: theme.colors.accentPrimary,
        fontSize: 14,
        fontWeight: '600',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        maxHeight: '80%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    modalAvatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalAvatarContainer: {
        position: 'relative',
    },
    modalAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: theme.colors.accentPrimary,
    },
    modalAvatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.bgTertiary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.accentPrimary,
    },
    modalAvatarInitial: {
        fontSize: 40,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    modalAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.accentPrimary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalAvatarHint: {
        marginTop: 10,
        color: theme.colors.textMuted,
        fontSize: 13,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.colors.glassBg,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    charCount: {
        textAlign: 'right',
        marginTop: 6,
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    saveButton: {
        borderRadius: 25,
        overflow: 'hidden',
        marginTop: 10,
    },
    saveGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    saveText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        maxHeight: '80%',
        borderRadius: 24,
        padding: 20,
        backgroundColor: theme.colors.glassBg,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    modalAvatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalAvatarContainer: {
        position: 'relative',
    },
    modalAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    modalAvatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalAvatarInitial: {
        fontSize: 40,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
    },
    modalAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.accentPrimary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.bgPrimary,
    },
    modalAvatarHint: {
        marginTop: 8,
        fontSize: 12,
        color: theme.colors.accentPrimary,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.colors.bgTertiary,
        borderRadius: 12,
        padding: 12, // Reduced padding for better fit
        color: theme.colors.textPrimary,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    frameOption: {
        alignItems: 'center',
        gap: 8,
    },
    frameOptionSelected: {
        opacity: 1,
    },
    frameOptionLocked: {
        opacity: 0.5,
    },
    framePreview: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    framePreviewInner: {
        width: 50,
        height: 50,
        backgroundColor: theme.colors.bgTertiary,
    },
    frameLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    lockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 30,
    },

    // Pinned Build Styles
    pinnedBuildCard: {
        padding: 16,
        marginBottom: 24,
        backgroundColor: theme.colors.glassBg,
        borderColor: theme.colors.warning + '40',
        borderWidth: 1,
        borderRadius: 16,
    },
    pinnedBuildHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    pinnedBuildName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        flex: 1,
    },
    pinnedBuildParts: {
        gap: 8,
        marginBottom: 12,
    },
    pinnedPart: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pinnedPartCategory: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.accentPrimary,
        width: 60,
    },
    pinnedPartName: {
        fontSize: 13,
        color: theme.colors.textPrimary, // Changed to textPrimary for better visibility
        flex: 1,
    },
    pinnedBuildFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: theme.colors.glassBorder,
        paddingTop: 12,
        marginTop: 8,
    },
    pinnedBuildPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.success,
    },
    viewBuildBtn: {
        backgroundColor: theme.colors.accentPrimary + '20',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    viewBuildBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.accentPrimary,
    },

    // Build Photo Styles
    pinnedContentRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    pinnedPartsColumn: {
        flex: 1,
        justifyContent: 'center',
        gap: 8,
    },
    buildPhotoContainerRight: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginBottom: 0,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.colors.bgTertiary,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    buildPhoto: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    buildPhotoPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.bgTertiary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: theme.colors.glassBorder,
        borderRadius: 12,
    },
    buildPhotoHint: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 8,
    },
    buildPhotoBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: theme.colors.accentPrimary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    partThumbnail: {
        width: 28,
        height: 28,
        borderRadius: 4,
    },
});
