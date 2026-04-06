import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import SectionCard from '../components/SectionCard';
import { theme } from '../constants/theme';
import { t } from '../core/i18n';
import { renderLetter } from '../core/letters';
import { LetterTemplateType } from '../core/types';
import { exportLetterPdf } from '../services/pdfExport';
import { useCompanion } from '../state/CompanionProvider';

export default function LettersScreen() {
  const { locale, subscription, presentSubscriptionPaywall } = useCompanion();
  const canExportPdf = subscription.entitlementActive;

  const [template, setTemplate] = useState<LetterTemplateType>('goodwill_request');
  const [senderName, setSenderName] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [accountReference, setAccountReference] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const templateOptions: Array<{ value: LetterTemplateType; label: string }> = useMemo(
    () => [
      { value: 'goodwill_request', label: t(locale, 'letters.goodwill') },
      { value: 'debt_validation_request', label: t(locale, 'letters.validation') },
      { value: 'hardship_plan_request', label: t(locale, 'letters.hardship') }
    ],
    [locale]
  );

  const handleGenerate = async () => {
    if (!canExportPdf) {
      const outcome = await presentSubscriptionPaywall();
      if (outcome !== 'purchased' && outcome !== 'restored') {
        setResultMessage(t(locale, 'letters.proLocked'));
      }
      return;
    }

    setResultMessage(null);
    setLoading(true);

    try {
      const letter = renderLetter({
        template,
        senderName: senderName || 'Sender Name',
        senderAddress: senderAddress || 'Sender Address',
        recipientName: recipientName || 'Recipient Name',
        recipientAddress: recipientAddress || 'Recipient Address',
        accountReference: accountReference || 'Reference',
        explanation:
          explanation ||
          'I am documenting this request with factual details and I request a written response for my records.',
        locale
      });

      const result = await exportLetterPdf(letter);
      setResultMessage(result.shared ? t(locale, 'letters.generated') : t(locale, 'letters.shareUnavailable'));
    } catch {
      setResultMessage(t(locale, 'letters.errorGenerate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <SectionCard title={t(locale, 'letters.title')} subtitle={t(locale, 'letters.subtitle')}>
        {!canExportPdf ? (
          <View style={styles.proLockBox}>
            <Text style={styles.proLockText}>{t(locale, 'letters.proLocked')}</Text>
            <TouchableOpacity
              style={styles.paywallButton}
              onPress={() => {
                void presentSubscriptionPaywall();
              }}
            >
              <Text style={styles.paywallButtonText}>{t(locale, 'settings.subscription.showPaywall')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.label}>{t(locale, 'letters.template')}</Text>
        <View style={styles.templateRow}>
          {templateOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.templateButton, template === option.value ? styles.templateButtonActive : null]}
              onPress={() => setTemplate(option.value)}
            >
              <Text
                style={[styles.templateButtonText, template === option.value ? styles.templateButtonTextActive : null]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t(locale, 'letters.senderName')}</Text>
        <TextInput value={senderName} onChangeText={setSenderName} style={styles.input} />

        <Text style={styles.label}>{t(locale, 'letters.senderAddress')}</Text>
        <TextInput value={senderAddress} onChangeText={setSenderAddress} style={styles.input} multiline />

        <Text style={styles.label}>{t(locale, 'letters.recipientName')}</Text>
        <TextInput value={recipientName} onChangeText={setRecipientName} style={styles.input} />

        <Text style={styles.label}>{t(locale, 'letters.recipientAddress')}</Text>
        <TextInput
          value={recipientAddress}
          onChangeText={setRecipientAddress}
          style={styles.input}
          multiline
        />

        <Text style={styles.label}>{t(locale, 'letters.accountRef')}</Text>
        <TextInput value={accountReference} onChangeText={setAccountReference} style={styles.input} />

        <Text style={styles.label}>{t(locale, 'letters.explanation')}</Text>
        <TextInput value={explanation} onChangeText={setExplanation} style={styles.inputLarge} multiline />

        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.generateButtonText}>{t(locale, 'letters.generate')}</Text>
          )}
        </TouchableOpacity>

        {resultMessage ? <Text style={styles.resultText}>{resultMessage}</Text> : null}
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
  label: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    marginTop: 6
  },
  templateRow: {
    gap: theme.spacing.sm
  },
  templateButton: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.panel
  },
  templateButtonActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft
  },
  templateButtonText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body
  },
  templateButtonTextActive: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
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
  inputLarge: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: theme.colors.panel,
    fontFamily: theme.fonts.body,
    color: theme.colors.ink
  },
  generateButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42
  },
  generateButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.medium
  },
  proLockBox: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.paper,
    padding: theme.spacing.sm
  },
  proLockText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body
  },
  paywallButton: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    alignItems: 'center'
  },
  paywallButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.medium
  },
  resultText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.slate,
    fontFamily: theme.fonts.body
  }
});
