'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user && user.username) {
                router.push(`/profile/${user.username}`);
            } else {
                router.push('/login');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="bg-background min-h-screen flex items-center justify-center text-primary-fixed-dim">
            <span className="material-symbols-outlined animate-spin text-[48px]">progress_activity</span>
        </div>
    );
}
