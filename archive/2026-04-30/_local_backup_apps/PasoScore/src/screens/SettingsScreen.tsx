import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import LanguageSwitcher from '../components/LanguageSwitcher';
import SectionCard from '../components/SectionCard';
import { theme } from '../constants/theme';
import { t } from '../core/i18n';
import { useCompanion } from '../state/CompanionProvider';

export default function SettingsScreen() {
  const {
    locale,
    accountProfile,
    updateAccountProfile,
    linkBillingIdentity,
    unlinkBillingIdentity,
    resetLocalData,
    subscription,
    subscriptionBusy,
    refreshSubscription,
    presentSubscriptionPaywall,
    openSubscriptionCustomerCenter,
    purchaseSubscriptionPackage,
    restoreSubscriptionPurchases
  } = useCompanion();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(accountProfile.displayName);
  const [email, setEmail] = useState(accountProfile.email);
  const [appUserId, setAppUserId] = useState(accountProfile.appUserId);
  const privacyPolicyUrl = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim() || '';
  const termsUrl = process.env.EXPO_PUBLIC_TERMS_URL?.trim() || '';

  const isValidAccountId = (value: string): boolean => /^[A-Za-z0-9][A-Za-z0-9._-]{4,63}$/.test(value);
  const createAccountId = (): string => {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PS-${stamp}-${random}`;
  };

  useEffect(() => {
    setDisplayName(accountProfile.displayName);
    setEmail(accountProfile.email);
    setAppUserId(accountProfile.appUserId);
  }, [accountProfile.displayName, accountProfile.email, accountProfile.appUserId]);

  const onRefresh = async () => {
    setActionMessage(null);
    await refreshSubscription();
  };

  const onRestore = async () => {
    setActionMessage(null);
    const restored = await restoreSubscriptionPurchases();
    setActionMessage(
      restored
        ? t(locale, 'settings.subscription.restoreSuccess')
        : t(locale, 'settings.subscription.restoreNoEntitlement')
    );
  };

  const onPurchase = async (packageIdentifier: string) => {
    setActionMessage(null);
    const success = await purchaseSubscriptionPackage(packageIdentifier);
    setActionMessage(
      success
        ? t(locale, 'settings.subscription.purchaseSuccess')
        : t(locale, 'settings.subscription.purchaseFailed')
    );
  };

  const onPaywall = async () => {
    setActionMessage(null);
    const outcome = await presentSubscriptionPaywall();

    if (outcome === 'purchased') {
      setActionMessage(t(locale, 'settings.subscription.purchaseSuccess'));
      return;
    }

    if (outcome === 'restored') {
      setActionMessage(t(locale, 'settings.subscription.restoreSuccess'));
      return;
    }

    if (outcome === 'unavailable') {
      setActionMessage(t(locale, 'settings.subscription.unavailable'));
      return;
    }

    if (outcome === 'cancelled' || outcome === 'not_presented') {
      return;
    }

    setActionMessage(t(locale, 'settings.subscription.purchaseFailed'));
  };

  const onCustomerCenter = async () => {
    setActionMessage(null);
    const opened = await openSubscriptionCustomerCenter();
    setActionMessage(
      opened
        ? t(locale, 'settings.subscription.customerCenterOpened')
        : t(locale, 'settings.subscription.customerCenterUnavailable')
    );
  };

  const onSaveAccount = () => {
    const trimmedUserId = appUserId.trim();
    if (trimmedUserId.length > 0 && !isValidAccountId(trimmedUserId)) {
      setAccountMessage(t(locale, 'settings.account.idInvalid'));
      return;
    }

    updateAccountProfile({
      displayName: displayName.trim(),
      email: email.trim(),
      appUserId: trimmedUserId
    });
    setAccountMessage(t(locale, 'settings.account.saved'));
  };

  const onLinkBilling = async () => {
    setAccountMessage(null);
    if (!canUseBillingActions) {
      setAccountMessage(t(locale, 'settings.subscription.unavailable'));
      return;
    }

    const trimmed = appUserId.trim();
    if (!trimmed) {
      setAccountMessage(t(locale, 'settings.account.idRequired'));
      return;
    }
    if (!isValidAccountId(trimmed)) {
      setAccountMessage(t(locale, 'settings.account.idInvalid'));
      return;
    }

    updateAccountProfile({ appUserId: trimmed });
    const linked = await linkBillingIdentity(trimmed);
    setAccountMessage(linked ? t(locale, 'settings.account.linked') : t(locale, 'settings.account.linkFailed'));
  };

  const onUnlinkBilling = async () => {
    setAccountMessage(null);
    if (!canUseBillingActions) {
      setAccountMessage(t(locale, 'settings.subscription.unavailable'));
      return;
    }

    const unlinked = await unlinkBillingIdentity();
    setAccountMessage(unlinked ? t(locale, 'settings.account.unlinked') : t(locale, 'settings.account.linkFailed'));
  };

  const onGenerateAccountId = () => {
    const generated = createAccountId();
    setAppUserId(generated);
    updateAccountProfile({ appUserId: generated });
    setAccountMessage(t(locale, 'settings.account.generated'));
  };

  const onResetData = () => {
    Alert.alert(t(locale, 'settings.data.resetTitle'), t(locale, 'settings.data.resetBody'), [
      { text: t(locale, 'common.no'), style: 'cancel' },
      {
        text: t(locale, 'common.yes'),
        style: 'destructive',
        onPress: async () => {
          await resetLocalData();
          setDataMessage(t(locale, 'settings.data.resetDone'));
        }
      }
    ]);
  };

  const onOpenLegalUrl = async (url: string) => {
    try {
      if (!url) {
        setDataMessage(t(locale, 'settings.legal.unavailable'));
        return;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        setDataMessage(t(locale, 'settings.legal.unavailable'));
        return;
      }

      await Linking.openURL(url);
    } catch {
      setDataMessage(t(locale, 'settings.legal.unavailable'));
    }
  };

  const getSubscriptionNotice = (): string | null => {
    if (!subscription.available) {
      return t(locale, 'settings.subscription.unavailable');
    }

    if (!subscription.reasonCode) {
      return null;
    }

    if (subscription.reasonCode === 'status_error') {
      return t(locale, 'settings.subscription.statusError');
    }

    if (subscription.reasonCode === 'package_unavailable') {
      return t(locale, 'settings.subscription.packageUnavailable');
    }

    if (subscription.reasonCode === 'restore_failed') {
      return t(locale, 'settings.subscription.restoreFailed');
    }

    if (subscription.reasonCode === 'purchase_not_completed') {
      return t(locale, 'settings.subscription.purchaseFailed');
    }

    return t(locale, 'settings.subscription.unavailable');
  };

  const subscriptionNotice = getSubscriptionNotice();
  const canLinkBilling = appUserId.trim().length > 0;
  const canUseBillingActions = subscription.available;
  const canLinkBillingAction = canUseBillingActions && canLinkBilling;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <SectionCard title={t(locale, 'settings.title')} subtitle={t(locale, 'settings.subtitle')}>
        <LanguageSwitcher />
      </SectionCard>

      <SectionCard title={t(locale, 'settings.account.title')} subtitle={t(locale, 'settings.account.subtitle')}>
        <Text style={styles.label}>{t(locale, 'settings.account.name')}</Text>
        <TextInput value={displayName} onChangeText={setDisplayName} style={styles.input} autoCapitalize='words' />

        <Text style={styles.label}>{t(locale, 'settings.account.email')}</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType='email-address'
          autoCapitalize='none'
        />

        <Text style={styles.label}>{t(locale, 'settings.account.userId')}</Text>
        <TextInput value={appUserId} onChangeText={setAppUserId} style={styles.input} autoCapitalize='none' />

        <Text style={styles.statusText}>
          {t(locale, 'settings.account.linkStatus')}:{' '}
          {accountProfile.linkedToBilling
            ? t(locale, 'settings.account.linkStatusLinked')
            : t(locale, 'settings.account.linkStatusNotLinked')}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={onSaveAccount} disabled={subscriptionBusy}>
            <Text style={styles.actionButtonText}>{t(locale, 'settings.account.save')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onGenerateAccountId} disabled={subscriptionBusy}>
            <Text style={styles.actionButtonText}>{t(locale, 'settings.account.generate')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, !canLinkBillingAction ? styles.actionButtonDisabled : null]}
            onPress={onLinkBilling}
            disabled={subscriptionBusy || !canLinkBillingAction}
          >
            <Text style={styles.actionButtonText}>{t(locale, 'settings.account.link')}</Text>
          </TouchableOpacity>
          {accountProfile.linkedToBilling && canUseBillingActions ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onUnlinkBilling}
              disabled={subscriptionBusy}
            >
              <Text style={styles.actionButtonText}>{t(locale, 'settings.account.unlink')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.hintText}>{t(locale, 'settings.account.restoreHint')}</Text>
        {accountMessage ? <Text style={styles.messageText}>{accountMessage}</Text> : null}
      </SectionCard>

      <SectionCard
        title={t(locale, 'settings.subscription.title')}
        subtitle={t(locale, 'settings.subscription.subtitle')}
      >
        <View style={styles.planBox}>
          <Text style={styles.planTitle}>{t(locale, 'settings.subscription.proTitle')}</Text>
          <Text style={styles.planLine}>{t(locale, 'settings.subscription.proLine1')}</Text>
          <Text style={styles.planLine}>{t(locale, 'settings.subscription.proLine2')}</Text>
          <Text style={styles.planLine}>{t(locale, 'settings.subscription.proLine3')}</Text>
        </View>

        <Text style={styles.statusText}>
          {t(locale, 'settings.subscription.status')}: {' '}
          {subscription.entitlementActive
            ? t(locale, 'settings.subscription.active')
            : t(locale, 'settings.subscription.inactive')}
        </Text>

        {subscriptionNotice ? <Text style={styles.unavailableText}>{subscriptionNotice}</Text> : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={onRefresh} disabled={subscriptionBusy}>
            <Text style={styles.actionButtonText}>{t(locale, 'settings.subscription.refresh')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !canUseBillingActions ? styles.actionButtonDisabled : null]}
            onPress={() => {
              void onPaywall();
            }}
            disabled={subscriptionBusy || !canUseBillingActions}
          >
            <Text style={styles.actionButtonText}>{t(locale, 'settings.subscription.showPaywall')}</Text>
          </TouchableOpacity>

          {canUseBillingActions ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                void onCustomerCenter();
              }}
              disabled={subscriptionBusy}
            >
              <Text style={styles.actionButtonText}>{t(locale, 'settings.subscription.customerCenter')}</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.actionButton, !canUseBillingActions ? styles.actionButtonDisabled : null]}
            onPress={onRestore}
            disabled={subscriptionBusy || !canUseBillingActions}
          >
            <Text style={styles.actionButtonText}>{t(locale, 'settings.subscription.restore')}</Text>
          </TouchableOpacity>
        </View>

        {subscriptionBusy ? <ActivityIndicator color={theme.colors.accent} /> : null}

        {subscription.available && subscription.packages.length > 0 ? (
          <View style={styles.packagesWrap}>
            {subscription.packages.map((pkg) => (
              <View key={pkg.identifier} style={styles.packageCard}>
                <View style={styles.packageBody}>
                  <Text style={styles.packageTitle}>{pkg.title}</Text>
                  <Text style={styles.packageMeta}>{pkg.priceString}</Text>
                </View>
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => onPurchase(pkg.identifier)}
                  disabled={subscriptionBusy}
                >
                  <Text style={styles.buyButtonText}>{t(locale, 'settings.subscription.buy')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {actionMessage ? <Text style={styles.messageText}>{actionMessage}</Text> : null}
      </SectionCard>

      <SectionCard title={t(locale, 'privacy.boundary.title')}>
        <Text style={styles.boundaryText}>{t(locale, 'privacy.boundary.body')}</Text>
      </SectionCard>

      <SectionCard title={t(locale, 'settings.legal.title')} subtitle={t(locale, 'settings.legal.subtitle')}>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onOpenLegalUrl(privacyPolicyUrl)}>
            <Text style={styles.actionButtonText}>{t(locale, 'settings.legal.privacy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onOpenLegalUrl(termsUrl)}>
            <Text style={styles.actionButtonText}>{t(locale, 'settings.legal.terms')}</Text>
          </TouchableOpacity>
        </View>
      </SectionCard>

      <SectionCard title={t(locale, 'settings.data.title')} subtitle={t(locale, 'settings.data.subtitle')}>
        <TouchableOpacity style={styles.dangerButton} onPress={onResetData}>
          <Text style={styles.dangerButtonText}>{t(locale, 'settings.data.reset')}</Text>
        </TouchableOpacity>
        {dataMessage ? <Text style={styles.messageText}>{dataMessage}</Text> : null}
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.paper
  },
  content: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl
  },
  statusText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
  },
  label: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    marginTop: 6
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.panel,
    fontFamily: theme.fonts.body,
    color: theme.colors.ink
  },
  hintText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    lineHeight: 20
  },
  unavailableText: {
    color: theme.colors.warning,
    fontFamily: theme.fonts.body,
    lineHeight: 20
  },
  planBox: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.panel
  },
  planTitle: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    marginBottom: 2
  },
  planLine: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    lineHeight: 18
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  actionButton: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.panel
  },
  actionButtonDisabled: {
    opacity: 0.5
  },
  actionButtonText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    fontSize: 12
  },
  packagesWrap: {
    gap: theme.spacing.sm
  },
  packageCard: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.panel,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  packageBody: {
    flex: 1,
    gap: 2
  },
  packageTitle: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
  },
  packageMeta: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    fontSize: 12
  },
  buyButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  buyButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.medium,
    fontSize: 12
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#F2B8B5',
    backgroundColor: '#FFF3F2',
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  dangerButtonText: {
    color: theme.colors.danger,
    fontFamily: theme.fonts.medium
  },
  messageText: {
    color: theme.colors.info,
    fontFamily: theme.fonts.body
  },
  boundaryText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    lineHeight: 20
  }
});
