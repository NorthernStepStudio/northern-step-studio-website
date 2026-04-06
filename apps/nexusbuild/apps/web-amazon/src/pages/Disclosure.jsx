import React from 'react';
import LegalLayout from '../components/LegalLayout';

export default function Disclosure() {
    return (
        <LegalLayout title="Affiliate Disclosure" lastUpdated="October 26, 2023">
            <section style={{ marginBottom: '2rem' }}>
                <p>NexusBuild participates in various affiliate marketing programs, which means we may get paid commissions on editorially chosen products purchased through our links to retailer sites.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3>How it Works</h3>
                <p>When you click on a link to a product on NexusBuild and make a purchase, we may receive a small commission. This helps support our platform and allows us to continue providing free tools and services to our community. This comes at no extra cost to you.</p>
            </section>
        </LegalLayout>
    );
}
