
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons"; // MaterialCommunityIcons replacement if needed, but let's stick to simple
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Placeholder types until we have full asset system
type AssetRow = {
    id: string;
    symbol: string;
    name: string;
    amount: number;
    allocation: number; // %
    type: "ETF" | "Stock" | "Fund" | "REIT" | "Other";
};

// Mock data for now, will be replaced by real engine state later
export function PortfolioList({ cash, invested }: { cash: number, invested: number }) {
    const total = cash + invested;
    const cashAllocation = (cash / total) * 100;
    const investedAllocation = (invested / total) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ASSETS</Text>
            </View>

            {/* CASH ROW (The Job Income) */}
            <View style={[styles.row, styles.cashRow]}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="currency-usd" size={20} color={theme.colors.success} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.symbolLarge}>LIQUID CAPITAL</Text>
                    <Text style={styles.labelSmall}>Uninvested Assets</Text>
                </View>
                <View style={styles.values}>
                    <Text style={styles.amountLarge}>${cash.toLocaleString()}</Text>
                    <Text style={styles.allocationSmall}>{cashAllocation.toFixed(1)}% OF TOTAL</Text>
                </View>
            </View>

            {/* MOCK INVESTMENT ROW (The Main Portfolio) */}
            {invested > 0 && (
                <View style={styles.row}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.paper + '20' }]}>
                        <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={20} color={theme.colors.paper} />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.symbolLarge}>CORE PORTFOLIO</Text>
                        <Text style={styles.labelSmall}>Systemic Index Strategy</Text>
                    </View>
                    <View style={styles.values}>
                        <Text style={styles.amountLarge}>${invested.toLocaleString()}</Text>
                        <Text style={styles.allocationSmall}>{investedAllocation.toFixed(1)}% OF TOTAL</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        color: theme.colors.faint,
        fontFamily: 'monospace',
        fontSize: 12,
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cashRow: {
        borderColor: theme.colors.success + '30',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 2,
        backgroundColor: theme.colors.success + '10',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    info: {
        flex: 1,
        gap: 2,
    },
    symbolLarge: {
        color: theme.colors.text,
        fontFamily: 'monospace',
        fontWeight: '900',
        fontSize: 13,
        letterSpacing: 0.5,
    },
    labelSmall: {
        color: theme.colors.muted,
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    values: {
        alignItems: 'flex-end',
        gap: 2,
    },
    amountLarge: {
        color: theme.colors.text,
        fontFamily: 'monospace',
        fontWeight: '900',
        fontSize: 15,
    },
    allocationSmall: {
        color: theme.colors.faint,
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 0.5,
        fontFamily: 'monospace',
    }
});
