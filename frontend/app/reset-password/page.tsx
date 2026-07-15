'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'validating' | 'idle' | 'loading' | 'success' | 'error'>('validating');
    const [message, setMessage] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [strength, setStrength] = useState(0);

    // Validate token on load
    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Missing reset token. Please request a new link.');
            return;
        }

        const validateToken = async () => {
            try {
                const res = await fetch(`http://localhost:8081/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
                if (res.ok) {
                    setStatus('idle');
                } else {
                    setStatus('error');
                    setMessage('Invalid or expired reset token. Please request a new link.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Network error verifying token.');
            }
        };
        validateToken();
    }, [token]);

    const calculateStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (pass.length >= 12) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        setStrength(Math.min(4, score));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(e.target.value);
        calculateStrength(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setStatus('error');
            setMessage('Password must be at least 8 characters');
            return;
        }

        setStatus('loading');
        
        try {
            const res = await fetch('http://localhost:8081/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: newPassword })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setStatus('success');
                setMessage('Your password has been reset successfully.');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to reset password');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    }

    if (status === 'validating') {
        return (
            <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary-fixed border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary-fixed-dim/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary-fixed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-on-surface">Password Reset</h3>
                <p className="text-on-surface-variant text-sm">{message}</p>
                <p className="text-xs text-on-surface-variant/70">Redirecting to login...</p>
                <div className="pt-4">
                    <Link href="/login" className="text-primary-fixed font-bold hover:underline text-sm uppercase tracking-widest">
                        Go to Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
                <div className="p-3 bg-error-container/20 border border-error-container rounded-lg">
                    <p className="text-error-container text-xs font-semibold text-center">{message}</p>
                </div>
            )}

            {/* If we have a hard token error on load, hide the form inputs */}
            {message.includes('Invalid or expired') || message.includes('Missing reset token') ? (
                 <div className="text-center">
                    <Link href="/forgot-password" className="text-primary-fixed font-bold hover:underline text-sm uppercase tracking-widest">
                        Request New Link
                    </Link>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="newPassword">New Password</label>
                        <input 
                            type="password" 
                            id="newPassword"
                            required
                            value={newPassword}
                            onChange={handlePasswordChange}
                            className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all"
                            placeholder="Enter new password"
                        />
                        {newPassword && (
                            <div className="flex gap-1 mt-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? (strength < 2 ? 'bg-error' : strength < 3 ? 'bg-tertiary-fixed' : 'bg-primary-fixed') : 'bg-surface-container-highest'}`}></div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="confirmPassword">Confirm Password</label>
                        <input 
                            type="password" 
                            id="confirmPassword"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={status === 'loading'}
                        className="w-full bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed font-bold py-3.5 px-4 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]"
                    >
                        {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                    </button>
                </>
            )}
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-surface flex relative overflow-hidden">
            <div className="hidden lg:flex w-1/2 relative bg-surface-dim items-center justify-center border-r border-outline-variant/20 z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed-dim/10 to-transparent z-0"></div>
                <div className="z-10 text-center space-y-6 max-w-lg px-8">
                    <h1 className="text-5xl font-bold text-on-surface tracking-tight leading-tight">
                        Reset <span className="text-primary-fixed">Password</span>
                    </h1>
                    <p className="text-on-surface-variant text-lg">
                        Secure your Clarity Machine workspace with a new password.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-20">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-on-surface tracking-tight">Create New Password</h2>
                        <p className="text-on-surface-variant text-sm">
                            Please enter your new password below.
                        </p>
                    </div>

                    <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <Suspense fallback={
                            <div className="flex justify-center p-8">
                                <div className="w-8 h-8 border-4 border-primary-fixed border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        }>
                            <ResetPasswordForm />
                        </Suspense>
                    </div>
                </div>
            </div>
        </main>
    );
}
