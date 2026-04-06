import React, { useState } from 'react';
import LegalLayout from '../components/LegalLayout';

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <LegalLayout title="Contact Us">
            <p style={{ marginBottom: '2rem' }}>Have a question or feedback? We'd love to hear from you. Fill out the form below or email us at support@nexusbuild.app.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
                <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #444', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                />
                <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #444', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                />
                <textarea
                    placeholder="Your Message"
                    rows="5"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #444', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                />
                <button type="submit" style={{ padding: '1rem', borderRadius: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                    Send Message
                </button>
            </form>
        </LegalLayout>
    );
}
