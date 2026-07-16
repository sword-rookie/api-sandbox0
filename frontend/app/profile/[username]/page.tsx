'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import TopNavBar from '../../../components/TopNavBar';

interface ProjectPreview {
    id: string;
    name: string;
    domain: string;
    status: string;
    active_count: number;
    issue_count: number;
    last_updated: string;
}

interface UserProfile {
    id: string;
    name: string;
    username: string;
    email: string;
    bio: string;
    location: string;
    avatar_url: string;
    projects_count: number;
    sandboxes_count: number;
    pinned_projects: ProjectPreview[];
}

// Generate a random contribution graph (365 days)
const generateContributionData = () => {
    const days = [];
    for (let i = 0; i < 365; i++) {
        // 0: none, 1: low, 2: medium, 3: high, 4: very high
        const rand = Math.random();
        let level = 0;
        if (rand > 0.9) level = 4;
        else if (rand > 0.75) level = 3;
        else if (rand > 0.6) level = 2;
        else if (rand > 0.4) level = 1;
        days.push({ id: i, level });
    }
    return days;
};

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [contributions, setContributions] = useState<{id: number, level: number}[]>([]);

    useEffect(() => {
        setContributions(generateContributionData());
    }, []);

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

    const getColorForLevel = (level: number) => {
        switch (level) {
            case 4: return 'bg-primary-fixed drop-shadow-[0_0_2px_rgba(0,240,255,0.8)]';
            case 3: return 'bg-primary-fixed-dim';
            case 2: return 'bg-primary-fixed-dim/60';
            case 1: return 'bg-primary-fixed-dim/30';
            default: return 'bg-surface-container-high border border-outline-variant/30';
        }
    };

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
        <div className="bg-background text-on-surface font-sans min-h-screen">
            {/* Top Navigation - Shared */}
            <TopNavBar />

            <main className="pt-24 max-w-[1280px] mx-auto px-6 pb-20">
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* Left Sidebar */}
                    <aside className="w-full md:w-1/4 flex flex-col gap-4">
                        <div className="w-full aspect-square rounded-full overflow-hidden border border-outline-variant shadow-[0_0_20px_rgba(0,240,255,0.1)] mb-2 relative group">
                            <img src={profile.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBVEIJ1kg84ObPxJbw9lPD_Cl_UbuFva43Z8SPeW8bqmzuxauITDn2IQJn3BoWafgP8KWwuCjuWaQp6W-iRNzHjbdBYKZ5RqpiCAHNcO1SIF8pIHaBQFjkTW8DWtqcmnxvldZx0DYjBPhfEFxI_BnpUjgiDsPUvKCm_6kM7BJUcDnT1CLtHTo0n-W-vGwgmke9CosaYwixilnIn4rZdS88mCoc1ha_AjGTXEk5eDkMWujDByKnCqsCk6_Gt-ie3KiR0mD80bQKtW8UD"} className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 border-[6px] border-surface-container-lowest rounded-full pointer-events-none"></div>
                        </div>
                        
                        <div>
                            <h1 className="text-2xl font-bold text-on-surface leading-tight">{profile.name}</h1>
                            <h2 className="text-xl text-on-surface-variant font-mono mb-4">@{profile.username}</h2>
                        </div>

                        {currentUser && currentUser.username === profile.username && (
                            <Link href="/settings/account" className="w-full block text-center py-1.5 bg-surface-container-high border border-outline-variant rounded-md text-sm font-semibold hover:bg-surface-container transition-colors mb-2">
                                Edit profile
                            </Link>
                        )}

                        <div className="text-sm text-on-surface mb-2">
                            {profile.bio || 'Building the future of infrastructure.'}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer mb-4">
                            <span className="material-symbols-outlined text-[16px]">group</span>
                            <span className="font-bold text-on-surface">1.2k</span> followers
                            <span className="mx-1">·</span>
                            <span className="font-bold text-on-surface">14</span> following
                        </div>

                        <div className="flex flex-col gap-2 text-sm text-on-surface-variant">
                            {profile.location && (
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                    <span>{profile.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">mail</span>
                                <a href={`mailto:${profile.email}`} className="hover:text-primary hover:underline">{profile.email}</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">link</span>
                                <a href="#" className="hover:text-primary hover:underline">claritymachine.io/{profile.username}</a>
                            </div>
                        </div>
                    </aside>

                    {/* Right Content */}
                    <div className="w-full md:w-3/4 flex flex-col gap-6">
                        
                        {/* Tabs */}
                        <div className="flex items-center gap-6 border-b border-outline-variant overflow-x-auto pb-[1px]">
                            <button className="flex items-center gap-2 py-2 border-b-2 border-primary-fixed-dim text-on-surface font-semibold text-sm whitespace-nowrap">
                                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                                Overview
                            </button>
                            <button className="flex items-center gap-2 py-2 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant font-semibold text-sm whitespace-nowrap transition-colors">
                                <span className="material-symbols-outlined text-[18px]">terminal</span>
                                Sandboxes <span className="bg-surface-container px-2 rounded-full text-xs ml-1">{profile.sandboxes_count}</span>
                            </button>
                            <button className="flex items-center gap-2 py-2 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant font-semibold text-sm whitespace-nowrap transition-colors">
                                <span className="material-symbols-outlined text-[18px]">folder</span>
                                Projects <span className="bg-surface-container px-2 rounded-full text-xs ml-1">{profile.projects_count}</span>
                            </button>
                            <button className="flex items-center gap-2 py-2 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant font-semibold text-sm whitespace-nowrap transition-colors">
                                <span className="material-symbols-outlined text-[18px]">star</span>
                                Stars <span className="bg-surface-container px-2 rounded-full text-xs ml-1">0</span>
                            </button>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-sm font-semibold mb-3">Pinned</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {profile.pinned_projects && profile.pinned_projects.length > 0 ? profile.pinned_projects.map(proj => (
                                    <div key={proj.id} className="p-4 border border-outline-variant rounded-xl bg-surface-container-lowest flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <a href="#" className="text-primary-fixed-dim font-semibold hover:underline text-sm">{proj.name}</a>
                                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant cursor-pointer">drag_indicator</span>
                                        </div>
                                        <p className="text-xs text-on-surface-variant line-clamp-2">{proj.domain}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-variant">
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary-fixed"></div>{proj.status}</div>
                                            <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">star</span> 0</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 text-sm text-on-surface-variant py-4">No pinned projects yet.</div>
                                )}
                            </div>
                        </div>

                        {/* Contribution Graph */}
                        <div className="mt-8">
                            <h3 className="text-sm font-semibold mb-3">1,842 contributions in the last year</h3>
                            <div className="p-4 border border-outline-variant rounded-xl bg-surface-container-lowest overflow-hidden">
                                <div className="flex gap-[3px] overflow-x-auto pb-4">
                                    {/* 52 columns of 7 days */}
                                    {Array.from({length: 52}).map((_, colIndex) => (
                                        <div key={colIndex} className="flex flex-col gap-[3px]">
                                            {contributions.slice(colIndex * 7, (colIndex + 1) * 7).map((day) => (
                                                <div 
                                                    key={day.id} 
                                                    className={`w-3 h-3 rounded-[2px] ${getColorForLevel(day.level)}`}
                                                    title={`Activity Level: ${day.level}`}
                                                ></div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-2 text-xs text-on-surface-variant">
                                    <span>Learn how we count contributions</span>
                                    <div className="flex items-center gap-2">
                                        <span>Less</span>
                                        <div className="flex gap-[3px]">
                                            <div className="w-3 h-3 rounded-[2px] bg-surface-container-high border border-outline-variant/30"></div>
                                            <div className="w-3 h-3 rounded-[2px] bg-primary-fixed-dim/30"></div>
                                            <div className="w-3 h-3 rounded-[2px] bg-primary-fixed-dim/60"></div>
                                            <div className="w-3 h-3 rounded-[2px] bg-primary-fixed-dim"></div>
                                            <div className="w-3 h-3 rounded-[2px] bg-primary-fixed drop-shadow-[0_0_2px_rgba(0,240,255,0.8)]"></div>
                                        </div>
                                        <span>More</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
