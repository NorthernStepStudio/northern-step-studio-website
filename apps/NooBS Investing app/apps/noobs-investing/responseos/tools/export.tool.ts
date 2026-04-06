import * as FileSystem from 'expo-file-system';
import { createFileExportTools, type FileExportAdapter, type ToolContract } from '@nss/response-os';

const EXPORT_ID_PREFIX = 'noobs_export';

export function createNoobsExportTools(): ToolContract[] {
  const adapter: FileExportAdapter = {
    async exportCsv(request) {
      const rows = request.rows ?? [];
      const csv = toCsv(rows);
      const filename = sanitizeFilename(request.filename ?? `responseos-plan-${Date.now()}.csv`, 'csv');
      const uri = resolveExportUri(filename);
      await FileSystem.writeAsStringAsync(uri, csv);

      return {
        artifact: {
          id: `${EXPORT_ID_PREFIX}_csv_${Date.now()}`,
          type: 'csv',
          filename,
          mimeType: 'text/csv',
          uri,
        },
      };
    },

    async exportPdf(request) {
      const title = request.title ?? 'ResponseOS Plan';
      const sections = request.sections ?? [];
      const text = [title, ...sections.map((section) => `${section.heading}\n${section.content}`)].join('\n\n');
      const filename = sanitizeFilename(request.filename ?? `responseos-plan-${Date.now()}.pdf`, 'pdf');

      return {
        artifact: {
          id: `${EXPORT_ID_PREFIX}_pdf_${Date.now()}`,
          type: 'pdf',
          filename,
          mimeType: 'application/pdf',
          data: {
            title,
            sections,
            text,
          },
        },
      };
    },
  };

  return createFileExportTools(adapter);
}

function resolveExportUri(filename: string): string {
  const base = ((FileSystem as unknown as { cacheDirectory?: string }).cacheDirectory ??
    (FileSystem as unknown as { documentDirectory?: string }).documentDirectory) as string | undefined;

  if (!base) {
    throw new Error('File system directory is unavailable.');
  }
  return `${base}${filename}`;
}

function sanitizeFilename(filename: string, extension: 'csv' | 'pdf'): string {
  const cleaned = filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!cleaned) {
    return `responseos-export.${extension}`;
  }
  if (cleaned.toLowerCase().endsWith(`.${extension}`)) {
    return cleaned;
  }
  return `${cleaned}.${extension}`;
}

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) {
    return '';
  }

  const columns = Array.from(
    rows.reduce((set, row) => {
      for (const key of Object.keys(row)) {
        set.add(key);
      }
      return set;
    }, new Set<string>())
  );

  const header = columns.map(escapeCsv).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((column) => {
          const value = row[column];
          return escapeCsv(value === undefined || value === null ? '' : String(value));
        })
        .join(',')
    )
    .join('\n');

  return `${header}\n${body}`;
}

function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}
