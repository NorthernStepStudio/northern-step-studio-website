import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';
import { useSubscriptionStore } from './subscriptionStore';

interface AuthState {
    session: Session | null;
    loading: boolean;
    setSession: (session: Session | null) => void;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signUp: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
    updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<void>;
}

const AUTH_CALLBACK_PATH = 'auth/callback';
let authLinkingInitialized = false;

const getUrlParam = (url: string, key: string): string | null => {
    try {
        const parsed = new URL(url);
        const queryValue = parsed.searchParams.get(key);
        if (queryValue) return queryValue;

        const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash;
        if (hash) {
            const hashValue = new URLSearchParams(hash).get(key);
            if (hashValue) return hashValue;
        }
    } catch {
        const queryIndex = url.indexOf('?');
        if (queryIndex >= 0) {
            const queryPart = url.slice(queryIndex + 1).split('#')[0];
            const queryValue = new URLSearchParams(queryPart).get(key);
            if (queryValue) return queryValue;
        }

        const hashIndex = url.indexOf('#');
        if (hashIndex >= 0) {
            const hashValue = new URLSearchParams(url.slice(hashIndex + 1)).get(key);
            if (hashValue) return hashValue;
        }
    }

    return null;
};

const getEmailRedirectTo = (): string => {
    const envRedirect = process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL;
    if (envRedirect) return envRedirect;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin.replace(/\/$/, '')}/${AUTH_CALLBACK_PATH}`;
    }

    return `provly://${AUTH_CALLBACK_PATH}`;
};

