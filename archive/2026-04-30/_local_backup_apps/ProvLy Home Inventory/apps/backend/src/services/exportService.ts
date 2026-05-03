import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import { SupabaseClient } from '@supabase/supabase-js';
import { createUserClient } from '../utils/supabase.js';

interface ItemForExport {
    id: string;
    name: string;
    category: string | null;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    purchase_date: string | null;
    purchase_price: number | null;
    room_name: string;
    photo_path: string | null;
}

interface ExportResult {
    pdfBuffer: Buffer;
    csvBuffer: Buffer;
}

interface ExportJobContext {
    id: string;
    status: string;
    storage_path: string | null;
    created_at: string | null;
    expires_at: string | null;
    format: string | null;
}

const uploadsBucket = process.env.SUPABASE_UPLOADS_BUCKET || 'uploads';
const exportsBucket = process.env.SUPABASE_EXPORTS_BUCKET || 'exports';

export async function generatePDF(
    supabase: SupabaseClient,
    items: ItemForExport[],
    homeName: string
): Promise<Buffer> {
    // 1. Pre-fetch images to simple buffers
    const itemsWithImages = await Promise.all(items.map(async (item) => {
        let imageBuffer: Buffer | null = null;
        if (item.photo_path) {
            try {
                const { data, error } = await supabase.storage
                    .from(uploadsBucket)
                    .download(item.photo_path);

                if (data && !error) {
                    const arrayBuffer = await data.arrayBuffer();
                    imageBuffer = Buffer.from(arrayBuffer);
                }
            } catch (e) {
                console.error(`Failed to download image for item ${item.id}`, e);
            }
        }
        return { ...item, imageBuffer };
    }));

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const doc = new PDFDocument({ margin: 50 });

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(24).text('HomeVault AI', { align: 'center' });
        doc.fontSize(16).text('Inventory Summary', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Home: ${homeName}`);
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`);
        doc.moveDown(2);

        // Calculate total value
        const totalValue = items.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
        doc.fontSize(12).text(`Total Items: ${items.length}`);
        doc.text(`Total Estimated Value: $${totalValue.toLocaleString()}`);
        doc.moveDown(2);

        // Items table header
        doc.fontSize(10).font('Helvetica-Bold');
        const startY = doc.y;

        // Layout: [Photo (40px)] [Item (100px)] [Room (70px)] [Brand (70px)] [Value (60px)]
        const colX = { photo: 50, name: 110, room: 230, brand: 310, value: 400 };

        doc.text('Photo', colX.photo, startY, { width: 50 });
        doc.text('Item', colX.name, startY, { width: 110 });
        doc.text('Room', colX.room, startY, { width: 70 });
        doc.text('Brand', colX.brand, startY, { width: 80 });
        doc.text('Value', colX.value, startY, { width: 70 });

        doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.moveDown();
        doc.moveDown(); // Space for line

        // Items
        doc.font('Helvetica');

        for (const item of itemsWithImages) {
            const rowHeight = 50; // Fixed height for consistency with thumbnails

            // Page Break Check
            if (doc.y + rowHeight > 730) {
                doc.addPage();
            }

            const y = doc.y;

            // 1. Draw Photo
            if (item.imageBuffer) {
                try {
                    doc.image(item.imageBuffer, colX.photo, y, {
                        fit: [40, 40],
                        align: 'center',
                        valign: 'center'
                    });
                } catch (e) {
                    // Fallback if image invalid
                    doc.text('[Img Err]', colX.photo, y + 15, { width: 40, align: 'center' });
                }
            } else {
                doc.text('-', colX.photo, y + 15, { width: 40, align: 'center' });
            }

            // 2. Draw Text (Vertically centered roughly)
            const textY = y + 15;
            doc.text(item.name.substring(0, 30), colX.name, textY, { width: 110 });
            doc.text(item.room_name.substring(0, 15), colX.room, textY, { width: 70 });
            doc.text((item.brand || '-').substring(0, 15), colX.brand, textY, { width: 80 });
            doc.text(item.purchase_price ? `$${item.purchase_price}` : '-', colX.value, textY, { width: 70 });

            // Move cursor
            doc.y = y + rowHeight;

            // Thin divider line
            doc.save();
            doc.strokeColor('#eeeeee');
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.restore();
            doc.moveDown(0.5);
        }

        doc.end();
    });
}

