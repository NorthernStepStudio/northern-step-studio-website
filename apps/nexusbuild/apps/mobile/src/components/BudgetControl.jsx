import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useBuild } from '../contexts/BuildContext';
import GlassCard from './GlassCard';
import { useTranslation } from '../core/i18n';

export default function BudgetControl() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { currentBuild, setBudget, getTotalPrice } = useBuild();
    const updateTimer = useRef(null);

    // Initialize state once from context
    // If 0, show empty string to allow placeholder to show
    const [minInput, setMinInput] = useState(currentBuild.budget?.min ? String(currentBuild.budget.min) : '');
    const [maxInput, setMaxInput] = useState(currentBuild.budget?.max ? String(currentBuild.budget.max) : '');

    // Only update from context if values are radically different (e.g. loaded from storage)
    // and we are NOT currently editing (tracked via focus?) - actually simpler:
    // Just sync when context changes IF it does not match our parsed intent,
    // but this causes the jumping.
    // Better: Only sync on mount or if external change happens (how to detect?)
    // Let's rely on the fact that setBudget updates the context, which will re-render this.
    // If we simply check if the context value matches our parsed input, we can avoid resetting.

    useEffect(() => {
        setMinInput(currentBuild.budget?.min ? String(currentBuild.budget.min) : '');
        setMaxInput(currentBuild.budget?.max ? String(currentBuild.budget.max) : '');
    }, [currentBuild.id, currentBuild.budget?.min, currentBuild.budget?.max]);

    const total = getTotalPrice();
    // Logic: if maxInput is empty/0, treat is as "infinite" or "not set"?
    // Usually budget planner needs a max to calculate "left".
    // If not set, maybe show "No Limit" or just "Total: $X"
    const maxBudget = parseInt(maxInput) || 0;

    // Only show progress if we have a budget
    const hasBudget = maxBudget > 0;
    const progress = hasBudget ? Math.min((total / maxBudget) * 100, 100) : 0;
    const isOverBudget = hasBudget && total > maxBudget;
    const remaining = hasBudget ? maxBudget - total : 0;

    const handleUpdate = () => {
        const min = parseInt(minInput) || 0;
        const max = parseInt(maxInput) || 0;
        setBudget({ min, max });
    };

    useEffect(() => {
        if (updateTimer.current) {
            clearTimeout(updateTimer.current);
        }

        updateTimer.current = setTimeout(() => {
            const min = parseInt(minInput) || 0;
            const max = parseInt(maxInput) || 0;
            setBudget({ min, max });
        }, 250);

        return () => {
            if (updateTimer.current) {
                clearTimeout(updateTimer.current);
            }
        };
    }, [minInput, maxInput]);

    return (
        <GlassCard style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="wallet-outline" size={20} color={theme.colors.accentPrimary} />
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t('budgetPlanner.title')}</Text>
                </View>
                {hasBudget ? (
                    <Text style={[styles.remaining, { color: isOverBudget ? theme.colors.error : theme.colors.success }]}>
                        {isOverBudget
                            ? t('budgetPlanner.overBudget')
                            : t('budgetPlanner.remaining', { amount: remaining.toFixed(0) })}
                    </Text>
                ) : (
                    <Text style={[styles.remaining, { color: theme.colors.textSecondary }]}>
                        {t('budgetPlanner.setBudget')}
                    </Text>
                )}
            </View>

            {/* Progress Bar (Only show if budget set) */}
            {hasBudget && (
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${progress}%`,
                                    backgroundColor: isOverBudget ? theme.colors.error : theme.colors.success
                                }
                            ]}
                        />
                    </View>
                </View>
            )}

            {/* Inputs */}
            <View style={styles.inputsRow}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('budgetPlanner.minLabel')}</Text>
                    <TextInput
                        style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.glassBorder }]}
                        value={minInput}
                        onChangeText={setMinInput}
                        onBlur={handleUpdate}
                        keyboardType="numeric"
                        placeholder={t('budgetPlanner.minPlaceholder')}
                        placeholderTextColor={theme.colors.textMuted}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('budgetPlanner.maxLabel')}</Text>
                    <TextInput
                        style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.glassBorder }]}
                        value={maxInput}
                        onChangeText={setMaxInput}
                        onBlur={handleUpdate}
                        keyboardType="numeric"
                        placeholder={t('budgetPlanner.maxPlaceholder')}
                        placeholderTextColor={theme.colors.textMuted}
                    />
                </View>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    remaining: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressContainer: {
        height: 6,
        marginBottom: 15,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarBg: {
        flex: 1,
        borderRadius: 3,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    inputsRow: {
        flexDirection: 'row',
        gap: 15,
    },
    inputGroup: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        fontSize: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
});
