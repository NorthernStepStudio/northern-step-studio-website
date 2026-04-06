import AsyncStorage from '@react-native-async-storage/async-storage';

async function debugReports() {
    const data = await AsyncStorage.getItem('nexusbuild_bug_reports');
    const reports = data ? JSON.parse(data) : [];

    console.log('=== DEBUG REPORT INFO ===');
    console.log('Total reports:', reports.length);

    reports.forEach((r, i) => {
        console.log(`\nReport ${i + 1}:`);
        console.log('  ID:', r.id);
        console.log('  Description:', r.description?.substring(0, 50) + '...');
        console.log('  Synced:', r.synced);
        console.log('  Platform:', r.platform);
        console.log('  Created:', r.created_at);
    });

    const unsynced = reports.filter(r => r.synced !== true);
    console.log('\n=== UNSYNCED COUNT:', unsynced.length, '===');
}

debugReports();
