import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { RenderedLetter } from '../core/types';

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('\n', '<br/>');

export const exportLetterPdf = async (
  letter: RenderedLetter
): Promise<{ uri: string; shared: boolean }> => {
  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: Georgia, serif;
          color: #1A1D2E;
          margin: 32px;
          line-height: 1.45;
        }
        h1 {
          font-size: 20px;
          margin-bottom: 16px;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #465168;
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(letter.title)}</h1>
      <div>${escapeHtml(letter.body)}</div>
      <div class="footer">${escapeHtml(letter.footer)}</div>
    </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html });
  let shared = false;

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share letter PDF'
    });
    shared = true;
  }

  return { uri, shared };
};
