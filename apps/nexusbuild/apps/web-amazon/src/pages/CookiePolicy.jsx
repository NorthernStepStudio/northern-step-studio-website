import React from 'react';
import LegalLayout from '../components/LegalLayout';

export default function CookiePolicy() {
    return (
        <LegalLayout title="Cookie Policy" lastUpdated="October 26, 2023">
            <section style={{ marginBottom: '2rem' }}>
                <h3>What are cookies?</h3>
                <p>Cookies are simple text files that are stored on your computer or mobile device by a website's server. Each cookie is unique to your web browser. It will contain some anonymous information such as a unique identifier, website's domain name, and some digits and numbers.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3>How do we use cookies?</h3>
                <p>We use cookies to improve your experience on our website, including:</p>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                    <li>Keeping you signed in</li>
                    <li>Understanding how you use our website</li>
                    <li>Saving your build preferences</li>
                </ul>
            </section>
        </LegalLayout>
    );
}