// Generate CSV export
export function generateCSV(items: ItemForExport[]): Buffer {
    const fields = [
        { label: 'Item Name', value: 'name' },
        { label: 'Room', value: 'room_name' },
        { label: 'Category', value: 'category' },
        { label: 'Brand', value: 'brand' },
        { label: 'Model', value: 'model' },
        { label: 'Serial Number', value: 'serial_number' },
        { label: 'Purchase Date', value: 'purchase_date' },
        { label: 'Purchase Price', value: 'purchase_price' },
        { label: 'Photo Path', value: 'photo_path' }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(items);
    return Buffer.from(csv, 'utf-8');
}

// Fetch items for a home with room names
export async function fetchItemsForExport(
    supabase: SupabaseClient,
    homeId: string
): Promise<ItemForExport[]> {
    const { data, error } = await supabase
        .from('items')
        .select(`
      id, name, category, brand, model, serial_number, purchase_date, purchase_price,
      rooms!inner(name, home_id),
      documents(doc_type, storage_path)
    `)
        .eq('rooms.home_id', homeId);

    if (error) {
        throw new Error(`Failed to fetch items: ${error.message}`);
    }

    return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        brand: item.brand,
        model: item.model,
        serial_number: item.serial_number,
        purchase_date: item.purchase_date,
        purchase_price: item.purchase_price,
        room_name: item.rooms.name,
        photo_path:
            item.documents?.find((doc: { doc_type?: string | null }) => doc.doc_type === 'photo')
                ?.storage_path || null,
    }));
}

// Create export job and generate files
export async function createExportJob(
    userId: string,
    accessToken: string,
    homeId: string,
    homeName: string
): Promise<{ jobId: string; pdfPath: string; csvPath: string; job: ExportJobContext }> {
    const supabase = createUserClient(accessToken);

    // Create job record
    const { data: job, error: jobError } = await supabase
        .from('export_jobs')
        .insert({
            user_id: userId,
            home_id: homeId,
            status: 'processing',
            format: 'full',
        })
        .select()
        .single();

    if (jobError || !job) {
        throw new Error('Failed to create export job');
    }

    try {
        const items = await fetchItemsForExport(supabase, homeId);
        const pdfBuffer = await generatePDF(supabase, items, homeName);
        const csvBuffer = generateCSV(items);

        const timestamp = Date.now();
        const exportFolder = `${userId}/${job.id}`;
        const pdfPath = `${exportFolder}/inventory_${timestamp}.pdf`;
        const csvPath = `${exportFolder}/inventory_${timestamp}.csv`;

        // Upload to storage
        const { error: pdfUploadError } = await supabase.storage.from(exportsBucket).upload(pdfPath, pdfBuffer, {
            contentType: 'application/pdf',
        });
        if (pdfUploadError) {
            throw new Error(`Failed to upload PDF export: ${pdfUploadError.message}`);
        }

        const { error: csvUploadError } = await supabase.storage.from(exportsBucket).upload(csvPath, csvBuffer, {
            contentType: 'text/csv',
        });
        if (csvUploadError) {
            throw new Error(`Failed to upload CSV export: ${csvUploadError.message}`);
        }

        // Update job status
        await supabase
            .from('export_jobs')
            .update({
                status: 'completed',
                storage_path: exportFolder,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            })
            .eq('id', job.id);

        // Log audit
        // Audit logging remains best-effort until service-role credentials are aligned.

        const { data: finalJob } = await supabase
            .from('export_jobs')
            .select('id, status, storage_path, created_at, expires_at, format')
            .eq('id', job.id)
            .single();

        return {
            jobId: job.id,
            pdfPath,
            csvPath,
            job: finalJob || {
                id: job.id,
                status: 'completed',
                storage_path: exportFolder,
                created_at: job.created_at,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                format: job.format,
            },
        };
    } catch (err) {
        await supabase
            .from('export_jobs')
            .update({ status: 'failed' })
            .eq('id', job.id);
        throw err;
    }
}

export async function generateClaimReport(
    userId: string,
    accessToken: string,
    homeId: string,
    homeName: string
): Promise<{ jobId: string; pdfPath: string; csvPath: string; job: ExportJobContext }> {
    return createExportJob(userId, accessToken, homeId, homeName);
}
