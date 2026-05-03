import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    Animated,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const ScrollToTop = ({ visible, onPress }) => {
    const { theme } = useTheme();
    const opacity = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(opacity, {
            toValue: visible ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    if (!visible && opacity._value === 0) return null;

    return (
        <Animated.View style={[styles.container, { opacity }]}>
            <TouchableOpacity
                onPress={onPress}
                style={[
                    styles.button,
                    { 
                        backgroundColor: theme.colors.accentPrimary,
                        shadowColor: theme.colors.accentPrimary,
                    }
                ]}
                activeOpacity={0.8}
            >
                <Ionicons name="arrow-up" size={24} color="white" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        zIndex: 1000,
    },
    button: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
});

export default ScrollToTop;
