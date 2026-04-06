import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BRAND } from '../config/brand';

type Props = {
    children: React.ReactNode;
};

type State = {
    hasError: boolean;
    errorMessage: string;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
    state: State = {
        hasError: false,
        errorMessage: '',
    };

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            errorMessage: error?.message || 'Unknown error',
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[AppErrorBoundary] Unhandled UI error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, errorMessage: '' });
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <View style={styles.container}>
                <Text style={styles.title}>App Error</Text>
                <Text style={styles.subtitle}>
                    {BRAND.appName} hit an unexpected error. Please retry.
                </Text>
                <ScrollView style={styles.box} contentContainerStyle={{ padding: 12 }}>
                    <Text style={styles.errorText}>{this.state.errorMessage}</Text>
                </ScrollView>
                <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
                    <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B1220',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        color: '#CBD5E1',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    box: {
        maxHeight: 220,
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#334155',
        backgroundColor: '#111827',
        marginBottom: 16,
    },
    errorText: {
        color: '#FCA5A5',
        fontSize: 13,
    },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
});

