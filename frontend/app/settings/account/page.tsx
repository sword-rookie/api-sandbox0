'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountSettings() {
    const router = useRouter();
    // For now, we'll mock the user ID for testing until JWT auth is fully connected
    const [userId, setUserId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        bio: '',
        location: '',
        avatar_url: ''
    });

    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // In a real flow with JWT, this would fetch the /api/auth/me or similar. 
    // Here we'll just leave it empty initially so the user can test the UI, 
    // or you could store the ID in localStorage upon signup to test end-to-end.

    const handleUpdate = async () => {
        if (!userId) {
            setMessage({ type: 'error', text: 'You need to specify the User ID to update (until JWT is connected)' });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
            const res = await fetch(`${apiURL}/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to update profile');
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!userId) {
            setMessage({ type: 'error', text: 'You need a valid User ID to delete.' });
            return;
        }
        
        const confirmDelete = window.confirm("Are you sure you want to permanently delete this account? This cannot be undone.");
        if (!confirmDelete) return;

        try {
            const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
            const res = await fetch(`${apiURL}/api/users/${userId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to delete account');
            }

            alert("Account deleted successfully.");
            router.push('/signup');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    return (
        <div className="bg-background text-on-surface font-sans min-h-screen selection:bg-primary-container/30">
            {/* TopNavBar */}
            <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant shadow-sm">
                <div className="flex justify-between items-center h-16 px-4 md:px-10 max-w-[1440px] mx-auto">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-xl font-bold text-primary-fixed-dim">Clarity Machine</Link>
                    </div>
                    <div className="flex-1 flex justify-center px-8 hidden md:flex">
                        <div className="relative w-full max-w-md">
                            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                            <input className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-8 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container font-mono transition-all" placeholder="Search resources..." type="text" />
                        </div>
                    </div>
                </div>
            </header>

            {/* SideNavBar */}
            <nav className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col py-4 gap-1 hidden md:flex">
                <div className="px-6 pb-4 mb-2 border-b border-outline-variant/50">
                    <h2 className="text-lg font-bold text-primary">Mission Control</h2>
                </div>
                <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-1">
                    <Link className="flex items-center gap-4 px-4 py-2 rounded-lg text-primary-fixed-dim bg-secondary-container/30 border-r-2 border-primary-container transition-all font-mono text-sm" href="/settings/account">
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
                        Account
                    </Link>
                    {/* Other inactive links omitted for brevity */}
                </div>
            </nav>

            {/* Main Content */}
            <main className="md:ml-64 pt-16 min-h-screen">
                <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-8">
                    <header className="mb-12">
                        <h1 className="text-4xl font-bold text-on-surface tracking-tight">Account Settings</h1>
                        <p className="text-lg text-on-surface-variant mt-2">Manage your personal identity and core sandbox preferences.</p>
                    </header>

                    {message && (
                        <div className={`p-4 rounded-lg border ${message.type === 'error' ? 'bg-error-container/20 border-error-red text-error-red' : 'bg-tertiary-container/20 border-tertiary-fixed-dim text-tertiary-fixed-dim'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Temporary ID input for testing */}
                    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm p-6 mb-8">
                        <h3 className="text-lg font-bold text-on-surface mb-2">Test Configuration</h3>
                        <p className="text-sm text-on-surface-variant mb-4">Since JWT login isn't connected, enter a User ID from the database to test the update and delete functionality.</p>
                        <input 
                            className="w-full bg-surface border border-outline-variant rounded-md px-4 py-2 text-on-surface focus:border-primary-container focus:outline-none" 
                            type="text" 
                            placeholder="Enter valid UUID string..."
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        />
                    </section>

                    {/* Profile Identity Card */}
                    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-outline-variant bg-surface-container/30">
                            <h3 className="text-xl font-bold text-on-surface">Profile Identity</h3>
                            <p className="text-on-surface-variant">This information will be displayed publicly across your API sandboxes.</p>
                        </div>
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-on-surface-variant uppercase">Display Name</label>
                                    <input 
                                        className="w-full bg-surface border border-outline-variant rounded-md px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-on-surface-variant uppercase">Username</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-2 text-on-surface-variant font-mono">@</span>
                                        <input 
                                            className="w-full bg-surface border border-outline-variant rounded-md pl-8 pr-4 py-2 text-primary font-mono focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" 
                                            type="text" 
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-on-surface-variant uppercase">Email Address</label>
                                    <input 
                                        className="w-full bg-surface border border-outline-variant rounded-md px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-on-surface-variant uppercase">Location</label>
                                    <input 
                                        className="w-full bg-surface border border-outline-variant rounded-md px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" 
                                        type="text" 
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="block text-xs font-semibold text-on-surface-variant uppercase">Bio</label>
                                    <textarea 
                                        className="w-full bg-surface border border-outline-variant rounded-md px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all min-h-[100px]" 
                                        value={formData.bio}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="block text-xs font-semibold text-on-surface-variant uppercase">Avatar Image URL</label>
                                    <input 
                                        className="w-full bg-surface border border-outline-variant rounded-md px-4 py-2 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" 
                                        type="url" 
                                        placeholder="https://example.com/image.jpg"
                                        value={formData.avatar_url}
                                        onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-surface-container/30 border-t border-outline-variant flex justify-end">
                            <button 
                                onClick={handleUpdate}
                                disabled={loading}
                                className="bg-primary-container text-on-primary-container px-6 py-2 rounded text-sm font-bold shadow-[0_0_12px_rgba(0,240,255,0.15)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="mt-16">
                        <h3 className="text-2xl font-bold text-error-red mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined">warning</span>
                            Danger Zone
                        </h3>
                        <div className="border border-error-red/30 rounded-xl overflow-hidden bg-surface-container-lowest relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-error-container/5 to-transparent pointer-events-none"></div>
                            <div className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                                <div>
                                    <h4 className="text-lg font-semibold text-on-surface">Delete Account</h4>
                                    <p className="text-on-surface-variant mt-1 max-w-lg">
                                        Once you delete your account, there is no going back. All sandboxes, API keys, and deployment history will be permanently erased. Please be certain.
                                    </p>
                                </div>
                                <button 
                                    onClick={handleDelete}
                                    className="shrink-0 px-6 py-2 rounded bg-error-container text-on-error-container hover:bg-error-red hover:text-surface-dim text-sm font-bold transition-colors active:scale-95 border border-error-red/50"
                                >
                                    Delete Permanently
                                </button>
                            </div>
                        </div>
                    </section>
                    
                    <div className="h-16"></div>
                </div>
            </main>
        </div>
    );
}
