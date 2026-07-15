'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../app/context/AuthContext';

export default function TopNavBar() {
    const { user } = useAuth();

    return (
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant transition-all duration-300">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-2xl font-bold text-primary hover:brightness-110 transition-colors">
                    Clarity Machine
                </Link>
                <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-1 border border-outline-variant w-96 ml-8 focus-within:border-primary-fixed-dim focus-within:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all">
                    <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
                    <input className="bg-transparent border-none text-sm focus:ring-0 w-full text-on-surface placeholder:text-on-surface-variant outline-none" placeholder="Search resources..." type="text" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border-l border-outline-variant pl-4 ml-2">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors active:scale-95">
                        notifications
                    </button>
                    <Link href={`/profile/${user?.username || 'demo'}`}>
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-primary-container cursor-pointer hover:scale-105 transition-transform ml-2">
                            <img alt="User profile" className="w-full h-full object-cover grayscale contrast-125" src={user?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBVEIJ1kg84ObPxJbw9lPD_Cl_UbuFva43Z8SPeW8bqmzuxauITDn2IQJn3BoWafgP8KWwuCjuWaQp6W-iRNzHjbdBYKZ5RqpiCAHNcO1SIF8pIHaBQFjkTW8DWtqcmnxvldZx0DYjBPhfEFxI_BnpUjgiDsPUvKCm_6kM7BJUcDnT1CLtHTo0n-W-vGwgmke9CosaYwixilnIn4rZdS88mCoc1ha_AjGTXEk5eDkMWujDByKnCqsCk6_Gt-ie3KiR0mD80bQKtW8UD"} />
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
