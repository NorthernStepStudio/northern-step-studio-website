import Constants from 'expo-constants';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';
import SectionCard from './SectionCard';
import { useCompanion } from '../state/CompanionProvider';

interface AdminConsoleProps {
  languageGateOpen: boolean;
  onReopenLanguageGate: () => Promise<void>;
}

interface DetailRowProps {
  label: string;
  value: string;
}

const isAdminConsoleEnabled = process.env.EXPO_PUBLIC_SHOW_ADMIN_CONSOLE !== '0';

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function AdminConsole({ languageGateOpen, onReopenLanguageGate }: AdminConsoleProps) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const {
    hydrated,
    locale,
    onboardingCompleted,
    onboardingMode,
    profile,
    activePath,
    stepProgress,
    educationProgress,
    accountProfile,
    subscription,
    subscriptionBusy,
    refreshSubscription,
    resetLocalData,
    restartOnboarding,
    completeAnonymousOnboarding,
    nextBestAction
  } = useCompanion();

  const completedRoadmapSteps = useMemo(
    () => stepProgress.filter((entry) => entry.status === 'done').length,
    [stepProgress]
  );
  const completedEducationModules = useMemo(
    () => educationProgress.filter((entry) => entry.completed).length,
    [educationProgress]
  );

  if (!isAdminConsoleEnabled) {
    return null;
  }

  const closeConsole = () => {
    setVisible(false);
    setStatusMessage(null);
  };

  const handleRefreshBilling = async () => {
    setStatusMessage(null);
    await refreshSubscription();
    setStatusMessage('Billing snapshot refreshed.');
  };

  const handleOpenLanguageGate = async () => {
    await onReopenLanguageGate();
    closeConsole();
  };

  const handleResetLocalData = () => {
    Alert.alert(
      'Reset local app data?',
      'This clears onboarding, progress, and account profile on this device.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await resetLocalData();
              closeConsole();
            })();
          }
        }
      ]
    );
  };

  const handleRestartOnboarding = () => {
    restartOnboarding();
    closeConsole();
  };

  const handleSkipOnboarding = () => {
    completeAnonymousOnboarding('no_credit');
    closeConsole();
  };

  const environmentLabel = __DEV__ ? 'development' : 'runtime';
  const revenueCatStatus = subscription.available
    ? subscription.entitlementActive
      ? 'active'
      : 'inactive'
    : `unavailable${subscription.reasonCode ? ` (${subscription.reasonCode})` : ''}`;
  const appOwnership = Constants.appOwnership ?? 'unknown';
  const executionEnvironment = Constants.executionEnvironment ?? 'unknown';
  const currentAccountId = accountProfile.appUserId.trim() || 'not set';
  const billingIdentity = accountProfile.linkedToBilling ? 'linked' : 'not linked';
  const onboardingState = onboardingCompleted ? onboardingMode ?? 'complete' : 'not started';
  const languageGateState = languageGateOpen ? 'open' : 'closed';
  const nextAction = nextBestAction?.stepId ?? 'none';

  return (
    <>
      <TouchableOpacity
        style={[
          styles.triggerButton,
          {
            bottom: Math.max(theme.spacing.lg, insets.bottom + 12)
          }
        ]}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.triggerButtonText}>Admin</Text>
      </TouchableOpacity>

      <Modal
        animationType='slide'
        onRequestClose={closeConsole}
        presentationStyle='pageSheet'
        transparent
        visible={visible}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closeConsole} />

          <View
            style={[
              styles.sheet,
              {
                paddingTop: Math.max(theme.spacing.lg, insets.top + theme.spacing.sm),
                paddingBottom: Math.max(theme.spacing.lg, insets.bottom + theme.spacing.sm)
              }
            ]}
          >
            <View style={styles.headerRow}>
              <View style={styles.headerCopy}>
                <Text style={styles.headerEyebrow}>PasoScore</Text>
                <Text style={styles.headerTitle}>Admin Console</Text>
                <Text style={styles.headerSubtitle}>
                  Global diagnostics and recovery tools for the current app state.
                </Text>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={closeConsole}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}

              <SectionCard title='App State' subtitle='Current runtime and flow visibility'>
                <DetailRow label='Hydrated' value={hydrated ? 'yes' : 'no'} />
                <DetailRow label='Build mode' value={environmentLabel} />
                <DetailRow label='Platform' value={Platform.OS} />
                <DetailRow label='App ownership' value={appOwnership} />
                <DetailRow label='Execution env' value={executionEnvironment} />
                <DetailRow label='Locale' value={locale} />
                <DetailRow label='Language gate' value={languageGateState} />
                <DetailRow label='Onboarding' value={onboardingState} />
              </SectionCard>

              <SectionCard title='User Snapshot' subtitle='Current profile and progress data'>
                <DetailRow label='Path' value={activePath.code} />
                <DetailRow label='Credit stage' value={profile.creditStage} />
                <DetailRow label='Open accounts' value={String(profile.openAccounts)} />
                <DetailRow label='Utilization' value={`${profile.revolvingUtilizationPct}%`} />
                <DetailRow label='Roadmap complete' value={`${completedRoadmapSteps}/${stepProgress.length}`} />
                <DetailRow
                  label='Education complete'
                  value={`${completedEducationModules}/${educationProgress.length}`}
                />
                <DetailRow label='Next action' value={nextAction} />
              </SectionCard>

              <SectionCard title='Billing Snapshot' subtitle='RevenueCat and account linkage status'>
                <DetailRow label='Account ID' value={currentAccountId} />
                <DetailRow label='Billing identity' value={billingIdentity} />
                <DetailRow label='RevenueCat' value={revenueCatStatus} />
                <DetailRow label='Entitlement' value={subscription.entitlementId} />
                <DetailRow label='Packages' value={String(subscription.packages.length)} />
                <DetailRow label='Busy' value={subscriptionBusy ? 'yes' : 'no'} />
              </SectionCard>

              <SectionCard title='Actions' subtitle='Use these without navigating through onboarding or settings'>
                <View style={styles.actionsWrap}>
                  {!onboardingCompleted ? (
                    <TouchableOpacity style={styles.actionButton} onPress={handleSkipOnboarding}>
                      <Text style={styles.actionButtonText}>Skip onboarding</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.actionButton} onPress={handleRestartOnboarding}>
                      <Text style={styles.actionButtonText}>Restart onboarding</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={styles.actionButton} onPress={handleOpenLanguageGate}>
                    <Text style={styles.actionButtonText}>Reopen language picker</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, subscriptionBusy ? styles.actionButtonDisabled : null]}
                    disabled={subscriptionBusy}
                    onPress={() => {
                      void handleRefreshBilling();
                    }}
                  >
                    <Text style={styles.actionButtonText}>Refresh billing snapshot</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.dangerButton} onPress={handleResetLocalData}>
                    <Text style={styles.dangerButtonText}>Reset local app data</Text>
                  </TouchableOpacity>
                </View>
              </SectionCard>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    position: 'absolute',
    right: theme.spacing.md,
    zIndex: 10,
    backgroundColor: theme.colors.ink,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6
  },
  triggerButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 19, 36, 0.34)'
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: '#EEF4FF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: theme.spacing.md
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  headerCopy: {
    flex: 1,
    gap: 4
  },
  headerEyebrow: {
    color: theme.colors.info,
    fontFamily: theme.fonts.mono,
    fontSize: theme.typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  headerTitle: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.heading,
    fontSize: 28
  },
  headerSubtitle: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    lineHeight: 20
  },
  closeButton: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  closeButtonText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    fontSize: 12
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl
  },
  statusMessage: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.sm,
    color: theme.colors.accentDark,
    fontFamily: theme.fonts.medium,
    marginBottom: theme.spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.cloud,
    paddingVertical: 6
  },
  detailLabel: {
    flex: 1,
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    fontSize: 13
  },
  detailValue: {
    flex: 1,
    color: theme.colors.ink,
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    textAlign: 'right'
  },
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  actionButton: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  actionButtonDisabled: {
    opacity: 0.5
  },
  actionButtonText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    fontSize: 12
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#F2B8B5',
    backgroundColor: '#FFF3F2',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  dangerButtonText: {
    color: theme.colors.danger,
    fontFamily: theme.fonts.medium,
    fontSize: 12
  }
});
