import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { getApiBaseUrl } from '../../core/config';

export default function ReportDetailModal({ visible, report, onClose, onUpdateStatus, onDelete }) {
    const { theme } = useTheme();
    const [fullImage, setFullImage] = useState(null);

    const onImagePress = (uri) => {
        setFullImage(uri);
    };

    if (!report) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return '#4ECDC4';
            case 'in_progress': return '#F59E0B';
            default: return '#FFE66D';
        }
    };

    const statusColor = getStatusColor(report.status);

    const getImageUrl = (uri) => {
        if (!uri) return null;
        // If it's already a full URL, data URI, or local file/content URI, return as is
        if (uri.startsWith('data:') || uri.startsWith('file:') || uri.startsWith('http') || uri.startsWith('blob:') || uri.startsWith('content:') || uri.startsWith('assets-library:')) {
            return uri;
        }

        // Otherwise, prepend the server URL
        // Use the same base URL as the API
        const apiBaseUrl = getApiBaseUrl();
        const baseUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;
        return `${baseUrl}${uri.startsWith('/') ? '' : '/'}${uri}`;
    };

    // Unify all image sources
    // Some endpoints return 'image_url' (single), others 'images' or 'screenshots' (array)
    // We flatten them all into one consistent array
    const allImages = [
        ...(report.images || []),
        ...(report.screenshots || []),
        ...(report.image_url ? [report.image_url] : [])
    ].filter(Boolean); // Remove null/undefined

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Full Screen Image Overlay - Rendered inside the same Modal to avoid stacking issues */}
                {fullImage && (
                    <View style={styles.fullImageOverlay}>
                        <Pressable style={styles.fullImageBackdrop} onPress={() => setFullImage(null)}>
                            <Image
                                source={{ uri: fullImage }}
                                style={styles.fullImage}
                                resizeMode="contain"
                            />
                            <TouchableOpacity
                                style={styles.closeImageBtn}
                                onPress={() => setFullImage(null)}
                            >
                                <Ionicons name="close-circle" size={40} color="white" />
                            </TouchableOpacity>
                        </Pressable>
                    </View>
                )}

                <View style={[styles.content, { backgroundColor: theme.colors.glassBg }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.glassBorder }]}>
                        <View>
                            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Report #{report.id}</Text>
                            <Text style={[styles.date, { color: theme.colors.textMuted }]}>
                                {report.created_at ? new Date(report.created_at).toLocaleString() : 'Unknown date'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        {/* Status Bar */}
                        <View style={[styles.statusBanner, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {report.status === 'in_progress' ? 'IN PROGRESS' : (report.status ? report.status.toUpperCase() : 'PENDING')}
                            </Text>
                        </View>

                        {/* Description */}
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description</Text>
                            <Text style={[styles.description, { color: theme.colors.textPrimary }]}>{report.description}</Text>
                        </View>

                        {/* Reporter Info */}
                        {report.email && (
                            <View style={styles.section}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Reporter</Text>
                                <View style={styles.reporterRow}>
                                    <Ionicons name="person-circle-outline" size={20} color={theme.colors.accentPrimary} />
                                    <Text style={[styles.reporterText, { color: theme.colors.textPrimary }]}>{report.email}</Text>
                                </View>
                            </View>
                        )}

                        {/* Platform */}
                        {(report.platform || report.system_info) && (
                            <View style={styles.section}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Platform</Text>
                                <View style={[styles.reporterRow, { backgroundColor: theme.colors.accentSecondary + '15', padding: 10, borderRadius: 10, alignSelf: 'flex-start' }]}>
                                    <Ionicons
                                        name={report.platform === 'ios' ? 'logo-apple' : report.platform === 'android' ? 'logo-android' : 'globe-outline'}
                                        size={20}
                                        color={theme.colors.accentSecondary}
                                    />
                                    <Text style={{ color: theme.colors.accentSecondary, fontWeight: '600', fontSize: 14 }}>
                                        {report.system_info || (report.platform === 'ios' ? 'iOS' : report.platform === 'android' ? 'Android' : 'Web')}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Images */}
                        {allImages.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Attachments ({allImages.length})</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
                                    {allImages.map((img, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => onImagePress(getImageUrl(img))}
                                        >
                                            <Image
                                                source={{ uri: getImageUrl(img) }}
                                                style={styles.thumbnail}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </ScrollView>

                    {/* Actions Footer */}
                    <View style={[styles.footer, { borderTopColor: theme.colors.glassBorder }]}>
                        <View style={styles.actionRow}>
                            {/* Resolve Button - Show if not resolved */}
                            {report.status !== 'resolved' && (
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#4ECDC4' }]}
                                    onPress={() => onUpdateStatus(report.id, 'resolved')}
                                >
                                    <Ionicons name="checkmark-circle" size={18} color="white" />
                                    <Text style={styles.actionBtnText}>Resolve</Text>
                                </TouchableOpacity>
                            )}

                            {/* In Progress Button - Show if not in progress */}
                            {report.status !== 'in_progress' && (
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#F59E0B' }]}
                                    onPress={() => onUpdateStatus(report.id, 'in_progress')}
                                >
                                    <Ionicons name="construct" size={18} color="white" />
                                    <Text style={styles.actionBtnText}>In Progress</Text>
                                </TouchableOpacity>
                            )}

                            {/* Pending/Reset Button - Show if not pending (so we can revert) */}
                            {report.status !== 'pending' && (
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#60A5FA' }]}
                                    onPress={() => onUpdateStatus(report.id, 'pending')}
                                >
                                    <Ionicons name="refresh" size={18} color="white" />
                                    <Text style={styles.actionBtnText}>Reset</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#FF6B6B' }]}
                                onPress={() => onDelete(report.id)}
                            >
                                <Ionicons name="trash" size={18} color="white" />
                                <Text style={styles.actionBtnText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    content: {
        height: '85%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 12,
        marginTop: 2,
    },
    closeBtn: {
        padding: 4,
    },
    body: {
        flex: 1,
        padding: 20,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    reporterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reporterText: {
        fontSize: 14,
    },
    gallery: {
        flexDirection: 'row',
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 10,
        backgroundColor: '#333',
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        minWidth: 100,
        justifyContent: 'center',
    },
    actionBtnText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    fullImageOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImageBackdrop: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '80%',
    },
    closeImageBtn: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10000,
    }
});
