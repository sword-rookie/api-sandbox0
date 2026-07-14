'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface UserProfile {
    id: string;
    name: string;
    username: string;
    email: string;
    bio: string;
    location: string;
    avatar_url: string;
}

export default function ProfileOverview() {
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!username) return;

        const fetchProfile = async () => {
            try {
                const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
                const res = await fetch(`${apiURL}/api/users/${username}`);
                
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error('Profile not found');
                    }
                    throw new Error('Failed to load profile');
                }

                const data = await res.json();
                setProfile(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    if (loading) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center text-primary-fixed-dim">
                <span className="material-symbols-outlined animate-spin text-[48px]">progress_activity</span>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="bg-background min-h-screen flex flex-col items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[64px] text-error mb-4">error</span>
                <h1 className="text-3xl font-bold">{error || "Something went wrong"}</h1>
                <Link href="/" className="mt-8 text-primary-fixed-dim hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="bg-background text-on-surface font-sans min-h-screen overflow-x-hidden selection:bg-primary-container/30">
            {/* TopNavBar */}
            <nav className="bg-surface/80 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm border-b border-outline-variant transition-all duration-300">
                <div className="flex justify-between items-center h-16 px-4 md:px-10 max-w-[1440px] mx-auto">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-xl font-bold text-primary-fixed-dim cursor-pointer hover:text-primary transition-colors active:scale-95 duration-200">
                            Clarity Machine
                        </Link>
                        <div className="hidden md:flex items-center bg-surface-container-lowest border border-outline-variant rounded-full px-4 py-2 focus-within:border-primary-fixed-dim focus-within:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all">
                            <span className="material-symbols-outlined text-on-surface-variant mr-2" style={{ fontSize: '20px' }}>search</span>
                            <input className="bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant w-64 outline-none" placeholder="Search resources..." type="text" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-200 p-2 rounded-full hover:bg-surface-container-low flex items-center justify-center">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <Link href="/settings/account" className="text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-200 p-2 rounded-full hover:bg-surface-container-low flex items-center justify-center">
                            <span className="material-symbols-outlined">settings</span>
                        </Link>
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant cursor-pointer hover:border-primary transition-colors ml-2 active:scale-95 duration-200">
                            <img alt="User profile avatar" className="w-full h-full object-cover" src={profile.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuC_GQh8LEnLBW4mIGswhQ-ss8DZCBevY0av-vEX3NSca_iN9GDY6-MhLqQpCEIPI0EIIVF4n9c4wuzCVT-VZryQ5qTaWR_uIJ9puU9NU9ya0gHgrLX4GIQmnGnP6FFmzS2a0s9Vh6mzMUdy6Wl7ozKs5AfLyfM7StdlTfzrXOCp9wBr3W2SqPGkS8oW8wSeemB09Hk9TbrnQdqshJZGHZX9IZhMasPMw7wOMUsNEnqlJbkUJTFh3yj9kQUb2kLKj9E0gHWmB0WU1soN"} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* SideNavBar */}
            <aside className="bg-surface-container-lowest border-r border-outline-variant fixed left-0 top-16 h-[calc(100vh-64px)] w-64 hidden md:flex flex-col py-4 gap-1 overflow-y-auto">
                <div className="px-4 pb-4 mb-1 border-b border-outline-variant/50">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-10 h-10 rounded border border-primary-container/30 overflow-hidden shrink-0">
                            <img alt="Developer Avatar" className="w-full h-full object-cover grayscale contrast-125" src={profile.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrVKpwSFQBczULJo5kMCtB0_c_GSxzm6lpteIGzfw7a8uxF9ArbDE0MQ5EMCQylAMe-JWF4kY25ULWnoGwZ232vsal8M49rXerhQHmnJTZvg32nJhehB4PudlOM0udQ1Zk-6BGrd9FiIGYY9AX3kCI0Oub0Vb-BYbd2tftfDssn-AJTyX0EyAS8ZFbr3cjkpS-xBVNtvgas1qxCksH_aCuxRYaPmStsnlfvKXhXRBqmRT1TOCUTtsUJIKTepUElttuznVLUgo99MYs"} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[14px] leading-tight font-bold text-primary truncate">DevOps Mission Control</span>
                            <span className="font-mono text-[11px] text-on-surface-variant truncate">Active Session: US-East-1</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-1 px-2">
                    <a className="flex items-center gap-4 px-4 py-2 rounded-r-full mr-2 text-primary-fixed-dim bg-secondary-container/30 border-r-2 border-primary-container font-mono text-sm transition-all" href="#">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Overview</span>
                    </a>
                    <Link className="flex items-center gap-4 px-4 py-2 rounded-r-full mr-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all font-mono text-sm" href="/settings/account">
                        <span className="material-symbols-outlined">person</span>
                        <span>Account</span>
                    </Link>
                    <a className="flex items-center gap-4 px-4 py-2 rounded-r-full mr-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all font-mono text-sm" href="#">
                        <span className="material-symbols-outlined">layers</span>
                        <span>Sandboxes</span>
                    </a>
                </div>

                <div className="px-4 mt-auto pt-4 border-t border-outline-variant/50">
                    <div className="flex flex-col gap-1 pb-2">
                        <a className="flex items-center gap-4 px-2 py-1.5 text-error hover:text-error-red hover:bg-error-container/20 rounded transition-all font-mono text-[13px]" href="#">
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            <span>Sign Out</span>
                        </a>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 mt-16 p-4 md:p-16 min-h-[calc(100vh-64px)] max-w-[1176px] mx-auto">
                <section className="relative mb-16">
                    {/* Banner Image */}
                    <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden relative border border-outline-variant shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent z-10"></div>
                        <img className="w-full h-full object-cover object-center" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAc2Gbgk1AjShG9hozz5CEIP3RyBcDCV_JKprZIxHxvQPxWW5CPTPUh3abN0-vyVAjg7TdxNsP9O_sy9RcKBo6Q7tPmYhLxbAxeNl8vmTNQdfP71ksdKUHtsO0SlqGwTZwqnsWE6ElCgS1PcZgk6LEJEMDxxlW_kQ7GZ9jzgdtKx1UJSuVSSNlF5cucI8Es1KjMXFGUFbEoz4x0zpH-CdxCAC5ea6P0yfjW0kKWgT8jwku6qlJu1_6mMXwkBQ-ZRHzelX6ky2A4v9Yi" />
                    </div>

                    {/* Profile Info Container */}
                    <div className="relative z-20 px-4 md:px-8 -mt-16 md:-mt-20 flex flex-col md:flex-row gap-6 md:items-end justify-between">
                        {/* Avatar & Identity */}
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                            <div className="relative">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-4 border-surface-container-lowest shadow-[0_0_20px_rgba(0,240,255,0.15)] bg-surface-container-lowest">
                                    <img className="w-full h-full object-cover grayscale contrast-125" src={profile.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBVEIJ1kg84ObPxJbw9lPD_Cl_UbuFva43Z8SPeW8bqmzuxauITDn2IQJn3BoWafgP8KWwuCjuWaQp6W-iRNzHjbdBYKZ5RqpiCAHNcO1SIF8pIHaBQFjkTW8DWtqcmnxvldZx0DYjBPhfEFxI_BnpUjgiDsPUvKCm_6kM7BJUcDnT1CLtHTo0n-W-vGwgmke9CosaYwixilnIn4rZdS88mCoc1ha_AjGTXEk5eDkMWujDByKnCqsCk6_Gt-ie3KiR0mD80bQKtW8UD"} />
                                </div>
                                <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-primary-container border-2 border-surface-container-lowest shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
                            </div>
                            <div className="flex flex-col pb-2">
                                <h1 className="text-4xl font-bold text-on-surface m-0 leading-tight tracking-tight">{profile.name}</h1>
                                <span className="font-mono text-sm text-primary-fixed-dim mt-1">@{profile.username}</span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-4 pb-2">
                            <Link href="/settings/account" className="bg-primary-container text-on-primary-container px-6 py-2 rounded text-sm font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all active:scale-95 duration-200">
                                Edit Profile
                            </Link>
                        </div>
                    </div>

                    {/* Bio & Meta */}
                    <div className="mt-6 px-4 md:px-8 max-w-3xl">
                        <p className="text-lg text-on-surface-variant mb-4">
                            {profile.bio || "No bio provided yet."}
                        </p>
                        <div className="flex flex-wrap gap-8 items-center font-mono text-[13px] text-on-surface-variant">
                            {profile.location && (
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    <span>{profile.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px] text-primary-fixed-dim">mail</span>
                                <a className="text-primary-fixed-dim hover:underline" href={`mailto:${profile.email}`}>{profile.email}</a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-8">
                    {/* Stat Card 1 */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between group hover:border-primary-fixed-dim transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-container/10 transition-all"></div>
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Total Sandboxes</span>
                            <span className="material-symbols-outlined text-primary-fixed-dim">layers</span>
                        </div>
                        <div className="font-mono text-4xl font-bold text-on-surface relative z-10">
                            0
                        </div>
                    </div>
                    {/* Stat Card 2 */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between group hover:border-primary-fixed-dim transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-container/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-tertiary-container/10 transition-all"></div>
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Projects Owned</span>
                            <span className="material-symbols-outlined text-tertiary-fixed-dim">folder_managed</span>
                        </div>
                        <div className="font-mono text-4xl font-bold text-on-surface relative z-10">
                            0
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
