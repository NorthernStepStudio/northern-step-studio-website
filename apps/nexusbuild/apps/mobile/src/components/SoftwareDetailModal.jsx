/**
 * SoftwareDetailModal - Shows software details with description and download/purchase links
 */
import React from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Linking,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';

const { height } = Dimensions.get('window');

// Known software with official URLs
const SOFTWARE_URLS = {
    'adobe premiere pro': 'https://www.adobe.com/products/premiere.html',
    'davinci resolve': 'https://www.blackmagicdesign.com/products/davinciresolve',
    'blender': 'https://www.blender.org/download/',
    'visual studio code': 'https://code.visualstudio.com/',
    'stable diffusion': 'https://stability.ai/',
    'obs studio': 'https://obsproject.com/',
    'unreal engine 5': 'https://www.unrealengine.com/',
    'autocad': 'https://www.autodesk.com/products/autocad/',
    'after effects': 'https://www.adobe.com/products/aftereffects.html',
    'maya': 'https://www.autodesk.com/products/maya/',
    '3ds max': 'https://www.autodesk.com/products/3ds-max/',
    'cinema 4d': 'https://www.maxon.net/cinema-4d',
    'solidworks': 'https://www.solidworks.com/',
    'fusion 360': 'https://www.autodesk.com/products/fusion-360/',
    'ableton live': 'https://www.ableton.com/',
    'fl studio': 'https://www.image-line.com/fl-studio/',
    'pro tools': 'https://www.avid.com/pro-tools',
    'logic pro': 'https://www.apple.com/logic-pro/',
    'lightroom': 'https://www.adobe.com/products/photoshop-lightroom.html',
    'photoshop': 'https://www.adobe.com/products/photoshop.html',
};

