'use client'

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        
        try {
            const res = await fetch('http://localhost:8081/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setStatus('success');
                setMessage(data.message || 'If an account exists, a reset link has been sent.');
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to send reset link');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    }

    return (
        <main className="min-h-screen bg-surface flex relative overflow-hidden">
            {/* Left Side - Animated Canvas (Optional: can reuse the same canvas component) */}
            <div className="hidden lg:flex w-1/2 relative bg-surface-dim items-center justify-center border-r border-outline-variant/20 z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed-dim/10 to-transparent z-0"></div>
                <div className="z-10 text-center space-y-6 max-w-lg px-8">
                    <h1 className="text-5xl font-bold text-on-surface tracking-tight leading-tight">
                        Account <span className="text-primary-fixed">Recovery</span>
                    </h1>
                    <p className="text-on-surface-variant text-lg">
                        Regain access to your Clarity Machine workspace.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-20">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-on-surface tracking-tight">Forgot Password</h2>
                        <p className="text-on-surface-variant text-sm">
                            Enter your email address to receive a password reset link.
                        </p>
                    </div>

                    <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        {status === 'success' ? (
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-primary-fixed-dim/20 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-primary-fixed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-on-surface">Check your email</h3>
                                <p className="text-on-surface-variant text-sm">{message}</p>
                                <div className="pt-4">
                                    <Link href="/login" className="text-primary-fixed font-bold hover:underline text-sm uppercase tracking-widest">
                                        Return to Login
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {status === 'error' && (
                                    <div className="p-3 bg-error-container/20 border border-error-container rounded-lg">
                                        <p className="text-error-container text-xs font-semibold text-center">{message}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="email">Email Address</label>
                                    <input 
                                        type="email" 
                                        id="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={status === 'loading'}
                                    className="w-full bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed font-bold py-3.5 px-4 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]"
                                >
                                    {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                                </button>
                                
                                <div className="text-center">
                                    <Link href="/login" className="text-xs font-bold text-primary-fixed-dim hover:underline uppercase tracking-widest">
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
