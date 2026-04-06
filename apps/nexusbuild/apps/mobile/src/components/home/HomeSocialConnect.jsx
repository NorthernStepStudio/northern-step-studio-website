import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function HomeSocialConnect() {
    const { theme } = useTheme();

    const socialLinks = [
        { id: 'website', icon: 'globe-outline', label: 'Website', url: 'https://northernstepstudio.com' },
        { id: 'support', icon: 'mail-outline', label: 'Support', url: 'mailto:support@northernstepstudio.com' },
        { id: 'contact', icon: 'chatbubble-ellipses-outline', label: 'Contact', url: 'https://northernstepstudio.com/contact' },
    ];

    const openLink = (url) => {
        if (Platform.OS === 'web') {
            window.open(url, '_blank');
        } else {
            Linking.openURL(url);
        }
    };

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    Connect
                </Text>
            </View>

            <View style={styles.socialContainer}>
                {socialLinks.map((link) => (
                    <TouchableOpacity
                        key={link.id}
                        style={[styles.socialButton, {
                            backgroundColor: theme.colors.glassBg,
                            borderColor: theme.colors.glassBorder,
                        }]}
                        onPress={() => openLink(link.url)}
                    >
                        <Ionicons name={link.icon} size={18} color={theme.colors.accentPrimary} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        padding: 20,
        paddingTop: 5,
    },
    sectionHeader: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    socialContainer: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    socialButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