const SoftwareDetailModal = ({ visible, software, onClose }) => {
    const { theme } = useTheme();

    if (!software) return null;

    const getFocusColor = (focus) => {
        if (focus?.toLowerCase().includes('gpu')) return '#9C27B0';
        if (focus?.toLowerCase().includes('vram')) return '#E91E63';
        if (focus?.toLowerCase().includes('cpu')) return '#2196F3';
        if (focus?.toLowerCase().includes('ram')) return '#FF9800';
        return '#10B981';
    };

    const getFocusIcon = (focus) => {
        if (focus?.toLowerCase().includes('gpu') || focus?.toLowerCase().includes('vram')) return 'hardware-chip';
        if (focus?.toLowerCase().includes('cpu')) return 'speedometer';
        if (focus?.toLowerCase().includes('ram')) return 'albums';
        return 'options';
    };

    const getOfficialUrl = () => {
        const nameLower = software.name?.toLowerCase() || '';
        for (const [key, url] of Object.entries(SOFTWARE_URLS)) {
            if (nameLower.includes(key)) return url;
        }
        // Fallback: Google search
        return `https://www.google.com/search?q=${encodeURIComponent(software.name + ' download')}`;
    };

    const handleDownload = () => {
        Linking.openURL(getOfficialUrl());
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} />

                <View style={[styles.modalContainer, { backgroundColor: theme.colors.bgSecondary }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.glassBorder }]}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Software Details</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Icon */}
                        <View style={[styles.iconContainer, { backgroundColor: getFocusColor(software.focus) + '20' }]}>
                            <Ionicons name={getFocusIcon(software.focus)} size={64} color={getFocusColor(software.focus)} />
                        </View>

                        {/* Software Info */}
                        <View style={styles.infoSection}>
                            <Text style={[styles.softwareTitle, { color: theme.colors.textPrimary }]}>
                                {software.name}
                            </Text>

                            <Text style={[styles.softwareCategory, { color: theme.colors.textSecondary }]}>
                                {software.category}
                            </Text>

                            {/* Focus Badge */}
                            <View style={[styles.focusBadge, { backgroundColor: getFocusColor(software.focus) + '20' }]}>
                                <Ionicons name="flash" size={18} color={getFocusColor(software.focus)} />
                                <Text style={[styles.focusText, { color: getFocusColor(software.focus) }]}>
                                    {software.focus}
                                </Text>
                            </View>

                            {/* Notes */}
                            {software.notes && (
                                <GlassCard style={styles.notesCard}>
                                    <View style={styles.notesHeader}>
                                        <Ionicons name="information-circle-outline" size={20} color={theme.colors.accentPrimary} />
                                        <Text style={[styles.notesTitle, { color: theme.colors.textPrimary }]}>Hardware Notes</Text>
                                    </View>
                                    <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>
                                        {software.notes}
                                    </Text>
                                </GlassCard>
                            )}

                            {/* Description */}
                            <GlassCard style={styles.descCard}>
                                <Text style={[styles.descTitle, { color: theme.colors.textPrimary }]}>About This Software</Text>
                                <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
                                    {software.description || `${software.name} is a professional ${software.category} tool. Visit the official website to download or purchase a license.`}
                                </Text>
                            </GlassCard>

                            {/* Requirements Hint */}
                            <GlassCard style={styles.reqCard}>
                                <View style={styles.reqHeader}>
                                    <Ionicons name="hardware-chip-outline" size={20} color={theme.colors.accentPrimary} />
                                    <Text style={[styles.reqTitle, { color: theme.colors.textPrimary }]}>Performance Profile</Text>
                                </View>
                                <Text style={[styles.reqText, { color: theme.colors.textSecondary }]}>
                                    This software focuses on "{software.focus}".
                                    {software.focus?.toLowerCase().includes('gpu') && " A powerful graphics card with high compute capability is recommended."}
                                    {software.focus?.toLowerCase().includes('vram') && " High VRAM (12GB+) is recommended for optimal performance."}
                                    {software.focus?.toLowerCase().includes('cpu') && " A fast multi-core CPU will significantly improve performance."}
                                    {software.focus?.toLowerCase().includes('ram') && " 32GB+ RAM is recommended for large projects."}
                                </Text>
                            </GlassCard>

                            {/* Download Link */}
                            <View style={styles.downloadSection}>
                                <Text style={[styles.downloadTitle, { color: theme.colors.textPrimary }]}>
                                    Get This Software
                                </Text>

                                <TouchableOpacity
                                    style={[styles.downloadCard, { backgroundColor: theme.colors.accentPrimary + '15', borderColor: theme.colors.accentPrimary }]}
                                    onPress={handleDownload}
                                >
                                    <View style={styles.downloadInfo}>
                                        <Ionicons name="globe-outline" size={24} color={theme.colors.accentPrimary} />
                                        <View>
                                            <Text style={[styles.downloadName, { color: theme.colors.textPrimary }]}>Official Website</Text>
                                            <Text style={[styles.downloadSubtext, { color: theme.colors.textMuted }]}>Download or purchase license</Text>
                                        </View>
                                    </View>
                                    <View style={styles.goButton}>
                                        <Text style={[styles.goText, { color: theme.colors.accentPrimary }]}>Visit</Text>
                                        <Ionicons name="arrow-forward" size={16} color={theme.colors.accentPrimary} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer Button */}
                    <View style={[styles.footer, { backgroundColor: theme.colors.bgSecondary, borderTopColor: theme.colors.glassBorder }]}>
                        <TouchableOpacity
                            style={[styles.downloadButton, { backgroundColor: theme.colors.accentPrimary }]}
                            onPress={handleDownload}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="download-outline" size={20} color="white" />
                            <Text style={styles.downloadButtonText}>Download / Purchase</Text>
                            <Ionicons name="open-outline" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: height * 0.85,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    iconContainer: {
        width: '100%',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoSection: {
        padding: 20,
        gap: 16,
    },
    softwareTitle: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    softwareCategory: {
        fontSize: 16,
    },
    focusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 8,
    },
    focusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    notesCard: {
        padding: 16,
        gap: 8,
    },
    notesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    notesTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    notesText: {
        fontSize: 14,
        lineHeight: 22,
    },
    descCard: {
        padding: 16,
        gap: 8,
    },
    descTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    descText: {
        fontSize: 14,
        lineHeight: 22,
    },
    reqCard: {
        padding: 16,
        gap: 10,
    },
    reqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    reqTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    reqText: {
        fontSize: 13,
        lineHeight: 20,
    },
    downloadSection: {
        marginTop: 8,
        gap: 12,
    },
    downloadTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    downloadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    downloadInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    downloadName: {
        fontSize: 16,
        fontWeight: '600',
    },
    downloadSubtext: {
        fontSize: 12,
    },
    goButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    goText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        borderTopWidth: 1,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 14,
    },
    downloadButtonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '700',
    },
});

export default SoftwareDetailModal;
