import { useLocation } from 'react-router-dom'
import './Legal.css'

export default function Legal() {
    const location = useLocation()
    const path = location.pathname

    if (path === '/disclosure') {
        return (
            <div className="legal">
                <div className="container">
                    <h1>Affiliate Disclosure</h1>
                    <p className="last-updated">Last updated: December 2024</p>

                    <section>
                        <p>
                            NexusBuild is a participant in the Amazon Services LLC Associates Program,
                            an affiliate advertising program designed to provide a means for sites to
                            earn advertising fees by advertising and linking to Amazon.com.
                        </p>

                        <h2>How We Earn</h2>
                        <p>
                            When you click on product links on our site and make a purchase, we may
                            earn a small commission at no additional cost to you. This helps us maintain
                            and improve NexusBuild.
                        </p>

                        <h2>Our Commitment</h2>
                        <p>
                            Our recommendations are based on performance, compatibility, and value -
                            not on commission rates. We only recommend products we believe will
                            genuinely help you build a great PC.
                        </p>

                        <h2>Questions?</h2>
                        <p>
                            If you have any questions about our affiliate relationships, please
                            contact us at <a href="mailto:support@nexusbuild.app">support@nexusbuild.app</a>.
                        </p>
                    </section>
                </div>
            </div>
        )
    }

    if (path === '/terms') {
        return (
            <div className="legal">
                <div className="container">
                    <h1>Terms of Service</h1>
                    <p className="last-updated">Last updated: December 2024</p>

                    <section>
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using NexusBuild, you accept and agree to be bound by
                            these Terms of Service.
                        </p>

                        <h2>2. Use of Service</h2>
                        <p>
                            NexusBuild provides PC building recommendations and tools. Our service
                            is provided "as is" and we make no warranties regarding the accuracy
                            of recommendations.
                        </p>

                        <h2>3. User Responsibilities</h2>
                        <p>
                            You are responsible for verifying component compatibility before making
                            any purchases. NexusBuild is not liable for any damages resulting from
                            purchases made based on our recommendations.
                        </p>

                        <h2>4. Intellectual Property</h2>
                        <p>
                            All content on NexusBuild, including text, graphics, and code, is owned
                            by NexusBuild and protected by copyright laws.
                        </p>

                        <h2>5. Contact</h2>
                        <p>
                            For questions about these terms, contact us at{' '}
                            <a href="mailto:support@nexusbuild.app">support@nexusbuild.app</a>.
                        </p>
                    </section>
                </div>
            </div>
        )
    }

    // Default: Privacy Policy
    return (
        <div className="legal">
            <div className="container">
                <h1>Privacy Policy</h1>
                <p className="last-updated">Last updated: December 2024</p>

                <section>
                    <h2>Information We Collect</h2>
                    <p>
                        We collect information you provide directly, such as when you create
                        a build or contact us. We also collect usage data to improve our service.
                    </p>

                    <h2>How We Use Information</h2>
                    <p>We use your information to:</p>
                    <ul>
                        <li>Provide and improve our PC building tools</li>
                        <li>Personalize your experience</li>
                        <li>Respond to your inquiries</li>
                        <li>Send updates about our service (with your consent)</li>
                    </ul>

                    <h2>Data Sharing</h2>
                    <p>
                        We do not sell your personal information. We may share data with
                        service providers who help us operate NexusBuild.
                    </p>

                    <h2>Cookies</h2>
                    <p>
                        We use cookies to improve your experience and analyze site usage.
                        You can control cookies through your browser settings.
                    </p>

                    <h2>Contact</h2>
                    <p>
                        For privacy questions, contact us at{' '}
                        <a href="mailto:support@nexusbuild.app">support@nexusbuild.app</a>.
                    </p>
                </section>
            </div>
        </div>
    )
}
