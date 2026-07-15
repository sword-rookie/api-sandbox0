'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import TopNavBar from '../../../components/TopNavBar';
import Link from 'next/link';

export default function AccountSettingsPage() {
    const { user, loading, checkAuth } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        bio: '',
        location: '',
        avatar_url: ''
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [status, setStatus] = useState<{type: 'idle' | 'loading' | 'success' | 'error', message?: string}>({ type: 'idle' });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || '',
                location: user.location || '',
                avatar_url: user.avatar_url || ''
            });
        }
    }, [user, loading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setFormData({ ...formData, avatar_url: URL.createObjectURL(file) });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: 'loading' });
        
        try {
            const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
            let finalAvatarUrl = formData.avatar_url;

            // 1. Upload Avatar if a new file was selected
            if (avatarFile) {
                const uploadData = new FormData();
                uploadData.append('avatar', avatarFile);

                const uploadRes = await fetch(`${apiURL}/api/upload/avatar`, {
                    method: 'POST',
                    body: uploadData,
                    credentials: 'include' // Optional: if auth required later
                });

                if (!uploadRes.ok) {
                    throw new Error('Failed to upload avatar image');
                }

                const uploadJson = await uploadRes.json();
                finalAvatarUrl = uploadJson.url;
            }

            // 2. Submit Full Profile
            const payload = { ...formData, avatar_url: finalAvatarUrl };

            const res = await fetch(`${apiURL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (!res.ok) {
                let errMsg = 'Failed to update profile. Please try again.';
                try {
                    const errJson = await res.json();
                    if (errJson.error) errMsg = errJson.error;
                } catch (e) {}
                if (res.status === 409) {
                    throw new Error('This username is already taken. Please choose another one.');
                }
                throw new Error(`Server returned ${res.status}: ${errMsg}`);
            }

            // Refresh user context so TopNav updates
            await checkAuth();
            setStatus({ type: 'success', message: 'Profile updated successfully!' });

            // Navigate back to the profile page after a short delay
            setTimeout(() => {
                router.push(`/profile/${formData.username}`);
            }, 1000);
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        }
    };

    if (loading || !user) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center text-primary-fixed-dim">
                <span className="material-symbols-outlined animate-spin text-[48px]">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="bg-background text-on-surface font-sans min-h-screen">
            <TopNavBar />

            <main className="pt-24 max-w-[1024px] mx-auto px-6 pb-20 flex gap-8">
                
                {/* Left Settings Navigation */}
                <aside className="w-1/4 hidden md:flex flex-col gap-2">
                    <Link href="/settings/account" className="px-4 py-2 bg-surface-container rounded-md border-l-4 border-primary-fixed-dim text-sm font-semibold">
                        Account Profile
                    </Link>
                    <Link href="#" className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-md text-sm font-semibold transition-colors">
                        Security
                    </Link>
                    <Link href="#" className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-md text-sm font-semibold transition-colors">
                        Notifications
                    </Link>
                    <Link href="#" className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-md text-sm font-semibold transition-colors">
                        Billing
                    </Link>
                </aside>

                {/* Main Settings Content */}
                <div className="w-full md:w-3/4">
                    <h1 className="text-2xl font-bold border-b border-outline-variant pb-4 mb-6">Account Profile</h1>

                    {status.message && (
                        <div className={`p-4 mb-6 rounded-md flex items-center gap-3 ${status.type === 'error' ? 'bg-error-container/20 border border-error text-error' : 'bg-primary-container/20 border border-primary-fixed-dim text-primary-fixed-dim'}`}>
                            <span className="material-symbols-outlined">{status.type === 'error' ? 'error' : 'check_circle'}</span>
                            <span className="text-sm font-semibold">{status.message}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-[600px]">
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">Avatar</label>
                            <div className="flex items-center gap-6">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-2 border-outline-variant bg-surface-container cursor-pointer hover:border-primary-fixed-dim transition-colors group relative"
                                >
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt="Avatar preview" className="w-full h-full object-cover grayscale contrast-125 group-hover:opacity-50 transition-opacity" />
                                    ) : (
                                        <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-[40px] text-on-surface-variant group-hover:opacity-50 transition-opacity">person</span>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <span className="material-symbols-outlined text-white drop-shadow-md">upload</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-sm font-semibold text-primary-fixed-dim hover:text-primary-fixed text-left hover:underline transition-all"
                                    >
                                        Upload new picture
                                    </button>
                                    <span className="text-xs text-on-surface-variant">JPEG, PNG, or WebP. Max 5MB.</span>
                                </div>

                                <input 
                                    type="file" 
                                    accept="image/jpeg, image/png, image/webp"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">Display Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2 text-sm focus:border-primary-fixed-dim focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">Username</label>
                            <div className="flex items-center gap-2">
                                <span className="text-on-surface-variant text-sm bg-surface-container px-3 py-2 rounded-md border border-outline-variant">claritymachine.io/</span>
                                <input 
                                    type="text" 
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2 text-sm focus:border-primary-fixed-dim focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                            <p className="text-xs text-on-surface-variant mt-1">Changing your username can have unintended side effects.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">Bio</label>
                            <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2 text-sm focus:border-primary-fixed-dim focus:outline-none transition-colors resize-y"
                                placeholder="Tell us a little about yourself"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">Location</label>
                            <input 
                                type="text" 
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2 text-sm focus:border-primary-fixed-dim focus:outline-none transition-colors"
                                placeholder="E.g., Austin, TX"
                            />
                        </div>

                        <div className="pt-4 border-t border-outline-variant">
                            <button 
                                type="submit" 
                                disabled={status.type === 'loading'}
                                className="bg-primary-container text-on-primary-container px-6 py-2 rounded-md text-sm font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                            >
                                {status.type === 'loading' ? (
                                    <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Saving...</>
                                ) : (
                                    'Update Profile'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
