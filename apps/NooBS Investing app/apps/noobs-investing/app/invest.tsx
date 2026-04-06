import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '../components/Screen';
import { theme } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { APPROVED_ASSETS } from '../storage/assets';
import { TxKind } from '../storage/types';
import { LiveChart } from '../components/LiveChart';
import { isProUser } from '../storage/subscription';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { useTutorial, PRO_TRADING_TUTORIAL } from '../components/TutorialContext';
import { isMarketOpen } from '../utils/chartSimulator';
import { GuideTip } from '../components/GuideTip';
import { useVelocityNavigate } from '../hooks/useVelocityNavigate';
import { ProPaywall } from '../components/ProPaywall';

export default function Invest() {
    const router = useRouter();
    const { kind } = useLocalSearchParams<{ kind: TxKind }>();
    const { screenRef, navigate } = useVelocityNavigate();
    const [selected, setSelected] = useState<string | null>(null);
    const [proMode, setProMode] = useState(false);
    const [isPro, setIsPro] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Tutorial state
    const { showTutorial, currentStep, steps, startTutorial, nextStep, skipTutorial, completeTutorial } = useTutorial();

    // Check pro status on mount
    useEffect(() => {
        isProUser().then(setIsPro);
    }, []);

    // Trigger tutorial when entering PRO mode for the first time
    useEffect(() => {
        if (proMode) {
            startTutorial('pro_trading', PRO_TRADING_TUTORIAL);
        }
    }, [proMode]);

    const assetList = Object.values(APPROVED_ASSETS).filter(a => a.symbol !== 'CASH');

    const categories = [
        { name: "The Titans", symbols: ["VOO", "VTI", "BRK.B"] },
        { name: "Global Reach", symbols: ["VXUS", "ASML"] },
        { name: "The AI Future", symbols: ["NVDA", "MSFT", "AAPL", "XLK", "AMZN", "GOOGL"] },
        { name: "Economic Pulse", symbols: ["XLF", "XLE", "XLI", "JPM", "XOM", "TSLA"] },
        { name: "The Essentials", symbols: ["XLP", "XLV", "KO", "PG", "COST", "JNJ"] },
        { name: "Yield & Assets", symbols: ["SCHD", "VNQ", "XLRE", "DGRO"] },
        { name: "The Bunker", symbols: ["BND", "GLD", "TLT", "SHV"] },
    ];

    return (
        <Screen ref={screenRef} safeTop={true} scroll={false}>
            <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Pressable onPress={() => router.back()} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.muted} />
                        <Text style={{ color: theme.colors.muted, fontWeight: '700' }}>Back</Text>
                    </Pressable>
                    <View style={{ backgroundColor: theme.colors.accent + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                        <Text style={{ color: theme.colors.accent, fontWeight: '900', fontSize: 12 }}>{kind?.toUpperCase()} MODE</Text>
                    </View>
                </View>
                <Text style={{ color: theme.colors.text, fontSize: 36, fontWeight: '900', letterSpacing: -1 }}>The NooBS Market</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isMarketOpen() ? theme.colors.success : theme.colors.danger }} />
                    <Text style={{ color: isMarketOpen() ? theme.colors.success : theme.colors.danger, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {isMarketOpen() ? "Market Open (Liquid)" : "Market Closed (Low Liquidity)"}
                    </Text>
                </View>
            </View>

            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 32, paddingBottom: 40 }}
            >
                {/* Pro Mode Toggle */}
                <View style={{ flexDirection: 'row', marginBottom: 24, backgroundColor: theme.colors.card, borderRadius: 16, padding: 4, marginTop: 8 }}>
                    <Pressable
                        onPress={() => setProMode(false)}
                        style={{
                            flex: 1,
                            paddingVertical: 12,
                            alignItems: 'center',
                            borderRadius: 12,
                            backgroundColor: !proMode ? theme.colors.accent : 'transparent'
                        }}
                    >
                        <Text style={{ color: !proMode ? theme.colors.bg : theme.colors.muted, fontWeight: '900', fontSize: 13 }}>
                            BASIC
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            if (!isPro) {
                                setShowPaywall(true);
                            } else {
                                setProMode(true);
                            }
                        }}
                        style={{
                            flex: 1,
                            paddingVertical: 12,
                            alignItems: 'center',
                            borderRadius: 12,
                            backgroundColor: proMode ? theme.colors.accent : 'transparent',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 6
                        }}
                    >
                        <Text style={{ color: proMode ? theme.colors.bg : theme.colors.muted, fontWeight: '900', fontSize: 13 }}>
                            PRO
                        </Text>
                        {!isPro && <Text style={{ fontSize: 10 }}>🔒</Text>}
                    </Pressable>
                </View>

                {proMode && !isPro && (
                    <View style={{
                        backgroundColor: theme.colors.accent + '15',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 24,
                        borderWidth: 1,
                        borderColor: theme.colors.accent + '40',
                        marginTop: -8
                    }}>
                        <Text style={{ color: theme.colors.accent, fontWeight: '900', fontSize: 14, marginBottom: 4 }}>
                            ⚡ PRO Mode Features
                        </Text>
                        <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 18, marginBottom: 12 }}>
                            Live price charts, limit orders, advanced analytics, and more. Upgrade to unlock the full trading simulator.
                        </Text>
                        <Pressable
                            onPress={() => setShowPaywall(true)}
                            style={{
                                backgroundColor: theme.colors.accent,
                                paddingVertical: 10,
                                borderRadius: 12,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 13 }}>UPGRADE NOW ↗</Text>
                        </Pressable>
                    </View>
                )}

                {categories.map((cat) => {
                    const catAssets = cat.symbols.map(s => APPROVED_ASSETS[s]).filter(Boolean);
                    if (!catAssets.length) return null;

                    return (
                        <View key={cat.name} style={{ gap: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <Text style={{ color: theme.colors.muted, fontWeight: '900', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>{cat.name}</Text>
                                <GuideTip
                                    title={cat.name}
                                    content={
                                        <Text>
                                            We group these by their <Text style={{ fontWeight: '900' }}>Economic Role</Text>.{"\n\n"}
                                            For a NooBS portfolio, you want a mix of "Titans" for growth and "Bunker" for safety. Don't put all your eggs in one futuristic basket.
                                        </Text>
                                    }
                                />
                                <View style={{ height: 1, flex: 1, backgroundColor: theme.colors.border }} />
                            </View>

                            <View style={{ gap: 20 }}>
                                {catAssets.map((asset) => {
                                    const isProAsset = asset.isPro === true;
                                    const canViewDetails = !isProAsset || isPro;

                                    return (
                                        <Pressable
                                            key={asset.symbol}
                                            onPress={() => {
                                                if (!canViewDetails) {
                                                    setShowPaywall(true);
                                                    return;
                                                }
                                                const newSelected = asset.symbol === selected ? null : asset.symbol;
                                                setSelected(newSelected);
                                            }}
                                            style={{
                                                padding: 24,
                                                borderRadius: theme.radius.card,
                                                backgroundColor: theme.colors.card,
                                                borderWidth: 2,
                                                borderColor: selected === asset.symbol ? theme.colors.accent : theme.colors.border + '30',
                                                opacity: canViewDetails ? 1 : 0.7,
                                                shadowColor: selected === asset.symbol ? theme.colors.accent : 'transparent',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.2,
                                                shadowRadius: 10,
                                                elevation: 5
                                            }}
                                        >
                                            {/* Terminal Header for Card (Selected) */}
                                            {selected === asset.symbol && (
                                                <View style={{ backgroundColor: theme.colors.accent, marginHorizontal: -24, marginTop: -24, marginBottom: 20, paddingVertical: 4, paddingHorizontal: 16 }}>
                                                    <Text style={{ color: theme.colors.bg, fontSize: 9, fontWeight: '900', letterSpacing: 1 }}>ACTIVE ANALYTICS TERMINAL</Text>
                                                </View>
                                            )}
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                                <View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                        <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900', fontFamily: 'Courier' }}>{asset.symbol}</Text>
                                                        {isProAsset && (
                                                            <View style={{ backgroundColor: theme.colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                                                <Text style={{ color: theme.colors.bg, fontSize: 9, fontWeight: '900' }}>PRO</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>{asset.name}</Text>
                                                </View>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900', fontFamily: 'Courier' }}>${asset.price.toFixed(2)}</Text>
                                                    <View style={{ backgroundColor: theme.colors.border, height: 1, width: '100%', marginVertical: 4 }} />
                                                    <Text style={{ color: theme.colors.success, fontSize: 10, fontWeight: '900' }}>+1.24% • ACTIVE</Text>
                                                </View>
                                            </View>

                                            {canViewDetails ? (
                                                <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 22, fontWeight: '600' }}>
                                                    {asset.description}
                                                </Text>
                                            ) : (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <MaterialCommunityIcons name="lock" size={16} color={theme.colors.accent} />
                                                    <Text style={{ color: theme.colors.accent, fontSize: 14, fontWeight: '700' }}>
                                                        Upgrade to Pro for full analysis
                                                    </Text>
                                                </View>
                                            )}

                                            {selected === asset.symbol && (
                                                <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 20 }}>

                                                    {/* Pro Mode: Live Chart */}
                                                    {proMode ? (
                                                        <View style={{ marginBottom: 24 }}>
                                                            <LiveChart
                                                                symbol={asset.symbol}
                                                                initialPrice={asset.price}
                                                                assetName={asset.name}
                                                                isPro={isPro}
                                                            />
                                                        </View>
                                                    ) : (
                                                        /* Basic Mode: Static Chart */
                                                        <View style={{ height: 160, backgroundColor: theme.colors.bg, borderRadius: 16, marginBottom: 24, overflow: 'hidden' }}>
                                                            <Image
                                                                source={
                                                                    asset.symbol === 'VTI' ? require('../assets/images/vti_chart.jpg') :
                                                                        asset.symbol === 'VXUS' ? require('../assets/images/vxus_chart.jpg') :
                                                                            asset.symbol === 'BND' ? require('../assets/images/bnd_chart.jpg') :
                                                                                asset.symbol === 'QQQ' ? require('../assets/images/qqq_chart.jpg') :
                                                                                    asset.symbol === 'SCHD' ? require('../assets/images/schd_chart.jpg') :
                                                                                        require('../assets/images/vnq_chart.jpg')
                                                                }
                                                                style={{ width: '100%', height: '100%', opacity: 0.8 }}
                                                                resizeMode="cover"
                                                            />
                                                            <View style={{ position: 'absolute', bottom: 12, left: 12, backgroundColor: theme.colors.card + 'D0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                                                                <Text style={{ color: theme.colors.accent, fontWeight: '900', fontSize: 11 }}>10-YEAR GROWTH PATTERN</Text>
                                                            </View>
                                                        </View>
                                                    )}

                                                    <View style={{ gap: 20, marginBottom: 24 }}>
                                                        <View style={{ backgroundColor: theme.colors.success + '10', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: theme.colors.success }}>
                                                            <Text style={{ color: theme.colors.success, fontWeight: '900', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>Why NooBS buy this:</Text>
                                                            <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>{asset.whyThis}</Text>
                                                        </View>
                                                        <View style={{ backgroundColor: theme.colors.danger + '10', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: theme.colors.danger }}>
                                                            <Text style={{ color: theme.colors.danger, fontWeight: '900', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>Why NooBS skip this:</Text>
                                                            <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>{asset.whyNot}</Text>
                                                        </View>
                                                    </View>

                                                    <Pressable
                                                        onPress={() => navigate({
                                                            pathname: "/add-entry",
                                                            params: {
                                                                kind,
                                                                preset_symbol: asset.symbol,
                                                                preset_name: asset.name,
                                                                preset_type: asset.type,
                                                                preset_price: asset.price,
                                                                pro_mode: proMode ? 'true' : 'false'
                                                            }
                                                        })}
                                                        style={({ pressed }) => ({
                                                            padding: 20,
                                                            borderRadius: theme.radius.pill,
                                                            backgroundColor: theme.colors.accent,
                                                            alignItems: 'center',
                                                            opacity: pressed ? 0.9 : 1
                                                        })}
                                                    >
                                                        <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 18 }}>
                                                            INVEST IN {asset.symbol} ↗
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                            )}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}

                <View style={{ marginTop: 24, padding: 20, borderRadius: 20, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}>
                    <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>Educational Disclaimer</Text>
                    <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 18, fontWeight: '600' }}>
                        NooBS Investing is an educational simulation. No real money is involved. This is not professional financial advice.
                    </Text>
                </View>
            </ScrollView>


            <View style={{ height: 40 }} />

            <TutorialOverlay
                visible={showTutorial}
                steps={steps}
                currentStep={currentStep}
                onNext={nextStep}
                onSkip={skipTutorial}
                onComplete={completeTutorial}
            />

            <ProPaywall
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
                onUnlock={() => setIsPro(true)}
            />
        </Screen>
    );
}
