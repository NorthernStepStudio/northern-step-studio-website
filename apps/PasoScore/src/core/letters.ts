import { t } from './i18n';
import { LetterInput, RenderedLetter } from './types';

const templates = {
  goodwill_request: {
    titleKey: 'letters.goodwill',
    introKey: 'letters.intro.goodwill'
  },
  debt_validation_request: {
    titleKey: 'letters.validation',
    introKey: 'letters.intro.validation'
  },
  hardship_plan_request: {
    titleKey: 'letters.hardship',
    introKey: 'letters.intro.hardship'
  }
} as const;

export const renderLetter = (input: LetterInput): RenderedLetter => {
  const now = input.dateIso ?? new Date().toISOString().slice(0, 10);
  const template = templates[input.template];

  const title = t(input.locale, template.titleKey);
  const body = [
    `${now}`,
    '',
    input.senderName,
    input.senderAddress,
    '',
    input.recipientName,
    input.recipientAddress,
    '',
    `Re: ${input.accountReference}`,
    '',
    t(input.locale, template.introKey),
    '',
    input.explanation,
    '',
    t(input.locale, 'letters.responseRequest'),
    '',
    'Sincerely,',
    input.senderName
  ].join('\n');

  return {
    title,
    body,
    footer: t(input.locale, 'letters.footer')
  };
};
