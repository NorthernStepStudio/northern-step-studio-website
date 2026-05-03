async function check() {
    const urls = [
        'https://nexusbuild-backend-worker.northernstep.workers.dev/api/health',
        'https://nexusbuild-backend-worker.northernstep.workers.dev/health',
        'https://nexusbuild-backend-worker.northernstep.workers.dev/'
    ];
    for (const url of urls) {
        console.log(`Checking ${url}...`);
        try {
            const res = await fetch(url);
            console.log(`Status: ${res.status}`);
            const body = await res.text();
            console.log(`Body: ${body.slice(0, 100)}`);
        } catch (e) {
            console.log(e);
        }
    }
}
check();
