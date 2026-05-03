import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useInventoryStore } from '../stores/inventoryStore';
import { useTheme } from '../stores/themeStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

export default function MaintenanceScreen() {
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const {
        maintenanceTasks,
        items,
        updateMaintenanceTask,
        deleteMaintenanceTask,
        addMaintenanceTask,
        seedCareDemo,
        loading,
        aiInsights,
        dismissAiInsight
    } = useInventoryStore();

    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'warranties'>('pending');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskFreq, setNewTaskFreq] = useState('90');
    const [isGuideExpanded, setIsGuideExpanded] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const allItemsWithWarranties = useMemo(() => {
        return items.filter(i => i.warrantyExpiry).sort((a, b) => {
            const dateA = new Date(a.warrantyExpiry!).getTime();
            const dateB = new Date(b.warrantyExpiry!).getTime();
            return dateA - dateB;
        });
    }, [items]);

    const upcomingWarranties = allItemsWithWarranties.filter(item => {
        const expiry = new Date(item.warrantyExpiry!);
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        return expiry > now && expiry <= thirtyDaysFromNow;
    });

    const filteredTasks = maintenanceTasks.filter(task => {
        if (filter === 'pending') return task.isCompleted === 0;
        if (filter === 'completed') return task.isCompleted === 1;
        return true;
    });

    const healthScore = useMemo(() => {
        if (maintenanceTasks.length === 0) return 100;

        const pendingTasks = maintenanceTasks.filter(t => t.isCompleted === 0);
        const now = new Date();

        // 1. Overdue Penalty with weighting
        let penalty = 0;
        pendingTasks.forEach(t => {
            if (t.dueDate && new Date(t.dueDate) < now) {
                // Safety items have 2x weight (20 points)
                const weight = t.title.toLowerCase().includes('smoke') || t.title.toLowerCase().includes('fire') ? 20 : 10;
                penalty += weight;
            }
        });

        // 2. Coverage Check: Does every item that SHOULD have a schedule, HAVE one?
        // (Simplified for now: Every appliance/HVAC should have at least 1 task)
        const maintenanceCategories = ['Appliances', 'HVAC', 'Safety', 'Plumbing'];
        const itemsNeedingMaintenance = items.filter(i => maintenanceCategories.includes(i.category || ''));
        const coveredItemIds = new Set(maintenanceTasks.map(t => t.itemId));

        const uncoveredCount = itemsNeedingMaintenance.filter(i => !coveredItemIds.has(i.id)).length;
        penalty += (uncoveredCount * 5); // 5 point penalty for each uncovered appliance

        return Math.max(0, 100 - penalty);
    }, [maintenanceTasks, items]);

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) return;
        await addMaintenanceTask({
            title: newTaskTitle.trim(),
            frequencyDays: parseInt(newTaskFreq) || 0,
            dueDate: new Date().toISOString(),
        });
        setShowAddModal(false);
        setNewTaskTitle('');
    };

    const handleToggleComplete = async (task: any) => {
        const isCompleted = task.isCompleted === 1 ? 0 : 1;
        await updateMaintenanceTask(task.id, {
            isCompleted,
            completedAt: isCompleted ? new Date().toISOString() : undefined
        });
    };

    const handleApproveInsight = async (itemId: string, insight: any, index: number) => {
        const item = items.find(i => i.id === itemId);
        await addMaintenanceTask({
            itemId,
            title: insight.title,
            description: insight.description,
            frequencyDays: insight.frequencyDays,
            dueDate: new Date().toISOString(),
            homeId: item?.homeId
        });
        dismissAiInsight(itemId, index);
        Alert.alert('Task Added', `Scheduled: ${insight.title}`);
    };

    const handleDeleteTask = (taskId: string) => {
        Alert.alert(
            t('common.confirm', 'Confirm'),
            t('maintenance.deleteConfirm', 'Are you sure you want to delete this task?'),
            [
                { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                {
                    text: t('common.delete', 'Delete'),
                    style: 'destructive',
                    onPress: () => deleteMaintenanceTask(taskId)
                }
            ]
        );
    };

    const toggleTaskSelection = (taskId: string) => {
        if (selectedTasks.includes(taskId)) {
            setSelectedTasks(prev => prev.filter(id => id !== taskId));
        } else {
            setSelectedTasks(prev => [...prev, taskId]);
        }
    };

    const handleBulkComplete = async () => {
        if (selectedTasks.length === 0) return;
        await useInventoryStore.getState().bulkUpdateMaintenanceTasks(selectedTasks, { isCompleted: 1 });
        setSelectedTasks([]);
        setIsSelectionMode(false);
        Alert.alert('Success', `Completed ${selectedTasks.length} tasks`);
    };

    const handleBulkDelete = async () => {
        if (selectedTasks.length === 0) return;
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete ${selectedTasks.length} tasks?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await useInventoryStore.getState().bulkDeleteMaintenanceTasks(selectedTasks);
                        setSelectedTasks([]);
                        setIsSelectionMode(false);
                    }
                }
            ]
        );
    };

    const renderWarrantyItem = (item: any) => {
        const expiry = new Date(item.warrantyExpiry!);
        const now = new Date();
        const isExpired = expiry < now;
        const isExpiringSoon = !isExpired && (expiry.getTime() - now.getTime()) < (30 * 24 * 60 * 60 * 1000);

        const statusColor = isExpired ? '#EF4444' : isExpiringSoon ? '#F59E0B' : '#10B981';
        const statusText = isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Protected';

        return (
            <TouchableOpacity
                key={`warranty-list-${item.id}`}
                style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => (navigation as any).navigate('ItemDetail', { itemId: item.id })}
            >
                <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                <View style={[styles.taskInfo, { marginLeft: 12 }]}>
                    <Text style={[styles.taskTitle, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.itemRef, { color: colors.textSecondary }]}>{item.category}</Text>
                    <View style={styles.dateRow}>
                        <MaterialCommunityIcons name="shield-check-outline" size={14} color={statusColor} />
                        <Text style={[styles.dateText, { color: statusColor, fontWeight: '600' }]}>
                            {statusText}: {expiry.toLocaleDateString()}
                        </Text>
                    </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
        );
    };

    const renderTask = (task: any) => {
        const item = items.find(i => i.id === task.itemId);
        const isOverdue = !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

        return (
            <View key={task.id} style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity
                    style={[
                        styles.checkbox,
                        { borderColor: task.isCompleted ? colors.primary : colors.border },
                        isSelectionMode && selectedTasks.includes(task.id) && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => isSelectionMode ? toggleTaskSelection(task.id) : handleToggleComplete(task)}
                >
                    {(task.isCompleted === 1 || (isSelectionMode && selectedTasks.includes(task.id))) && (
                        <MaterialCommunityIcons name="check" size={18} color={isSelectionMode ? "#FFF" : colors.primary} />
                    )}
                </TouchableOpacity>

                <View style={styles.taskInfo}>
                    <Text style={[
                        styles.taskTitle,
                        { color: colors.text },
                        task.isCompleted && styles.completedText
                    ]}>
                        {task.title}
                    </Text>
                    {item && (
                        <Text style={[styles.itemRef, { color: colors.textSecondary }]}>
                            {item.name}
                        </Text>
                    )}
                    {task.dueDate && (
                        <View style={styles.dateRow}>
                            <MaterialCommunityIcons
                                name="calendar-clock"
                                size={14}
                                color={isOverdue ? colors.error : colors.textSecondary}
                            />
                            <Text style={[
                                styles.dateText,
                                { color: isOverdue ? colors.error : colors.textSecondary },
                                isOverdue && { fontWeight: '700' }
                            ]}>
                                {new Date(task.dueDate).toLocaleDateString()} {isOverdue ? '(Overdue)' : ''}
                            </Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity onPress={() => handleDeleteTask(task.id)} style={styles.deleteButton}>
                    <MaterialCommunityIcons name="delete-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => isSelectionMode ? (setIsSelectionMode(false), setSelectedTasks([])) : navigation.goBack()}
                            style={{ padding: 4, marginLeft: -8 }}
                        >
                            <MaterialCommunityIcons name={isSelectionMode ? "close" : "arrow-left"} size={28} color={colors.text} />
                        </TouchableOpacity>
                        <View>
                            <Text style={[styles.title, { color: colors.text }]}>
                                {isSelectionMode ? `${selectedTasks.length} Selected` : 'Care Hub'}
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {isSelectionMode ? 'Bulk Actions' : 'Maintenance Autopilot'}
                            </Text>
                        </View>
                    </View>

                    {filter === 'pending' && !isSelectionMode && (
                        <TouchableOpacity
                            onPress={() => setIsSelectionMode(true)}
                            style={[styles.editBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                        >
                            <MaterialCommunityIcons name="select-multiple" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Home Health Score Section */}
            <View style={[styles.healthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.healthCircle, { borderColor: healthScore > 80 ? '#10B981' : healthScore > 50 ? '#F59E0B' : '#EF4444' }]}>
                    <Text style={[styles.healthPercent, { color: healthScore > 80 ? '#10B981' : healthScore > 50 ? '#F59E0B' : '#EF4444' }]}>{healthScore}%</Text>
                    <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Health</Text>
                </View>
                <View style={styles.healthStats}>
                    <Text style={[styles.healthStatusTitle, { color: colors.text }]}>
                        {healthScore >= 90 ? 'Excellent' : healthScore >= 70 ? 'Good' : 'Needs Work'}
                    </Text>
                    <Text style={[styles.healthStatusDesc, { color: colors.textSecondary }]}>
                        {healthScore >= 90
                            ? 'Your home is spectacularly maintained!'
                            : 'Complete overdue tasks to boost your score.'}
                    </Text>
                    <View style={styles.statsMiniRow}>
                        <Text style={[styles.miniStat, { color: colors.text }]}>
                            <Text style={{ fontWeight: '800' }}>{maintenanceTasks.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()).length}</Text> Overdue
                        </Text>
                    </View>
                </View>
            </View>

            {/* How Care Autopilot Works Guide */}
            <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
                <View style={[styles.howItWorks, { backgroundColor: colors.surface + '80', borderColor: colors.border, marginTop: 16 }]}>
                    <TouchableOpacity
                        style={styles.howHeader}
                        onPress={() => setIsGuideExpanded(!isGuideExpanded)}
                        activeOpacity={0.7}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                            <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
                            <Text style={[styles.howTitle, { color: colors.text }]}>How Care Autopilot Works</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={isGuideExpanded ? "chevron-up" : "chevron-down"}
                            size={24}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>

                    {isGuideExpanded && (
                        <View style={{ marginTop: 20 }}>
                            <View style={styles.howStep}>
                                <Text style={[styles.howStepNum, { color: colors.primary }]}>1</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.howStepTitle, { color: colors.text }]}>Dynamic Keyword Detection</Text>
                                    <Text style={[styles.howStepText, { color: colors.textSecondary }]}>
                                        When you add an item, we analyze its name and category (e.g., "Fridge" or "AC").
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.howStep}>
                                <Text style={[styles.howStepNum, { color: colors.primary }]}>2</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.howStepTitle, { color: colors.text }]}>Deterministic AI Logic</Text>
                                    <Text style={[styles.howStepText, { color: colors.textSecondary }]}>
                                        Our rules engine matches your items to expert maintenance blueprints for that specific equipment type.
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.howStep}>
                                <Text style={[styles.howStepNum, { color: colors.primary }]}>3</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.howStepTitle, { color: colors.text }]}>Self-Healing Schedules</Text>
                                    <Text style={[styles.howStepText, { color: colors.textSecondary }]}>
                                        Complete a task, and Care automatically calculates and schedules the next recommended service date.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.filterRow}>
                <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
                    {(['pending', 'completed', 'warranties', 'all'] as const).map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            style={[
                                styles.filterTab,
                                filter === f && { backgroundColor: colors.primary, borderColor: colors.primary }
                            ]}
                        >
                            <Text style={[
                                styles.filterLabel,
                                { color: filter === f ? '#FFF' : colors.textSecondary }
                            ]}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {upcomingWarranties.length > 0 && filter === 'pending' && (
                    <View style={styles.warrantyAlertSection}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="shield-alert" size={18} color="#EF4444" />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Warranty Alerts</Text>
                        </View>
                        {upcomingWarranties.map(item => (
                            <TouchableOpacity
                                key={`warranty-${item.id}`}
                                style={[styles.warrantyCard, { backgroundColor: '#EF444410', borderColor: '#EF444430' }]}
                                onPress={() => (navigation as any).navigate('ItemDetail', { itemId: item.id })}
                            >
                                <View style={styles.warrantyInfo}>
                                    <Text style={[styles.warrantyItemName, { color: colors.text }]}>{item.name}</Text>
                                    <Text style={[styles.warrantyDraft, { color: '#EF4444' }]}>
                                        Expires on {new Date(item.warrantyExpiry!).toLocaleDateString()}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {filter === 'warranties' ? (
                    allItemsWithWarranties.length > 0 ? (
                        allItemsWithWarranties.map(renderWarrantyItem)
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="shield-off-outline" size={64} color={colors.border} />
                            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No Warranties Found</Text>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Add warranty expiry dates to your items to track them here.</Text>
                        </View>
                    )
                ) : (
                    filteredTasks.length > 0 ? (
                        filteredTasks.map(renderTask)
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="clipboard-check-outline" size={64} color={colors.border} />
                            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                                {filter === 'pending' ? 'All caught up!' : 'No tasks found'}
                            </Text>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {filter === 'pending'
                                    ? 'Your home is in great shape. New tasks will appear here automatically.'
                                    : 'Complete some tasks or scan new items to build your history.'}
                            </Text>

                            {filter === 'pending' && maintenanceTasks.length === 0 && (
                                <TouchableOpacity
                                    style={[styles.seedBtn, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
                                    onPress={() => seedCareDemo()}
                                    disabled={loading}
                                >
                                    <MaterialCommunityIcons name="lightning-bolt" size={20} color={colors.primary} />
                                    <Text style={[styles.seedBtnText, { color: colors.primary }]}>
                                        {loading ? 'Generating...' : 'Try with Demo Data'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                )}

                {/* AI INSIGHTS SECTION */}
                {Object.keys(aiInsights).length > 0 && filter === 'pending' && (
                    <View style={{ marginTop: 24, paddingHorizontal: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <MaterialCommunityIcons name="auto-fix" size={24} color={colors.primary} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Care Suggestions</Text>
                        </View>
                        {Object.entries(aiInsights).map(([itemId, suggestions]) => {
                            const item = items.find(i => i.id === itemId);
                            if (!item) return null;
                            return suggestions.map((insight, idx) => (
                                <View key={`${itemId}-${idx}`} style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.primary + '30' }]}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                            <Text style={[styles.itemLabel, { color: colors.primary }]}>{item.name}</Text>
                                        </View>
                                        <Text style={[styles.taskTitle, { color: colors.text }]}>{insight.title}</Text>
                                        <Text style={[styles.insightReason, { color: colors.textSecondary }]}>{insight.reasoning}</Text>
                                        <TouchableOpacity
                                            style={[styles.approveBtn, { backgroundColor: colors.primary }]}
                                            onPress={() => handleApproveInsight(itemId, insight, idx)}
                                        >
                                            <Text style={styles.approveBtnText}>Add to Schedule</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => dismissAiInsight(itemId, idx)}
                                        style={{ padding: 4 }}
                                    >
                                        <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary + '60'} />
                                    </TouchableOpacity>
                                </View>
                            ));
                        })}
                    </View>
                )}
            </ScrollView>

            {isSelectionMode && selectedTasks.length > 0 && (
                <View style={[styles.bulkActions, { backgroundColor: colors.primary, bottom: insets.bottom + 20 }]}>
                    <Text style={styles.bulkCount}>{selectedTasks.length} selected</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity style={styles.bulkBtn} onPress={handleBulkComplete}>
                            <MaterialCommunityIcons name="check-all" size={20} color="#FFF" />
                            <Text style={styles.bulkBtnText}>Complete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.bulkBtn} onPress={handleBulkDelete}>
                            <MaterialCommunityIcons name="delete" size={20} color="#FFF" />
                            <Text style={styles.bulkBtnText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => setShowAddModal(true)}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
            </TouchableOpacity>

            {/* Add Task Modal */}
            <Modal visible={showAddModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
                        <View style={[styles.modalInner, { backgroundColor: colors.surface }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Custom Task</Text>
                                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>TASK TITLE</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                value={newTaskTitle}
                                onChangeText={setNewTaskTitle}
                                placeholder="e.g. Garden Service"
                                placeholderTextColor={colors.textSecondary}
                                autoFocus
                            />

                            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 16 }]}>RECURRENCE (DAYS)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                value={newTaskFreq}
                                onChangeText={setNewTaskFreq}
                                placeholder="90"
                                keyboardType="numeric"
                                placeholderTextColor={colors.textSecondary}
                            />

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                                onPress={handleCreateTask}
                            >
                                <Text style={styles.saveBtnText}>Schedule Task</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    statsBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statsText: {
        fontSize: 14,
        fontWeight: '700',
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Space for FAB
    },
    healthCard: {
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    healthCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
    },
    healthPercent: {
        fontSize: 20,
        fontWeight: '800',
    },
    healthLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    healthStats: {
        flex: 1,
    },
    healthStatusTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    healthStatusDesc: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    statsMiniRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    miniStat: {
        fontSize: 12,
        fontWeight: '500',
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 12,
    },
    statusIndicator: {
        width: 4,
        height: '100%',
        borderRadius: 2,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    itemRef: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '500',
    },
    deleteButton: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    warrantyAlertSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    warrantyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 8,
    },
    warrantyInfo: {
        flex: 1,
    },
    warrantyItemName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    warrantyDraft: {
        fontSize: 12,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
    },
    modalInner: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    input: {
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    saveBtn: {
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },
    saveBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    seedBtn: {
        marginTop: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    seedBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
    howItWorks: {
        marginTop: 40,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
    },
    howHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    howTitle: {
        fontSize: 15,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    howStep: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    howStepNum: {
        fontSize: 18,
        fontWeight: '900',
        opacity: 0.5,
        width: 20,
    },
    howStepTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    howStepText: {
        fontSize: 13,
        lineHeight: 18,
    },
    insightCard: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 12,
        flexDirection: 'row',
        gap: 12,
    },
    itemLabel: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    insightReason: {
        fontSize: 12,
        lineHeight: 18,
        marginTop: 4,
        fontStyle: 'italic',
    },
    approveBtn: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    approveBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    editBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    editBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    bulkActions: {
        position: 'absolute',
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    bulkCount: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 16,
    },
    bulkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    bulkBtnText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
    }
});
