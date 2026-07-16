'use client'

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNavBar from '../../components/TopNavBar';

interface Project {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export default function ProjectsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user) return;
            const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
            try {
                const res = await fetch(`${apiURL}/api/projects`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data || []);
                }
            } catch (err) {
                console.error('Failed to load projects', err);
            } finally {
                setLoadingData(false);
            }
        };

        if (user) {
            fetchProjects();
        }
    }, [user]);

    if (isLoading || loadingData) {
        return (
            <div className="bg-background text-on-surface font-sans min-h-screen selection:bg-primary-container selection:text-on-primary-container overflow-hidden">
                <TopNavBar />
                <div className="flex h-screen items-center justify-center pt-16">
                    <div className="w-8 h-8 border-4 border-primary-fixed border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background text-on-surface font-sans min-h-screen selection:bg-primary-container selection:text-on-primary-container overflow-hidden">
            <TopNavBar />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex pt-16 h-screen">
                {/* SideNavBar */}
                <aside className={`w-72 border-r border-outline-variant bg-surface-container-lowest h-full flex flex-col transition-transform duration-300 z-50 fixed md:relative ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    
                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
                        <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all group">
                            <span className="material-symbols-outlined group-hover:text-primary-fixed transition-colors">dashboard</span>
                            <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                        <Link href="/projects" className="flex items-center gap-4 px-4 py-3 bg-primary-container/10 text-primary-fixed border border-primary-container/30 rounded-lg transition-all shadow-[inset_0_0_15px_rgba(0,240,255,0.05)]">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>folder</span>
                            <span className="text-sm font-bold tracking-wide">Projects</span>
                        </Link>
                        <Link href="#" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all group">
                            <span className="material-symbols-outlined group-hover:text-secondary-fixed transition-colors">inventory_2</span>
                            <span className="text-sm font-medium">All Sandboxes</span>
                        </Link>
                        <Link href="#" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all group">
                            <span className="material-symbols-outlined group-hover:text-tertiary-fixed transition-colors">group</span>
                            <span className="text-sm font-medium">Team</span>
                        </Link>
                        <Link href="/settings/account" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all group">
                            <span className="material-symbols-outlined group-hover:text-on-surface transition-colors">settings</span>
                            <span className="text-sm font-medium">Settings</span>
                        </Link>
                    </nav>

                    {/* Footer Storage Stats */}
                    <div className="p-6 border-t border-outline-variant bg-surface-container-low">
                        <div className="flex justify-between items-end mb-2">
                            <p className="text-[10px] font-bold text-on-surface-variant tracking-widest">STORAGE USED</p>
                            <span className="text-xs text-on-surface font-mono">1.2GB / 2.0GB</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-primary-fixed w-[60%] shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
                        </div>
                        <button className="w-full py-2 rounded-lg border border-primary-container/50 text-primary-fixed text-xs font-bold uppercase tracking-wide hover:bg-primary-container/10 transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
                            Upgrade Storage
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-background relative z-10 p-6 md:p-10 lg:px-12">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{
                        backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}></div>

                    <div className="relative z-10 max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-on-surface">Projects</h2>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container font-bold text-sm rounded-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all">
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                New Project
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex items-center gap-8 border-b border-outline-variant mb-8">
                            <button className="pb-4 px-2 text-xs font-bold uppercase tracking-wider text-primary-fixed border-b-2 border-primary-fixed">All Projects</button>
                            <button className="pb-4 px-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary-fixed transition-colors">Created by Me</button>
                            <button className="pb-4 px-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary-fixed transition-colors">Shared</button>
                        </div>

                        {/* Dashboard Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            
                            {projects.map((project) => (
                                <div key={project.id} className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:border-primary-container transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-2 py-1 bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/20 rounded text-[10px] font-bold tracking-widest uppercase">
                                            {project.status}
                                        </span>
                                        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary-fixed transition-colors">more_vert</button>
                                    </div>
                                    <h3 className="text-xl font-bold text-primary-fixed mb-1 truncate">{project.name}</h3>
                                    <div className="flex items-center gap-2 mb-6 group/repo">
                                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">code</span>
                                        <a className="text-sm font-mono text-on-surface-variant hover:text-primary-fixed transition-colors truncate" href="#">{project.slug}.clarity.dev</a>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Created</span>
                                            <span className="text-sm font-mono text-on-surface">{new Date(project.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Last Updated</span>
                                            <span className="text-sm font-mono text-on-surface">{new Date(project.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-outline-variant">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-on-surface-variant tracking-widest">SANDBOXES</span>
                                                <span className="text-xl font-bold text-primary-container">0</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-tertiary-fixed/10 text-tertiary-fixed rounded">
                                                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed"></span>
                                                <span className="text-[10px] font-bold tracking-wider">HEALTHY</span>
                                            </div>
                                        </div>
                                        <button className="p-2 rounded-lg bg-surface-container hover:bg-primary-container hover:text-on-primary-container transition-all">
                                            <span className="material-symbols-outlined">launch</span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State Card / CTA */}
                            <div className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-8 hover:border-primary-fixed/40 hover:bg-primary-fixed/5 transition-all cursor-pointer group min-h-[280px]">
                                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary-fixed text-[32px]">add</span>
                                </div>
                                <span className="text-lg font-bold text-on-surface-variant group-hover:text-primary-fixed transition-colors">Provision New Project</span>
                                <p className="text-sm text-on-surface-variant text-center mt-2 opacity-60 max-w-[200px]">Create an isolated environment for API collaboration.</p>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
