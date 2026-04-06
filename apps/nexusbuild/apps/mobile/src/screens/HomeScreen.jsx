import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Layout from '../components/Layout';
import { useTheme } from '../contexts/ThemeContext';
import HomeHero from '../components/home/HomeHero';
import HomeQuickActions from '../components/home/HomeQuickActions'; // NEW
import HomeTrending from '../components/home/HomeTrending';
import HomeWhySection from '../components/home/HomeWhySection';
import HomeHowItWorks from '../components/home/HomeHowItWorks';
import HomeCTA from '../components/home/HomeCTA';
import HomeFooter from '../components/home/HomeFooter';



export default function HomeScreen({ navigation }) {
    const { theme } = useTheme();
    const { width } = useWindowDimensions();

    return (
        <Layout stickyHeader={<Header navigation={navigation} />}>
            <View style={styles.scrollContent}>

                <HomeHero navigation={navigation} />

                <HomeQuickActions navigation={navigation} />

                {/* Trending Builds - Standalone Showcase */}
                <HomeTrending navigation={navigation} />

                {/* Informational Sections - Stacked for full width */}
                <View style={styles.contentGrid}>
                    <HomeHowItWorks navigation={navigation} />
                    <HomeWhySection navigation={navigation} />
                </View>

                <HomeCTA navigation={navigation} />

                <HomeFooter navigation={navigation} />

            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
        flexGrow: 1,
    },
    chatCTA: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 40,
        marginTop: 5,
        marginBottom: 15,
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
    },
    chatIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 200, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    contentGrid: {
        flexDirection: 'column',
        gap: 0,
    },
    contentGridDesktop: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        gap: 20,
        alignItems: 'flex-start', // Align tops
    },
    gridSection: {
        flex: 1,
        minWidth: 300, // Prevent squishing too small
    },
});
