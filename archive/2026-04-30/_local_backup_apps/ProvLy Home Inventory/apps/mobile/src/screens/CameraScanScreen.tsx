import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Animated,
    Easing,
    TouchableOpacity,
    Dimensions,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImageManipulator from 'expo-image-manipulator';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuthStore } from '../stores/authStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useNetworkStore } from '../stores/networkStore';
import { postAgent } from '../services/aiAgentClient';
import { FEATURES } from '../config/features';
import { getQuickTip } from '../lib/rulesHelper';
import { useSubscriptionStore } from '../stores/subscriptionStore';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CameraScanScreen() {
    const navigation = useNavigation<any>();
    const { session } = useAuthStore();
    const { rooms, addCapturedPhoto } = useInventoryStore();
    const { isOnline, aiCloudEnabled } = useNetworkStore();
    const { isPro } = useSubscriptionStore();

    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [zoom, setZoom] = useState(0);
    const [torch, setTorch] = useState(false);
    const baseZoom = useRef(0);

    const pinchGesture = Gesture.Pinch()
        .runOnJS(true)
        .onUpdate((e) => {
            const sensitivity = 0.5;
            const newZoom = Math.min(Math.max(baseZoom.current + (e.scale - 1) * sensitivity, 0), 1);
            setZoom(newZoom);
        })
        .onEnd(() => {
            baseZoom.current = zoom;
        });

    // Convert internal zoom (0-1) to a human-readable multiplier
    const getZoomLabel = (z: number): string => {
        const multiplier = 1 + z * 15; // 0 -> 1x, 1 -> 16x
        return multiplier < 10 ? `${multiplier.toFixed(1)}x` : `${Math.round(multiplier)}x`;
    };

    // Find nearest preset for highlighting
    const ZOOM_PRESETS = [0, 0.17, 0.35, 0.6];
    const ZOOM_LABELS = ['1x', '3x', '5x', '10x'];
    const nearestPresetIdx = ZOOM_PRESETS.reduce((bestIdx, val, idx) =>
        Math.abs(zoom - val) < Math.abs(zoom - ZOOM_PRESETS[bestIdx]) ? idx : bestIdx, 0
    );

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Reset states when screen comes back into focus
    useFocusEffect(
        React.useCallback(() => {
            setCapturedImage(null);
            setIsAnalyzing(false);
            setZoom(0);
            setTorch(false);
        }, [])
    );

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        );

        const rotate = Animated.loop(
            Animated.timing(rotateAnim, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
        );

        pulse.start();
        rotate.start();

        return () => {
            pulse.stop();
            rotate.stop();
        };
    }, [pulseAnim, rotateAnim]);

    const analyzeItem = async () => {
        if (isAnalyzing) return;
        setIsAnalyzing(true);

        try {
            let base64Image: string | null = null;
            let finalUri: string | null = null;

            if (cameraRef.current) {
                // Take photo - only generate base64 if we need it for AI
                const needsBase64 = FEATURES.ENABLE_SMART_SCAN && isOnline && aiCloudEnabled && session?.access_token;

                const photo = await cameraRef.current.takePictureAsync({
                    base64: false,
                    quality: 0.5,
                    skipProcessing: true,
                });

                finalUri = photo.uri;

                // Only process for AI if Smart Scan is enabled AND we can use cloud
                if (needsBase64 && photo?.uri) {
                    try {
                        let resizeWidth = 768;
                        let compress = 0.55;

                        const performResize = async (w: number, c: number) => {
                            return await ImageManipulator.manipulateAsync(
                                photo.uri,
                                [{ resize: { width: w } }],
                                {
                                    compress: c,
                                    format: ImageManipulator.SaveFormat.JPEG,
                                    base64: true,
                                }
                            );
                        };

                        let resized = await performResize(resizeWidth, compress);

                        if (resized.base64 && resized.base64.length > 1_500_000) {
                            console.log('[SCAN] Image too big, shrinking harder...');
                            resized = await performResize(512, 0.5);
                        }

                        finalUri = resized.uri;
                        base64Image = resized.base64 || null;

                    } catch (resizeError) {
                        console.warn('[SCAN] image resize failed', resizeError);
                    }
                }

                setCapturedImage(finalUri);
                if (finalUri) addCapturedPhoto(finalUri);
            }

            // === PHOTO-ONLY MODE: Skip AI if Smart Scan is disabled ===
            if (!FEATURES.ENABLE_SMART_SCAN) {
                console.log('[SCAN] Photo-only mode (Smart Scan disabled)');
                const tip = FEATURES.ENABLE_RULES_HELPER ? getQuickTip('item') : '';
                const photoOnlyData = {
                    name: 'New Item',
                    description: tip ? `📸 Photo captured. ${tip}` : 'Photo captured. Add details to complete your inventory.',
                    price: 0,
                    category: 'Inventory'
                };

                navigation.navigate('AddItem', { initialData: photoOnlyData, imageUri: finalUri, fromScan: true });
                setIsAnalyzing(false);
                return;
            }

            // === OFFLINE/DISABLED MODE ===
            const canUseCloudAI = isOnline && aiCloudEnabled && session?.access_token;
            if (!canUseCloudAI) {
                console.log('[SCAN] Offline mode - skipping AI analysis');
                const offlineItemData = {
                    name: 'New Item (Add Details)',
                    description: 'Photo captured offline. Add details manually.',
                    price: 0,
                    category: 'Inventory'
                };

                Alert.alert(
                    'Photo Saved',
                    isOnline && !aiCloudEnabled
                        ? 'You are offline. Add item details manually.'
                        : 'No internet connection. Add item details manually.',
                    [
                        {
                            text: 'Continue',
                            onPress: () => navigation.navigate('AddItem', { initialData: offlineItemData, imageUri: finalUri, fromScan: true })
                        }
                    ]
                );
                setIsAnalyzing(false);
                return;
            }

            // Online mode - call backend AI
            const homeId = (rooms.length > 0 && rooms[0].homeId) ? rooms[0].homeId : 'demo-home-id';
            const prompt = `Identify the item in this image for my home inventory.
Return ONLY a valid JSON object with these exact fields:
{
    "name": "detailed name/model",
    "price": estimated_retail_price_number,
    "description": "brief specs/condition",
    "category": "standard inventory category"
}`;

            try {
                console.log('[SCAN] b64Len=', base64Image?.length);

                const data = await postAgent({
                    prompt,
                    image: base64Image ?? undefined,
                    homeId,
                    history: [],
                    access_token: session!.access_token,
                });

                let itemData;
                try {
                    const cleanJson = data.response.replace(/```json/g, '').replace(/```/g, '').trim();
                    itemData = JSON.parse(cleanJson);
                } catch (e) {
                    itemData = {
                        name: 'Scanned Item',
                        description: data.response || "No description generated.",
                        price: 0,
                        category: 'Inventory'
                    };
                }

                navigation.navigate('AddItem', { initialData: itemData, imageUri: finalUri, fromScan: true });
            } catch (error: any) {
                console.error('Scan Error:', error);

                // Check for 403 / Upgrade
                if (error.response?.status === 403 || error.message?.includes('403') || error.code === 'upgrade_required') {
                    setIsAnalyzing(false);
                    Alert.alert(
                        'Limit Reached',
                        'You’ve reached the free limit. Upgrade to Pro to continue.',
                        [
                            { text: 'Not now', style: 'cancel' },
                            { text: 'Upgrade', onPress: () => navigation.navigate('Upgrade') }
                        ]
                    );
                    return;
                }

                // On other errors, still allow user to add item manually with the photo
                const fallbackItemData = {
                    name: 'New Item (Add Details)',
                    description: 'AI analysis failed. Add details manually.',
                    price: 0,
                    category: 'Inventory'
                };
                Alert.alert(
                    'AI Analysis Failed',
                    'Could not analyze the item. You can still add it manually.',
                    [
                        {
                            text: 'Add Manually',
                            onPress: () => navigation.navigate('AddItem', { initialData: fallbackItemData, imageUri: capturedImage, fromScan: true })
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => {
                                setIsAnalyzing(false);
                                setCapturedImage(null);
                            }
                        }
                    ]
                );
            }
        } catch (outerError: any) {
            console.error('Scan outer error:', outerError);
            setIsAnalyzing(false);
        }
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const renderOverlay = () => {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.closeIcon}>×</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.flashButton, torch && { backgroundColor: '#FBBF24' }]}
                        onPress={() => setTorch(!torch)}
                    >
                        <Text style={[styles.flashIcon, torch && { color: '#000' }]}>⚡</Text>
                    </TouchableOpacity>
                </View>

                {/* Zoom Controls - Positioned above Shutter */}
                {!capturedImage && !isAnalyzing && (
                    <View style={styles.zoomControlsWrapper}>
                        {/* Live zoom indicator */}
                        {zoom > 0.01 && (
                            <View style={styles.zoomIndicatorBadge}>
                                <Text style={styles.zoomIndicatorText}>{getZoomLabel(zoom)}</Text>
                            </View>
                        )}
                        <View style={styles.zoomControls}>
                            {ZOOM_PRESETS.map((value, idx) => {
                                const isNearest = nearestPresetIdx === idx;
                                return (
                                    <TouchableOpacity
                                        key={value}
                                        style={[styles.zoomButton, isNearest && styles.zoomButtonActive]}
                                        onPress={() => {
                                            setZoom(value);
                                            baseZoom.current = value;
                                        }}
                                    >
                                        <Text style={[styles.zoomText, isNearest && styles.zoomTextActive]}>
                                            {ZOOM_LABELS[idx]}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                <View style={styles.overlayContainer}>
                    <View style={styles.reticle}>
                        <View style={[styles.corner, styles.tl]} />
                        <View style={[styles.corner, styles.tr]} />
                        <View style={[styles.corner, styles.bl]} />
                        <View style={[styles.corner, styles.br]} />
                    </View>

                    {isAnalyzing && (
                        <View style={styles.scanningLineContainer}>
                            <Animated.View
                                style={[
                                    styles.scanningLine,
                                    { transform: [{ translateY: pulseAnim.interpolate({ inputRange: [1, 1.2], outputRange: [0, SCREEN_WIDTH * 0.7] }) }] }
                                ]}
                            />
                        </View>
                    )}

                    <View style={styles.aiTagSmall}>
                        {isAnalyzing ? (
                            <ActivityIndicator color="#fff" size="small" style={{ marginRight: 6 }} />
                        ) : (
                            <View style={styles.dot} />
                        )}
                        <Text style={styles.aiTextSmall}>
                            {isAnalyzing
                                ? (FEATURES.ENABLE_SMART_SCAN ? 'Analyzing Item...' : 'Capturing...')
                                : (FEATURES.ENABLE_SMART_SCAN ? 'Gemini AI Vision Ready' : 'Photo Capture Ready')}
                        </Text>
                    </View>
                </View>

                <View style={styles.bottomControls}>
                    <TouchableOpacity style={styles.shutterButtonOuter} onPress={analyzeItem} disabled={isAnalyzing}>
                        <View style={[styles.shutterButtonInner, isAnalyzing && { backgroundColor: '#ccc' }]} />
                    </TouchableOpacity>
                    <Text style={styles.hintText}>{isAnalyzing ? 'Scanning...' : 'Point at an item and tap'}</Text>
                </View>
            </SafeAreaView>
        );
    };

    if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={[styles.overlayContainer, { backgroundColor: '#000' }]}>
                    <Text style={{ textAlign: 'center', color: 'white', marginBottom: 20 }}>Permission needed to use camera</Text>
                    <TouchableOpacity onPress={requestPermission} style={{ padding: 12, backgroundColor: '#10B981', borderRadius: 8 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <StatusBar style="light" />
                {capturedImage ? (
                    <ImageBackground source={{ uri: capturedImage }} style={styles.cameraFeed} resizeMode="cover" />
                ) : (
                    <GestureDetector gesture={pinchGesture}>
                        <CameraView
                            style={styles.cameraFeed}
                            facing="back"
                            ref={cameraRef}
                            zoom={zoom}
                            enableTorch={torch}
                        />
                    </GestureDetector>
                )}
                <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                    {renderOverlay()}
                </View>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    cameraFeed: { flex: 1, width: '100%', height: '100%' },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, zIndex: 100 },
    closeButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    closeIcon: { color: '#fff', fontSize: 32, lineHeight: 34, fontWeight: '300' },
    flashButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    flashIcon: { color: '#fff', fontSize: 20 },
    overlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    reticle: { width: SCREEN_WIDTH * 0.7, height: SCREEN_WIDTH * 0.7, position: 'absolute' },
    corner: { position: 'absolute', width: 40, height: 40, borderColor: '#fff', borderWidth: 3 },
    tl: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 20 },
    tr: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 20 },
    bl: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 20 },
    br: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 20 },
    aiTagSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, position: 'absolute', top: 20 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 8 },
    aiTextSmall: { color: '#fff', fontWeight: '500', fontSize: 13 },
    scanningLineContainer: { width: SCREEN_WIDTH * 0.7, height: SCREEN_WIDTH * 0.7, position: 'absolute', overflow: 'hidden' },
    scanningLine: { width: '100%', height: 2, backgroundColor: '#10B981', shadowColor: '#10B981', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5 },
    bottomControls: { alignItems: 'center', paddingBottom: 30, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 40 },
    hintText: { color: '#fff', marginTop: 12, fontWeight: '600', fontSize: 14, opacity: 0.7 },
    shutterButtonOuter: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
    shutterButtonInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff' },
    zoomControlsWrapper: {
        position: 'absolute',
        bottom: 200,
        alignSelf: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    zoomIndicatorBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 12,
        marginBottom: 8,
    },
    zoomIndicatorText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    zoomControls: {
        flexDirection: 'row',
        borderRadius: 10,
        padding: 4,
        gap: 4,
    },
    zoomButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomButtonActive: {
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    zoomText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    zoomTextActive: {
        color: '#10B981',
    },
});
