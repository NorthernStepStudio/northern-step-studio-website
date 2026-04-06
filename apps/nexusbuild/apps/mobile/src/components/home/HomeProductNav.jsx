import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../core/i18n';

export default function HomeProductNav({ navigation }) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const productLinks = [
        { id: 'builder', label: t('nav.builder'), icon: 'build', screen: 'BuilderTab' },
        { id: 'parts', label: t('footer.links.searchParts'), icon: 'search', screen: 'PartSelection' },
        { id: 'community', label: t('community.title'), icon: 'people', screen: 'Community' },
    ];

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    {t('footer.product')}
                </Text>
            </View>

            <View style={styles.linksContainer}>
                {productLinks.map((link) => (
                    <TouchableOpacity
                        key={link.id}
                        style={[styles.linkItem, {
                            backgroundColor: theme.colors.glassBg,
                            borderColor: theme.colors.glassBorder,
                        }]}
                        onPress={() => {
                            if (link.screen === 'BuilderTab') {
                                navigation.navigate('BuilderTab', { screen: 'BuilderMain' });
                            } else {
                                navigation.navigate(link.screen);
                            }
                        }}
                    >
                        <Ionicons name={link.icon} size={16} color={theme.colors.accentPrimary} />
                        <Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>
                            {link.label}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
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
    linksContainer: {
        gap: 8,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 8,
    },
    linkText: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
});
