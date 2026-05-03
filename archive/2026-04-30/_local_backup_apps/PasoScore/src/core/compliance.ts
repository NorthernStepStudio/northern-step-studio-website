import { LocaleCode } from './types';
import { t } from './i18n';

export interface ComplianceGuardrail {
  title: string;
  bullets: string[];
}

export const getComplianceGuardrail = (locale: LocaleCode): ComplianceGuardrail => {
  return {
    title: t(locale, 'disclaimer.general'),
    bullets: [
      t(locale, 'compliance.b0'),
      t(locale, 'compliance.b1'),
      t(locale, 'compliance.b2'),
      t(locale, 'compliance.b3'),
      t(locale, 'compliance.b4'),
      t(locale, 'compliance.b5')
    ]
  };
};
