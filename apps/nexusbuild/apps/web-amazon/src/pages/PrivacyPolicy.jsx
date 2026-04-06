import React from 'react';
import LegalLayout from '../components/LegalLayout';

export default function PrivacyPolicy() {
    return (
        <LegalLayout title="Privacy Policy" lastUpdated="October 26, 2023">
            <section style={{ marginBottom: '2rem' }}>
                <h3>1. Introduction</h3>
                <p>Welcome to NexusBuild ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3>2. Information We Collect</h3>
                <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.</p>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                    <li>Names</li>
                    <li>Email addresses</li>
                    <li>Passwords (encrypted)</li>
                    <li>Build configurations and preferences</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3>3. How We Use Your Information</h3>
                <p>We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
            </section>
        </LegalLayout>
    );
}
