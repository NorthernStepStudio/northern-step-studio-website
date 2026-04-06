import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useBuild } from '../contexts/BuildContext';
import { useTranslation } from '../core/i18n';
import GlassCard from '../components/GlassCard';
import PriceHistoryChart from '../components/PriceHistoryChart';
import { getPrimaryAffiliateUrl, getAllAffiliateLinks } from '../services/affiliateLinks';
import UniversalShareButton from '../components/shared/UniversalShareButton';

export default function PartDetailsScreen({ route, navigation }) {
    const { part, category, categoryName } = route.params;
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { addPart } = useBuild();

    const handleAddToBuild = () => {
        addPart(category, part);
        // Pop back 2 screens: PartDetails -> PartSelection -> Builder
        navigation.pop(2);
    };

    const handleBuyNow = async () => {
        const url = getPrimaryAffiliateUrl(part);
        if (!url) {
            // Part has no name or affiliate URL not available
            return;
        }
        try {
            await Linking.openURL(url);
        } catch (error) {
            console.error('Failed to open URL:', error);
        }
    };

    const retailerLinks = getAllAffiliateLinks(part.name);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }} edges={['top']}>
            <LinearGradient colors={theme.gradients.background} style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.colors.glassBorder }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                        {part.name}
                    </Text>
                    <UniversalShareButton
                        type="part"
                        id={part.name}
                        title={`Check out the ${part.name} on NexusBuild!`}
                        message={`I found this ${part.name} for $${part.price} on NexusBuild.`}
                    />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Main Info Card */}
                    <GlassCard style={styles.mainCard}>
                        <View style={styles.imageContainer}>
                            {part.image_url ? (
                                <Image
                                    source={{ uri: part.image_url }}
                                    style={styles.partImage}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons
                                        name={{
                                            cpu: 'hardware-chip',
                                            gpu: 'game-controller',
                                            motherboard: 'grid',
                                            ram: 'flash',
                                            storage: 'save',
                                            psu: 'battery-charging',
                                            case: 'cube',
                                            cooler: 'snow',
                                            monitor: 'desktop',
                                            keyboard: 'keypad',
                                            mouse: 'hardware-chip' // or similar
                                        }[category] || 'hardware-chip-outline'}
                                        size={64}
                                        color={theme.colors.textMuted}
                                    />
                                </View>
                            )}
                        </View>
                        <View style={styles.titleSection}>
                            <Text style={[styles.manufacturer, { color: theme.colors.accentPrimary }]}>
                                {part.manufacturer}
                            </Text>
                            <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
                                {part.name}
                            </Text>
                            <Text style={[styles.price, { color: theme.colors.success }]}>
                                ${part.price}
                            </Text>
                        </View>
                    </GlassCard>

                    {/* Performance Score - For CPUs/GPUs */}
                    {part.score && (
                        <GlassCard style={styles.specsCard}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>⚡ Performance Score</Text>
                            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                                <Text style={{ fontSize: 42, fontWeight: 'bold', color: theme.colors.accentPrimary }}>
                                    {part.score.toLocaleString()}
                                </Text>
                                <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 4 }}>
                                    {category === 'cpu' ? 'Cinebench R23 Multi-Core' : '3DMark Time Spy'}
                                </Text>
                                {/* Performance Tier */}
                                <View style={{ marginTop: 12, backgroundColor: theme.colors.glassBg, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.accentPrimary }}>
                                    <Text style={{ color: theme.colors.accentPrimary, fontWeight: 'bold', fontSize: 14 }}>
                                        {part.score > 30000 ? '🏆 Flagship Tier' :
                                            part.score > 20000 ? '🔥 High-End' :
                                                part.score > 10000 ? '⚡ Mid-Range' : '💡 Entry Level'}
                                    </Text>
                                </View>
                            </View>
                        </GlassCard>
                    )}

                    {/* Quick Stats */}
                    <GlassCard style={styles.specsCard}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>📊 Overview</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 12, gap: 8 }}>
                            <View style={{ flex: 1, minWidth: 100, alignItems: 'center', padding: 12, backgroundColor: theme.colors.glassBg, borderRadius: 12 }}>
                                <Ionicons name="pricetag" size={24} color={theme.colors.success} />
                                <Text style={{ color: theme.colors.success, fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>${part.price}</Text>
                                <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>Price</Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 100, alignItems: 'center', padding: 12, backgroundColor: theme.colors.glassBg, borderRadius: 12 }}>
                                <Ionicons name="business" size={24} color={theme.colors.accentPrimary} />
                                <Text style={{ color: theme.colors.textPrimary, fontSize: 14, fontWeight: 'bold', marginTop: 4, textAlign: 'center' }}>{part.manufacturer || 'N/A'}</Text>
                                <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>Brand</Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 100, alignItems: 'center', padding: 12, backgroundColor: theme.colors.glassBg, borderRadius: 12 }}>
                                <Ionicons name={{
                                    cpu: 'hardware-chip', gpu: 'game-controller', motherboard: 'grid', ram: 'flash',
                                    storage: 'save', psu: 'battery-charging', case: 'cube', cooler: 'snow'
                                }[category] || 'cube'} size={24} color={theme.colors.accentSecondary} />
                                <Text style={{ color: theme.colors.textPrimary, fontSize: 14, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' }}>{category}</Text>
                                <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>Category</Text>
                            </View>
                        </View>
                    </GlassCard>

                    {/* Full Specifications */}
                    <GlassCard style={styles.specsCard}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('parts.details.specifications')}</Text>
                        {part.specs && Object.entries(part.specs).map(([key, value]) => {
                            // Format key nicely: snake_case -> Title Case
                            const formattedKey = key
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                            return (
                                <View key={key} style={[styles.specRow, { borderBottomColor: theme.colors.glassBorder }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <Ionicons
                                            name={{
                                                cores: 'layers', threads: 'git-network', socket: 'swap-horizontal',
                                                speed: 'speedometer', tdp: 'flash', vram: 'cube', memory_type: 'hardware-chip',
                                                length: 'resize', type: 'list', capacity: 'server', read_speed: 'trending-up',
                                                wattage: 'flash', modular: 'settings', rating: 'star', form_factor: 'grid',
                                                size: 'expand', fan_size: 'aperture', height: 'arrow-up', sockets: 'swap-horizontal',
                                                resolution: 'tv', panel: 'desktop', refresh: 'sync', switch: 'toggle',
                                                max_gpu_length: 'resize', color: 'color-palette', glass: 'square',
                                            }[key] || 'information-circle'}
                                            size={18}
                                            color={theme.colors.accentPrimary}
                                            style={{ marginRight: 10 }}
                                        />
                                        <Text style={[styles.specKey, { color: theme.colors.textSecondary }]}>
                                            {formattedKey}
                                        </Text>
                                    </View>
                                    <Text style={[styles.specValue, { color: theme.colors.textPrimary }]}>
                                        {value}
                                    </Text>
                                </View>
                            );
                        })}
                        {(!part.specs || Object.keys(part.specs).length === 0) && (
                            <Text style={{ color: theme.colors.textMuted, textAlign: 'center', paddingVertical: 20 }}>{t('parts.details.noSpecs')}</Text>
                        )}
                    </GlassCard>

                    {/* Price History */}
                    <PriceHistoryChart price={part.price} />

                    {/* Action Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.addButton, { flex: 1, marginRight: 8 }]} onPress={handleAddToBuild}>
                            <LinearGradient
                                colors={[theme.colors.accentPrimary, theme.colors.accentSecondary]}
                                style={styles.gradientButton}
                            >
                                <Ionicons name="add-circle-outline" size={22} color="#FFF" />
                                <Text style={styles.buttonText}>{t('parts.card.addToBuild')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.addButton, { flex: 1 }]} onPress={handleBuyNow}>
                            <LinearGradient
                                colors={[theme.colors.success, '#059669']}
                                style={styles.gradientButton}
                            >
                                <Ionicons name="cart" size={22} color="#FFF" />
                                <Text style={styles.buttonText}>{t('parts.details.buyNow')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Retailer Links with Prices */}
                    <GlassCard style={styles.retailersCard}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginBottom: 10 }]}>{t('parts.details.comparePrices')}</Text>
                        <View style={styles.retailerColumn}>
                            {/* Amazon - usually base price or slightly higher */}
                            <TouchableOpacity
                                style={[styles.retailerBtnLarge, { backgroundColor: '#FF9900' + '15', borderColor: '#FF9900' + '30' }]}
                                onPress={() => Linking.openURL(retailerLinks.amazon)}
                            >
                                <View style={styles.retailerInfo}>
                                    <Ionicons name="logo-amazon" size={24} color="#FF9900" />
                                    <Text style={{ color: '#FF9900', fontWeight: 'bold', fontSize: 16 }}>Amazon</Text>
                                </View>
                                <View style={styles.retailerPriceContainer}>
                                    <Text style={{ color: theme.colors.success, fontWeight: 'bold', fontSize: 18 }}>
                                        ${(part.price * 1.02).toFixed(2)}
                                    </Text>
                                    <Ionicons name="open-outline" size={16} color={theme.colors.textMuted} />
                                </View>
                            </TouchableOpacity>

                            {/* Newegg - competitive pricing */}
                            <TouchableOpacity
                                style={[styles.retailerBtnLarge, { backgroundColor: '#FF6600' + '15', borderColor: '#FF6600' + '30' }]}
                                onPress={() => Linking.openURL(retailerLinks.newegg)}
                            >
                                <View style={styles.retailerInfo}>
                                    <Ionicons name="storefront" size={24} color="#FF6600" />
                                    <Text style={{ color: '#FF6600', fontWeight: 'bold', fontSize: 16 }}>Newegg</Text>
                                </View>
                                <View style={styles.retailerPriceContainer}>
                                    <Text style={{ color: theme.colors.success, fontWeight: 'bold', fontSize: 18 }}>
                                        ${(part.price * 0.98).toFixed(2)}
                                    </Text>
                                    <View style={{ backgroundColor: theme.colors.success + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4 }}>
                                        <Text style={{ color: theme.colors.success, fontSize: 10, fontWeight: 'bold' }}>BEST</Text>
                                    </View>
                                    <Ionicons name="open-outline" size={16} color={theme.colors.textMuted} />
                                </View>
                            </TouchableOpacity>

                            {/* B&H Photo */}
                            <TouchableOpacity
                                style={[styles.retailerBtnLarge, { backgroundColor: '#1976D2' + '15', borderColor: '#1976D2' + '30' }]}
                                onPress={() => Linking.openURL(retailerLinks.bhphoto)}
                            >
                                <View style={styles.retailerInfo}>
                                    <Ionicons name="camera" size={24} color="#1976D2" />
                                    <Text style={{ color: '#1976D2', fontWeight: 'bold', fontSize: 16 }}>B&H Photo</Text>
                                </View>
                                <View style={styles.retailerPriceContainer}>
                                    <Text style={{ color: theme.colors.success, fontWeight: 'bold', fontSize: 18 }}>
                                        ${part.price.toFixed(2)}
                                    </Text>
                                    <Ionicons name="open-outline" size={16} color={theme.colors.textMuted} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 12, textAlign: 'center' }}>
                            💡 Prices are estimates. Click to see current prices.
                        </Text>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 10, marginTop: 4, textAlign: 'center' }}>
                            {t('parts.details.affiliateDisclaimer')}
                        </Text>
                    </GlassCard>

                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
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
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    mainCard: {
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 200,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        overflow: 'hidden',
    },
    partImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleSection: {
        alignItems: 'center',
    },
    manufacturer: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    specsCard: {
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    specKey: {
        fontSize: 14,
    },
    specValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    addButton: {
        marginTop: 10,
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradientButton: {
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    retailersCard: {
        padding: 15,
        marginTop: 15,
    },
    retailerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    retailerColumn: {
        flexDirection: 'column',
        gap: 10,
    },
    retailerBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    retailerBtnLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    retailerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    retailerPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});
