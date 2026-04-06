/**
 * Bug Reports Storage Service
 * Persists bug reports locally using AsyncStorage
 * Works even when backend is unavailable
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'nexusbuild_bug_reports';

const fetchWithTimeout = async (url, options, timeoutMs = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(id);
    }
};

// Get all bug reports
export const getBugReports = async () => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading bug reports:', error);
        return [];
    }
};

// Add a new bug report
export const addBugReport = async (report) => {
    try {
        const existing = await getBugReports();
        const newReport = {
            id: Date.now(),
            ...report,
            status: 'pending',
            priority: report.priority || 'medium',
            created_at: new Date().toISOString(),
            admin_notes: '',
            synced: report.synced !== undefined ? report.synced : false, // Track if synced to server
        };
        const updated = [newReport, ...existing];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newReport;
    } catch (error) {
        console.error('Error saving bug report:', error);
        return null;
    }
};

// Update a bug report
export const updateBugReport = async (id, updates) => {
    try {
        const reports = await getBugReports();
        const index = reports.findIndex(r => r.id === id);
        if (index !== -1) {
            reports[index] = { ...reports[index], ...updates };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
            return reports[index];
        }
        return null;
    } catch (error) {
        console.error('Error updating bug report:', error);
        return null;
    }
};

// Delete a bug report
export const deleteBugReport = async (id) => {
    try {
        const reports = await getBugReports();
        const updated = reports.filter(r => r.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return true;
    } catch (error) {
        console.error('Error deleting bug report:', error);
        return false;
    }
};

// Get pending (unsynced) reports
export const getPendingReports = async () => {
    try {
        const reports = await getBugReports();
        return reports.filter(r => r.synced !== true);
    } catch (error) {
        console.error('Error getting pending reports:', error);
        return [];
    }
};

// Mark a report as synced
export const markAsSynced = async (id) => {
    return updateBugReport(id, { synced: true, syncedAt: new Date().toISOString() });
};

// Sync pending reports to server
export const syncPendingReports = async (apiBaseUrl) => {
    try {
        const pending = await getPendingReports();

        // Defensive check - ensure we have an array
        if (!Array.isArray(pending)) {
            console.error('getPendingReports returned non-array:', pending);
            return { synced: 0, failed: 0, total: 0, error: 'Invalid data' };
        }

        if (pending.length === 0) {
            return { synced: 0, failed: 0, total: 0 };
        }

        let synced = 0;
        let failed = 0;

        for (const report of pending) {
            try {
                const formData = new FormData();
                formData.append('description', report.description);
                if (report.category) formData.append('category', report.category);
                if (report.email) formData.append('email', report.email);
                formData.append('priority', report.priority || 'medium');
                if (report.platform) formData.append('platform', report.platform);
                if (report.system_info) formData.append('system_info', report.system_info);

                // Append images if they exist
                if (report.screenshots && Array.isArray(report.screenshots)) {
                    report.screenshots.forEach((uri, index) => {
                        const filename = uri.split('/').pop() || `screenshot_${index}.jpg`;
                        const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
                        const mimeType = `image/${extension === 'png' ? 'png' : 'jpeg'}`;

                        formData.append('image', {
                            uri: uri,
                            name: filename,
                            type: mimeType,
                        });
                    });
                }

                const token = await AsyncStorage.getItem('authToken');
                const response = await fetchWithTimeout(`${apiBaseUrl}/reports`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                });

                if (response.ok) {
                    await markAsSynced(report.id);
                    synced++;
                } else {
                    console.log('Sync failed for report:', report.id, 'Status:', response.status);
                    failed++;
                }
            } catch (error) {
                console.log('Failed to sync report:', report.id, error.message);
                failed++;
            }
        }

        return { synced, failed, total: pending.length };
    } catch (error) {
        console.error('syncPendingReports error:', error);
        return { synced: 0, failed: 0, total: 0, error: error.message };
    }
};

export default {
    getBugReports,
    addBugReport,
    updateBugReport,
    deleteBugReport,
    getPendingReports,
    markAsSynced,
    syncPendingReports,
};
