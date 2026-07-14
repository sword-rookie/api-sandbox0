import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
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
                        Terms of Service
                    </h1>
                    <p className="text-on-surface-variant">Last Updated: July 14, 2026</p>
                </div>

                <div className="space-y-12 text-on-surface-variant text-lg leading-relaxed">
                    
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-on-surface">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the Clarity Machine platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service. Clarity Machine provides ephemeral backend sandboxes and infrastructure testing tools.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-on-surface">2. Provision of Service</h2>
                        <p>
                            Clarity Machine grants you a non-exclusive, non-transferable, revocable license to use the Service for the purpose of testing, staging, and deploying backend architectures. You agree not to use the sandboxes for cryptocurrency mining, malicious network scanning, or hosting illegal content.
                        </p>
                        <p>
                            We reserve the right to suspend or terminate sandboxes that violate these terms or consume excessive systemic resources beyond your tier's limits.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-on-surface">3. Data & Privacy</h2>
                        <p>
                            You retain all rights to the code, configurations, and data you upload to Clarity Machine. By uploading data, you grant us a temporary license to host, execute, and display it solely for the purpose of providing the Service.
                        </p>
                        <p>
                            All sandboxes are ephemeral. Clarity Machine is not responsible for data loss. You are expected to maintain independent backups of your primary databases.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-on-surface">4. Uptime & Availability</h2>
                        <p>
                            While we strive for 99.9% uptime, the Service is provided "as is" and "as available." Ephemeral environments are subject to automatic hibernation based on inactivity. Clarity Machine makes no warranties regarding the absolute uninterrupted availability of testing nodes.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-on-surface">5. Limitation of Liability</h2>
                        <p>
                            In no event shall Clarity Machine be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
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
