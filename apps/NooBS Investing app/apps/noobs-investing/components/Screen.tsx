import React, { useImperativeHandle, useRef, useEffect, useMemo } from "react";
import { View, Text, StatusBar as RNStatusBar, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRouter, usePathname } from "expo-router";
import { theme } from "../constants/theme";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { onScrollToTop } from "../utils/scrollEvents";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNotifications } from "./NotificationContext";
import { useI18n } from "../i18n";

const translateStringNode = (
    value: string,
    tr: (text: string) => string
): string => {
    const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!match) {
        return tr(value);
    }
    const [, prefix, core, suffix] = match;
    if (!core) {
        return value;
    }
    return `${prefix}${tr(core)}${suffix}`;
};

const translateNodeTree = (
    node: React.ReactNode,
    tr: (text: string) => string
): React.ReactNode => {
    if (typeof node === "string") {
        return translateStringNode(node, tr);
    }
    if (Array.isArray(node)) {
        return node.map((entry, index) => {
            const translated = translateNodeTree(entry, tr);
            return React.isValidElement(translated)
                ? translated
                : <React.Fragment key={index}>{translated}</React.Fragment>;
        });
    }
    if (!React.isValidElement(node)) {
        return node;
    }

    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    const props = element.props;
    if (props.children === undefined) {
        return element;
    }

    const translatedChildren = translateNodeTree(props.children, tr);
    return React.cloneElement(element, element.props, translatedChildren);
};

export interface ScreenHandle {
    scrollToTop: (callback?: () => void) => void;
    exitAnimation: (callback: () => void) => void;
}

export const Screen = React.forwardRef(({
    children,
    scroll = true,
    safeTop = false,
    hideHeader = false,
    headerLeft,
}: {
    children: React.ReactNode;
    scroll?: boolean;
    safeTop?: boolean;
    hideHeader?: boolean;
    headerLeft?: React.ReactNode;
}, ref) => {
    const insets = useSafeAreaInsets();
    const scrollRef = useRef<ScrollView>(null);
    const router = useRouter();
    const pathname = usePathname();
    const { history } = useNotifications();
    const { t, tr, language } = useI18n();
    const translatedChildren = useMemo(
        () => (language === "es" ? translateNodeTree(children, tr) : children),
        [children, language, tr]
    );
    const translatedHeaderLeft = useMemo(
        () => (language === "es" ? translateNodeTree(headerLeft, tr) : headerLeft),
        [headerLeft, language, tr]
    );

    // Shared values for exit animation
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        flex: 1,
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { translateY: translateY.value }
        ]
    }));

    // Reset animation values when component focuses
    // This prevents the screen from getting 'stuck' in an exit state 
    // if a tab switch happens during an animation.
    const navigationInternal = useNavigation();
    useEffect(() => {
        const unsubscribe = navigationInternal.addListener('focus', () => {
            console.log("[Screen] Resetting animation values on focus");
            opacity.value = withTiming(1, { duration: 0 });
            scale.value = withTiming(1, { duration: 0 });
            translateY.value = withTiming(0, { duration: 0 });
        });
        return unsubscribe;
    }, [navigationInternal]);

    // Listen for global scroll-to-top events (from tab bar)
    useEffect(() => {
        const unsubscribe = onScrollToTop(() => {
            console.log("[Screen] Received scroll-to-top event - scrolling!");
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        });
        return unsubscribe;
    }, []);

    useImperativeHandle(ref, () => ({
        scrollToTop: (callback?: () => void) => {
            console.log("[VelocityFlow] Scrolling to top");
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            if (callback) setTimeout(callback, 500);
        },
        exitAnimation: (callback: () => void) => {
            console.log("[VelocityFlow] Starting Scroll-to-Top Exit Animation");

            // First: Scroll to top smoothly (this is the key visual effect)
            scrollRef.current?.scrollTo({ y: 0, animated: true });

            // Simultaneously: Fade out and scale as we scroll up
            opacity.value = withTiming(0.3, { duration: 400 });
            scale.value = withTiming(0.95, { duration: 400 }, () => {
                // After animation completes, trigger navigation
                runOnJS(callback)();
            });
        }
    }));

    const style = { flex: 1, backgroundColor: theme.colors.bg };
    const paddingTop = safeTop ? Math.max(insets.top, 0) : 0;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={style}
        >
            <Animated.View style={[{ flex: 1, paddingTop }, animatedStyle]}>
                {!hideHeader && (
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        paddingHorizontal: 24,
                        paddingTop: safeTop ? 0 : insets.top,
                        paddingBottom: 8,
                        zIndex: 100,
                    }}>
                        <View>
                            {translatedHeaderLeft}
                        </View>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <Pressable
                                onPress={() => {
                                    if (pathname !== '/notifications') router.push('/notifications' as any);
                                }}
                                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}
                            >
                                <MaterialCommunityIcons name="bell-outline" size={24} color={theme.colors.text} />
                                {history.length > 0 && (
                                    <View style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.danger, borderWidth: 2, borderColor: theme.colors.card }} />
                                )}
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    if (pathname !== '/settings') router.push('/settings' as any);
                                }}
                                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}
                            >
                                <MaterialCommunityIcons name="cog-outline" size={24} color={theme.colors.text} />
                            </Pressable>
                        </View>
                    </View>
                )}
                {scroll ? (
                    <ScrollView
                        ref={scrollRef as any}
                        style={{ flex: 1 }}
                        contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: insets.bottom + 24 }}
                        keyboardShouldPersistTaps="handled"
                        scrollEventThrottle={16}
                    >
                        {translatedChildren}
                    </ScrollView>
                ) : (
                    <View style={{ flex: 1, padding: 24, gap: 16, paddingBottom: insets.bottom + 24 }}>
                        {translatedChildren}
                    </View>
                )}

                {/* Global Disclaimer Footer */}
                <View style={{
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                    alignItems: 'center',
                    paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 12
                }}>
                    <Text style={{
                        color: theme.colors.faint,
                        fontSize: 10,
                        fontWeight: '700',
                        textAlign: 'center',
                        paddingHorizontal: 24
                    }}>
                        {t("screen.footerDisclaimer")}
                    </Text>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    );
});
