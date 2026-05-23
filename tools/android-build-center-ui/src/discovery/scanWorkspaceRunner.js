const path = require('path');

try {
    const scan = require('./scanWorkspace');

    // Logger writes progress objects to stderr with a prefix, so parent can stream them.
    const logger = (evt) => {
        try {
            process.stderr.write('SCAN_PROGRESS:' + JSON.stringify(evt) + '\n');
        } catch (e) {
            // ignore
        }
    };

    // Redirect console outputs to stderr as structured progress to avoid stdout pollution
    const origConsoleLog = console.log;
    const origConsoleError = console.error;
    console.log = (...args) => { logger({ type: 'log', message: args.join(' ') }); };
    console.info = (...args) => { logger({ type: 'info', message: args.join(' ') }); };
    console.error = (...args) => { logger({ type: 'error', message: args.join(' ') }); };

    const start = Date.now();
    // Accept optional --full flag to force a full workspace traversal
    const args = process.argv.slice(2) || [];
    const full = args.includes('--full');
    const result = scan(logger, { full });
    const durationMs = Date.now() - start;
    process.stdout.write(JSON.stringify({ ok: true, apps: result.discovered || [], count: (result.discovered||[]).length, durationMs, errors: [] }));
    process.exit(0);
} catch (err) {
    // Keep errors on stderr so the parent can capture diagnostics
    try { process.stderr.write('SCAN_PROGRESS:' + JSON.stringify({ type: 'scan-failed', message: String(err && err.message ? err.message : err) }) + '\n'); } catch(e){}
    process.stdout.write(JSON.stringify({ ok: false, apps: [], count: 0, durationMs: 0, errors: [String(err && err.message ? err.message : err)] }));
    process.exit(1);
}
