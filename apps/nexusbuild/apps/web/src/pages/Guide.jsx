import React from 'react';
import LegalLayout from '../components/LegalLayout';

export default function Guide() {
    return (
        <LegalLayout title="How to Pick Your PC Parts">
            <section style={{ marginBottom: '2rem' }}>
                <h3>1. Introduction to PC Building</h3>
                <p>Building your own PC is a rewarding experience that gives you full control over your system's performance and aesthetics. Ensure you have a clear budget and use case (gaming, productivity, streaming) before you start.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3>2. Core Components</h3>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <li><strong>CPU (Central Processing Unit):</strong> The brain of the computer. Choose Intel or AMD based on your needs.</li>
                    <li><strong>GPU (Graphics Processing Unit):</strong> Essential for gaming and 3D rendering. Usually the most expensive part.</li>
                    <li><strong>Motherboard:</strong> Connects everything together. Ensure socket compatibility with your CPU.</li>
                    <li><strong>RAM (Memory):</strong> Short-term memory. 16GB is the standard for gaming, 32GB+ for productivity.</li>
                    <li><strong>Storage (SSD/HDD):</strong> Where your data lives. NVMe SSDs are the fastest option today.</li>
                    <li><strong>PSU (Power Supply Unit):</strong> Powers your rigorous rig. Never cheap out on this!</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3>3. Using NexusBuild</h3>
                <p>Go to the <strong>Pick Your Own PC</strong> page to start selecting parts. Our system automatically filters for compatibility, so you don't have to worry about buying incompatible parts.</p>
            </section>
        </LegalLayout>
    );
}
