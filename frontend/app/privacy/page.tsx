import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="bg-background text-on-surface min-h-screen font-sans selection:bg-primary-container/30">
            {/* Simple Header */}
            <header className="w-full z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant">
                <div className="flex justify-between items-center px-4 md:px-10 py-4 max-w-[1440px] mx-auto">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="material-symbols-outlined text-primary-fixed-dim text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
                        <span className="text-xl font-bold text-primary tracking-tighter">Clarity Machine</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <div className="mb-12">
                    <span className="text-xs font-bold text-primary bg-primary-container/10 px-4 py-1 rounded-full border border-primary/20 mb-6 tracking-widest uppercase inline-block">
                        Legal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-on-surface mb-6 tracking-tighter">
                        Privacy Policy
                    </h1>
                    <p className="text-on-surface-variant">Last Updated: July 14, 2026</p>
                </div>

                <div className="space-y-12 text-on-surface-variant text-lg leading-relaxed">
                    
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-on-surface">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us when you create an account, build sandboxes, or communicate with us. This includes your name, email address, GitHub/Google OAuth profiles (if linked), and billing information.
                        </p>
                        <p>
                            We also automatically collect telemetry data regarding your sandbox usage, deployment logs, and system performance metrics to ensure infrastructure stability.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-on-surface">2. How We Use Your Data</h2>
                        <p>
                            Your data is used strictly to provide, maintain, and improve the Clarity Machine platform. We use telemetry data to auto-scale infrastructure and identify performance bottlenecks. We do not train external machine learning models on your proprietary sandbox code.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-on-surface">3. Infrastructure Security & Isolation</h2>
                        <p>
                            Clarity Machine employs strict gVisor container isolation. Data within your testing sandboxes is cryptographically separated from other tenants. We utilize at-rest encryption (AES-256) for all persistent volumes and TLS 1.3 for data in transit.
                        </p>
                        <p>
                            When a sandbox is destroyed, all associated data is permanently scrubbed from our active nodes.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-on-surface">4. Third-Party Integrations</h2>
                        <p>
                            If you connect your GitHub account, we request only the permissions necessary to clone repositories and trigger webhook deployments. We do not share your codebase with third-party advertising or analytics networks.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-on-surface">5. Your Rights</h2>
                        <p>
                            You have the right to request access to, correction of, or deletion of your personal data. You can completely wipe your account and all associated sandbox history via the "Danger Zone" in your Account Settings.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-on-surface">6. Contact Us</h2>
                        <p>
                            If you have questions about this Privacy Policy or our security practices, please contact our security team at security@claritymachine.dev.
                        </p>
                    </section>

                </div>
            </main>
            
            {/* Simple Footer */}
            <footer className="w-full py-8 bg-surface-container-lowest border-t border-outline-variant mt-12">
                <div className="text-center">
                    <p className="text-xs font-bold text-outline opacity-50 uppercase tracking-widest">
                        © 2026 Clarity Machine
                    </p>
                </div>
            </footer>
        </div>
    );
}
