async function check() {
    const url = 'https://nexusbuild-backend-worker.northernstep.workers.dev/api/auth/google/redirect_url?platform=mobile';
    console.log(`Checking ${url}...`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const body = await res.text();
        console.log(`Body: ${body.slice(0, 1) === '{' ? JSON.stringify(JSON.parse(body), null, 2) : body}`);
    } catch (e) {
        console.error(e);
    }
}
check();
