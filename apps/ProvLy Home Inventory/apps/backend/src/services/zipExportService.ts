import archiver from 'archiver';
import { createUserClient } from '../utils/supabase.js';
import { fetchItemsForExport, generatePDF, generateCSV } from './exportService.js';
import { PassThrough } from 'stream';

interface ZipExportResult {
    jobId: string;
    zipPath: string;
}

const MAX_ZIP_EXPORT_MS = 120000; // 2 minutes timeout
// Note: Hard strict max size is difficult to enforce during streaming without buffering 
// or counting bytes on the fly and destroying the stream, but we can check total file size beforehand as a heuristic.
const MAX_TOTAL_SIZE_BYTES = 250 * 1024 * 1024; // 250MB heuristic
const uploadsBucket = process.env.SUPABASE_UPLOADS_BUCKET || 'uploads';
const exportsBucket = process.env.SUPABASE_EXPORTS_BUCKET || 'exports';

export async function createZipExportJob(
    userId: string,
    accessToken: string,
    homeId: string,
    homeName: string
): Promise<ZipExportResult> {
    const supabase = createUserClient(accessToken);

    // 1. Create Create Job Record
    const { data: job, error: jobError } = await supabase
        .from('export_jobs')
        .insert({
            user_id: userId,
            home_id: homeId,
            status: 'processing',
            format: 'zip',
        })
        .select()
        .single();

    if (jobError || !job) {
        throw new Error('Failed to create export job');
    }

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Export timed out')), MAX_ZIP_EXPORT_MS)
    );

    const exportPromise = (async () => {
        try {
            // 2. Fetch Data
            const items = await fetchItemsForExport(supabase, homeId);

            // 3. Generate Reports
            const pdfBuffer = await generatePDF(supabase, items, homeName);
            const csvBuffer = generateCSV(items);

            // 4. Fetch User Documents Metadata
            const { data: documents } = await supabase
                .from('documents')
                .select(`
                    id, original_name, file_type, storage_path, doc_type,
                    items!inner(rooms!inner(home_id))
                `)
                .eq('items.rooms.home_id', homeId);

            // Size Heuristic Check
            const totalSizeEstimate = pdfBuffer.length + csvBuffer.length;

            if (totalSizeEstimate > MAX_TOTAL_SIZE_BYTES) {
                throw new Error(`Export exceeds size limit of ${MAX_TOTAL_SIZE_BYTES / 1024 / 1024}MB`);
            }

            // 5. Start ZIP Stream
            const archive = archiver('zip', { zlib: { level: 9 } });
            const passThrough = new PassThrough();

            const exportFolder = `${userId}/${job.id}`;
            const zipPath = `${exportFolder}/claim-pack.zip`;

            // Upload Stream - using duplex: 'half' for Node.js
            const uploadPromise = supabase.storage
                .from(exportsBucket)
                .upload(zipPath, passThrough as any, {
                    contentType: 'application/zip',
                    duplex: 'half'
                });

            // Pipe archive to passthrough
            archive.pipe(passThrough);

            // A. Add README
            archive.append(
                `ProvLy - Claim Pack Export
Generated: ${new Date().toLocaleString()}
Home: ${homeName}

Contents:
- claim-pack.pdf: Summary Inventory Report
- items.csv: Spreadsheet of all items
- manifest.json: Metadata and file tracking
- receipts/: Original receipt images
- photos/: Item photos
- documents/: Manuals, warranties, and other docs

Note: This export contains confidential personal data. Please store securely.
`,
                { name: 'README.txt' }
            );

            // B. Add Reports
            archive.append(pdfBuffer, { name: 'claim-pack.pdf' });
            archive.append(csvBuffer, { name: 'items.csv' });

            // C. Add Documents & Build Manifest
            const missingFiles: { id: string, name: string, path: string }[] = [];
            const includedFiles: { id: string, path: string }[] = [];

            if (documents && documents.length > 0) {
                for (const doc of documents) {
                    try {
                        // Download stream
                        const { data: fileBlob, error } = await supabase.storage
                            .from(uploadsBucket)
                            .download(doc.storage_path);

                        if (error || !fileBlob) {
                            console.warn(`Missing file in storage: ${doc.storage_path}`);
                            missingFiles.push({
                                id: doc.id,
                                name: doc.original_name || doc.id,
                                path: doc.storage_path
                            });
                            continue;
                        }

                        // Convert Blob to Buffer
                        const arrayBuffer = await fileBlob.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);

                        // Determine folder and sanitized name
                        const folder = doc.doc_type === 'receipt' ? 'receipts' :
                            doc.doc_type === 'photo' ? 'photos' : 'documents';

                        // Sanitize: lowercase, numbers, dots/dashes only
                        const safeName = (doc.original_name || `document_${doc.id}`).replace(/[^a-z0-9]/gi, '_');
                        const ext = doc.storage_path.split('.').pop() || 'bin';
                        const zipFileName = `${folder}/${doc.id}_${safeName}.${ext}`;

                        archive.append(buffer, { name: zipFileName });
                        includedFiles.push({ id: doc.id, path: zipFileName });

                    } catch (err) {
                        console.error(`Failed to process doc ${doc.id}`, err);
                        missingFiles.push({
                            id: doc.id,
                            name: doc.original_name || doc.id,
                            path: doc.storage_path
                        });
                    }
                }
            }

            // D. Add Manifest (Last)
            const manifest = {
                exportDate: new Date().toISOString(),
                homeName,
                totalItems: items.length,
                totalDocuments: documents?.length || 0,
                includedFilesCount: includedFiles.length,
                missingFiles,
                generatedBy: "ProvLy"
            };
            archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

            // Finalize
            await archive.finalize();

            // Wait for upload
            const { error: uploadError } = await uploadPromise;
            if (uploadError) throw uploadError;

            // 6. Update Job Success
            await supabase
                .from('export_jobs')
                .update({
                    status: 'completed',
                    storage_path: exportFolder,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                })
                .eq('id', job.id);

            return { jobId: job.id, zipPath };

        } catch (err) {
            console.error("ZIP Export Failed:", err);
            await supabase
                .from('export_jobs')
                .update({ status: 'failed', error_message: (err as Error).message })
                .eq('id', job.id);
            throw err;
        }
    })();

    // Race between export and timeout
    return Promise.race([exportPromise, timeoutPromise]) as Promise<ZipExportResult>;
}
