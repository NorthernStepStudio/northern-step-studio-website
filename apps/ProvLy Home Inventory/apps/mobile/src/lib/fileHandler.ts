import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { exportAPI } from './exportAPI';

export const fileHandler = {
    /**
     * Polls for job completion, downloads the file(s), and triggers the share sheet.
     */
    downloadAndShare: async (jobId: string, onStatusChange?: (status: string) => void): Promise<void> => {
        // 1. Poll for completion
        let attempts = 0;
        const maxAttempts = 20; // 40 seconds max (2s interval)

        while (attempts < maxAttempts) {
            onStatusChange?.('Processing...');
            const jobs = await exportAPI.getExportJobs();
            const job = jobs.find((j: any) => j.id === jobId);

            if (job) {
                if (job.status === 'completed') {
                    onStatusChange?.('Downloading...');
                    break;
                } else if (job.status === 'failed') {
                    throw new Error('Export job failed on server.');
                }
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
        }

        if (attempts >= maxAttempts) {
            throw new Error('Export timed out. Please check back later.');
        }

        // 2. Get Download Links
        const links = await exportAPI.getDownloadLinks(jobId);
        if (links.length === 0) throw new Error('No files found to download.');

        // 3. Download and Share
        // For now, we handle the first file (ZIP) or iterate.
        // If multiple files (CSV+PDF), we might need to share them sequentially or zip them.
        // Recommending 'zip' format for mobile export.

        for (const link of links) {
            // Sanitize filename and create file reference using new API
            const sanitizedName = link.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const file = new File(Paths.document, sanitizedName);

            // Download file from URL
            const response = await fetch(link.url);
            if (!response.ok) {
                throw new Error(`Failed to download ${link.name}`);
            }

            // Write the downloaded content to the file
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            await file.write(new Uint8Array(arrayBuffer));

            if (!(await Sharing.isAvailableAsync())) {
                throw new Error('Sharing is not available on this device');
            }

            onStatusChange?.(`Sharing ${link.name}...`);
            await Sharing.shareAsync(file.uri);
        }
    }
};
