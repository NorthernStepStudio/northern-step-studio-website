const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { describe, it } = require('node:test');

describe('NexusBuild Admin and Diagnostics Verification', () => {
    describe('Web Admin Redirect', () => {
        const appPath = path.resolve(__dirname, '../apps/web/src/App.jsx');
        const embeddedAppPath = path.resolve(__dirname, '../apps/web/src/NexusBuildApp.jsx');
        const redirectPath = path.resolve(__dirname, '../apps/web/src/pages/AdminRedirect.jsx');
        const homePath = path.resolve(__dirname, '../apps/web/src/pages/Home.jsx');

        it('should route web admin pages through AdminRedirect', () => {
            const content = fs.readFileSync(appPath, 'utf8');
            assert.ok(content.includes("const AdminRedirect = lazy(() => import('./pages/AdminRedirect'));"), 'App missing AdminRedirect import');
            assert.ok(content.includes('path="/admin" element={<AdminRedirect'), 'Admin route not redirected');
            assert.ok(content.includes('path="/admin/reports" element={<AdminRedirect'), 'Admin reports route not redirected');
            assert.ok(content.includes('path="/testers" element={<TesterSignup'), 'Tester signup route missing');
            assert.ok(content.includes('path="/demo/:slug" element={<DemoPage'), 'Demo route missing');
            assert.ok(content.includes('path="/admin/testers" element={<TesterManager'), 'Tester manager route missing');
        });

        it('should route embedded admin pages through AdminRedirect', () => {
            const content = fs.readFileSync(embeddedAppPath, 'utf8');
            assert.ok(content.includes("const AdminRedirect = lazy(() => import('./pages/AdminRedirect'));"), 'Embedded app missing AdminRedirect import');
            assert.ok(content.includes('path="/admin" element={<AdminRedirect'), 'Embedded admin route not redirected');
            assert.ok(content.includes('path="/admin/reports" element={<AdminRedirect'), 'Embedded admin reports route not redirected');
            assert.ok(content.includes('path="/testers" element={<TesterSignup'), 'Embedded tester signup route missing');
            assert.ok(content.includes('path="/demo/:slug" element={<DemoPage'), 'Embedded demo route missing');
            assert.ok(content.includes('path="/admin/testers" element={<TesterManager'), 'Embedded tester manager route missing');
        });

        it('should target the NSS web admin URL', () => {
            const content = fs.readFileSync(redirectPath, 'utf8');
            assert.ok(content.includes('Migration Notice'), 'Redirect page missing migration notice');
            assert.ok(content.includes('northernstepstudio.com/apps/nexusbuild/app/admin'), 'Redirect target incorrect');
            assert.ok(content.includes('Open Web Admin'), 'Redirect CTA missing');
        });

        it('should point the tester CTA at the signup flow', () => {
            const content = fs.readFileSync(homePath, 'utf8');
            assert.ok(content.includes("to={base + 'testers?app=nexusbuild'}"), 'Tester CTA missing or incorrect');
        });
    });

    describe('Mobile Redirection Logic', () => {
        const screenPath = path.resolve(__dirname, '../apps/mobile/src/screens/AdminReportsScreen.jsx');

        it('should have migration notice in AdminReportsScreen.jsx', () => {
            const content = fs.readFileSync(screenPath, 'utf8');
            assert.ok(content.includes('Migration Notice'), 'Migration banner title missing');
        });

        it('should implement Linking to the NSS web admin in mobile', () => {
            const content = fs.readFileSync(screenPath, 'utf8');
            assert.ok(content.includes('Linking.openURL'), 'Linking logic missing');
            assert.ok(content.includes('getWebAdminConsoleUrl'), 'Web admin URL helper missing');
        });

        it('should have the OPEN WEB ADMIN button text', () => {
            const content = fs.readFileSync(screenPath, 'utf8');
            assert.ok(content.includes('OPEN WEB ADMIN'), 'Button text missing');
        });
    });

    describe('Bug Report Diagnostics', () => {
        const modalPath = path.resolve(__dirname, '../apps/mobile/src/components/BugReportModal.jsx');

        it('should attach runtime diagnostics to bug reports', () => {
            const content = fs.readFileSync(modalPath, 'utf8');
            assert.ok(content.includes('formatDiagnosticsClipboard'), 'Diagnostics formatter missing');
            assert.ok(content.includes('Build diagnostics'), 'Diagnostics payload label missing');
            assert.ok(content.includes('Build diagnostics will be attached automatically'), 'User-facing diagnostics note missing');
        });
    });
});
