import { supabase } from '../lib/supabase';

export const syncClient = {
    async pushBatches(rows: any[]) {
        // Upsert batch
        const { data, error } = await supabase
            .from('provly_sync_items')
            .upsert(rows);

        if (error) throw error;
        return data;
    },

    async fetchChanges(since: string) {
        const objectSince = since || '1970-01-01T00:00:00.000Z';
        const { data, error } = await supabase
            .from('provly_sync_items')
            .select('*')
            .gt('updated_at', objectSince);

        if (error) throw error;
        return data;
    },

    async uploadFile(bucket: string, path: string, formData: FormData) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, formData, { upsert: true });

        if (error) throw error;
        return data;
    },

    async downloadFile(bucket: string, path: string) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .download(path);

        if (error) throw error;
        return data;
    }
};