const handleAuthRedirectUrl = async (url: string | null): Promise<void> => {
    if (!url || typeof url !== 'string') return;

    try {
        // Handles links like ...#access_token=...&refresh_token=...
        const access_token = getUrlParam(url, 'access_token');
        const refresh_token = getUrlParam(url, 'refresh_token');
        if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
            return;
        }

        // Handles PKCE links like ...?code=...
        const code = getUrlParam(url, 'code');
        if (typeof code === 'string' && code.length > 0) {
            await supabase.auth.exchangeCodeForSession(code);
        }
    } catch (error) {
        console.warn('Auth redirect handling failed:', error);
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    loading: true,

    setSession: (session) => set({ session, loading: false }),

    initialize: async () => {
        // Clear legacy offline mode if present
        try {
            await AsyncStorage.removeItem('provly_offline_mode');
        } catch (e) { }

        // Setup deep-link auth callback handler once.
        if (!authLinkingInitialized) {
            authLinkingInitialized = true;
            try {
                const initialUrl = await Linking.getInitialURL();
                await handleAuthRedirectUrl(initialUrl);
            } catch (error) {
                console.warn('Failed to process initial auth redirect URL:', error);
            }

            Linking.addEventListener('url', ({ url }) => {
                handleAuthRedirectUrl(url).catch(() => { });
            });
        }

        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Auth timeout')), 5000)
            );

            const sessionPromise = supabase.auth.getSession();
            const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
            const { data, error } = result;

            if (error) {
                console.error('Auth: getSession Error:', error);
                set({ loading: false });
                return;
            }

            if (data?.session) {
                console.log('Auth: Session found');

                // Enrich session with local avatar if available
                try {
                    const localAvatar = await AsyncStorage.getItem(`avatar_${data.session.user.id}`);
                    if (localAvatar) {
                        if (!data.session.user.user_metadata) data.session.user.user_metadata = {};
                        data.session.user.user_metadata.avatar_url = localAvatar;
                    }
                } catch (e) {
                    console.warn('Failed to load local avatar', e);
                }

                set({ session: data.session, loading: false });

                // Login to RevenueCat (fire and forget, handled internally)
                useSubscriptionStore.getState().login(data.session.user.id).catch(() => { });

            } else {
                console.log('Auth: No session');
                set({ loading: false });
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ loading: false });
        }

        // Setup listener separately so it doesn't block
        supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('Auth: State changed', _event);

            // Enrich session with local avatar if available
            if (session?.user) {
                try {
                    const localAvatar = await AsyncStorage.getItem(`avatar_${session.user.id}`);
                    if (localAvatar) {
                        // Ensure user_metadata exists
                        if (!session.user.user_metadata) session.user.user_metadata = {};
                        session.user.user_metadata.avatar_url = localAvatar;
                    }
                } catch (e) {
                    console.warn('Failed to load local avatar', e);
                }
            }

            set({ session, loading: false });
        });
    },

    signIn: async (email, password) => {
        set({ loading: true });
        // Clear offline mode when signing in with real credentials
        await AsyncStorage.removeItem('provly_offline_mode');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            set({ loading: false });
            throw error;
        }

        // Login to RevenueCat (fire and forget, handled internally)
        if (data.user?.id) {
            useSubscriptionStore.getState().login(data.user.id).catch(() => { });
        }
    },

    signInWithGoogle: async () => {
        set({ loading: true });
        await AsyncStorage.removeItem('provly_offline_mode');
        try {
            const redirectTo = getEmailRedirectTo();
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo },
            });
            if (error) {
                set({ loading: false });
                throw error;
            }
            // On native platforms, open the OAuth URL in the system browser
            if (data?.url && Platform.OS !== 'web') {
                await Linking.openURL(data.url);
            }
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    signUp: async (email, password) => {
        set({ loading: true });
        const emailRedirectTo = getEmailRedirectTo();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo,
            },
        });
        if (error) {
            set({ loading: false });
            throw error;
        }
        set({ loading: false }); // Fix: Unlock global loading state
        return data;
    },

    signOut: async () => {
        try {
            await supabase.auth.signOut();
            // We only remove the 'mode' flag so auto-login stops.
            // We KEEP the 'session' data so if they choose Offline Mode again, 
            // their name/avatar/ID is preserved. 
            await AsyncStorage.removeItem('provly_offline_mode');
            // await AsyncStorage.removeItem('provly_offline_session'); // COMMENTED OUT: Keep data!
        } catch (e) {
            console.error('SignOut error:', e);
        }
        set({ session: null });
        useSubscriptionStore.getState().logout().catch(() => { });
    },


    updateProfile: async (data: { full_name?: string; avatar_url?: string }) => {
        set({ loading: true });

        const currentSession = useAuthStore.getState().session;
        if (!currentSession) return;

        // Online mode - sync with Supabase
        // STRATEGY: Save avatar locally to avoid payload limits/errors. Sync only text data.

        const { avatar_url, ...remoteData } = data;
        let localAvatarUrl = avatar_url;

        // 1. Save Avatar Locally if present
        if (avatar_url && currentSession?.user?.id) {
            try {
                await AsyncStorage.setItem(`avatar_${currentSession.user.id}`, avatar_url);
            } catch (e) {
                console.error('Failed to save avatar locally', e);
            }
        }

        // 2. Sync Reamining Data (Name, etc) to Supabase
        const remoteDataKeys = Object.keys(remoteData);
        console.log('Auth: Syncing keys to Supabase:', remoteDataKeys);

        let userData = null;
        if (remoteDataKeys.length > 0) {
            console.log('Auth: Sending payload:', JSON.stringify(remoteData));
            const { error, data: supData } = await supabase.auth.updateUser({
                data: remoteData
            });

            if (error) {
                set({ loading: false });
                throw error;
            }
            userData = supData;
        }

        // 3. Update Local Session State
        set((state) => {
            if (!state.session) return { loading: false };

            const updatedUser = { ...state.session.user };

            // Merge remote updates if any
            if (userData?.user) {
                Object.assign(updatedUser, userData.user);
            }

            // Apply local avatar update manually
            if (localAvatarUrl) {
                updatedUser.user_metadata = {
                    ...updatedUser.user_metadata,
                    avatar_url: localAvatarUrl
                };
            } else if (remoteData.full_name) {
                // If we only updated name, ensure we keep the existing local avatar visible
                // (Though normally we wouldn't lose it unless we replaced the whole specific object ref awkwardly)
                // Just to be safe, we let the session object merge naturally? 
                // Actually, if userData.user comes back from server, it might NOT have the avatar_url in metadata 
                // if we never sent it! So we MUST re-apply the local avatar here.
                // We typically already have it in 'state.session.user.user_metadata.avatar_url' 
                // but let's be explicit.
            }

            return {
                session: { ...state.session, user: updatedUser },
                loading: false
            };
        });
    },
}));
