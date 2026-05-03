import { supabase } from './supabase';

export interface ExportJob {
    jobId: string;
    message: string;
}

// Helper to safely parse JSON response
async function safeJsonParse(response: Response): Promise<any> {
    const text = await response.text();
    if (!text || text.trim() === '') {
        throw new Error('Empty response from server');
    }
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`Server returned invalid response: ${text.substring(0, 100)}`);
    }
}

export const exportAPI = {
    triggerExport: async (homeId: string, format: 'zip' | 'full' = 'full'): Promise<ExportJob> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
            throw new Error('Backend URL not configured. Export is not available.');
        }

        const response = await fetch(`${backendUrl}/v1/exports/trigger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                homeId,
                format,
            }),
        });

        const data = await safeJsonParse(response);

        if (!response.ok) {
            throw new Error(data.error || 'Failed to trigger export');
        }

        return data;
    },

    getExportJobs: async (): Promise<any[]> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
            throw new Error('Backend URL not configured');
        }

        const response = await fetch(`${backendUrl}/v1/exports/jobs`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        });

        if (!response.ok) throw new Error('Failed to fetch jobs');
        return safeJsonParse(response);
    },

    getDownloadLinks: async (jobId: string): Promise<{ name: string, url: string }[]> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
            throw new Error('Backend URL not configured');
        }

        const response = await fetch(`${backendUrl}/v1/exports/${jobId}/download`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        });

        const data = await safeJsonParse(response);

        if (!response.ok) {
            throw new Error(data.error || 'Failed to get download links');
        }

        return data.downloadLinks;
    }
};
