import React from 'react';
import LegalLayout from '../components/LegalLayout';

export default function About() {
    return (
        <LegalLayout title="About NexusBuild">
            <p className="lead" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                NexusBuild is your ultimate companion for PC building, offering
                intelligent recommendations, compatibility checks, and a seamless
                building experience.
            </p>

            <section style={{ marginBottom: '2rem' }}>
                <h3>Our Mission</h3>
                <p>
                    We aim to demystify the process of building a computer. Whether
                    you are a seasoned enthusiast or a first-time builder, NexusBuild
                    provides the tools and data you need to build with confidence.
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3>Why Choose Us?</h3>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                    <li>
                        <strong>Compatibility First:</strong> Our engine checks
                        thousands of parts to ensure they play nicely together.
                    </li>
                    <li>
                        <strong>Curated Pricing:</strong> We surface current catalog
                        pricing and featured deals so you can buy with context.
                    </li>
                    <li>
                        <strong>Community &amp; Sharing:</strong> Share your builds and
                        get feedback from our growing community.
                    </li>
                </ul>
            </section>
        </LegalLayout>
    );
}
