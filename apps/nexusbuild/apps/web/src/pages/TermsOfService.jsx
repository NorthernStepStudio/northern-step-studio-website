import React from 'react';
import LegalLayout from '../components/LegalLayout';

export default function TermsOfService() {
    return (
        <LegalLayout title="Terms of Service" lastUpdated="October 26, 2023">
            <section style={{ marginBottom: '2rem' }}>
                <h3>1. Agreement to Terms</h3>
                <p>These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and NexusBuild, concerning your access to and use of the NexusBuild website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3>2. Intellectual Property Rights</h3>
                <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3>3. User Representations</h3>
                <p>By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.</p>
            </section>
        </LegalLayout>
    );
}
