'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopNavBar from '../../components/TopNavBar';

interface DashboardData {
    user: { 
        name: string;
        username: string;
    };
    stats: {
        active_sandboxes: number;
        projects: number;
        issues: number;
    };
    recent_projects: {
        id: string;
        name: string;
        domain: string;
        status: string;
        active_count: number;
        issue_count: number;
        last_updated: string;
    }[];
    active_sandboxes: {
        id: string;
        name: string;
        project_name: string;
        status: string;
        live_url: string;
        last_active: string;
    }[];
}

export default function DashboardHome() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
            const res = await fetch(`${apiURL}/api/dashboard`, {
                credentials: 'include',
            });
            
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (err) {
            console.error('Failed to load dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-background text-on-surface font-sans min-h-screen">
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
                {/* SideNavBar (w-72) */}
                <aside className={`w-72 border-r border-outline-variant bg-surface-container-lowest h-full flex flex-col transition-transform duration-300 z-50 fixed md:relative ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    
                    {/* Project Context */}
                    <div className="p-6 border-b border-outline-variant">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center border border-primary-container/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                                <span className="material-symbols-outlined text-primary-fixed">deployed_code</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-on-surface tracking-wider">PROJECT ALPHA</h3>
                                <p className="text-xs text-on-surface-variant font-mono">Production Cluster</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
                        <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3 bg-primary-container/10 text-primary-fixed border border-primary-container/30 rounded-lg transition-all shadow-[inset_0_0_15px_rgba(0,240,255,0.05)]">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>dashboard</span>
                            <span className="text-sm font-bold tracking-wide">Dashboard</span>
                        </Link>
                        <Link href="#" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all group">
                            <span className="material-symbols-outlined group-hover:text-primary-fixed transition-colors">folder</span>
                            <span className="text-sm font-medium">Projects</span>
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

                        <div className="pt-6 pb-2 px-4">
                            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Recent Activity</h4>
                        </div>
                        <Link href="#" className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all">
                            <div className="w-2 h-2 rounded-full bg-primary-fixed shadow-[0_0_5px_#00f0ff]"></div>
                            <span className="text-xs truncate">Deployed auth-v2-dev</span>
                        </Link>
                        <Link href="#" className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all">
                            <div className="w-2 h-2 rounded-full bg-secondary-fixed"></div>
                            <span className="text-xs truncate">Stopped payment-gate</span>
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

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface relative">
                    
                    {/* Mobile Sidebar Toggle */}
                    <button 
                        className="md:hidden absolute top-4 left-4 z-30 p-2 bg-surface-container border border-outline-variant rounded-lg"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    <div className="max-w-[1400px] mx-auto space-y-12 pb-24 mt-12 md:mt-0">
                        
                        {/* Welcome Header */}
                        <div className="mb-10">
                            <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                                Welcome back, <span className="text-primary-fixed">{data?.user.name}</span>
                            </h1>
                            <p className="text-on-surface-variant mt-3 text-lg flex items-center gap-3">
                                <span>{data?.stats.active_sandboxes} Active Sandboxes</span>
                                <span className="text-outline-variant">•</span>
                                <span>{data?.stats.projects} Projects</span>
                                <span className="text-outline-variant">•</span>
                                <span className={data?.stats.issues && data.stats.issues > 0 ? "text-error" : ""}>
                                    {data?.stats.issues} Issues
                                </span>
                            </p>
                        </div>

                        {/* Quick Actions (4 Cards) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button className="group flex flex-col items-start p-6 bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:border-primary-fixed transition-all text-left relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center mb-4 border border-primary-container/30 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary-fixed">add_box</span>
                                </div>
                                <h3 className="text-base font-bold text-on-surface mb-1 relative z-10">Create New Project</h3>
                                <p className="text-xs text-on-surface-variant relative z-10">Initialize a new infrastructure cluster.</p>
                            </button>

                            <button className="group flex flex-col items-start p-6 bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-[0_0_20px_rgba(255,180,251,0.15)] hover:border-tertiary-fixed transition-all text-left relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-tertiary-fixed/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center mb-4 border border-tertiary-container/30 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-tertiary-fixed">terminal</span>
                                </div>
                                <h3 className="text-base font-bold text-on-surface mb-1 relative z-10">Create New Sandbox</h3>
                                <p className="text-xs text-on-surface-variant relative z-10">Spin up a temporary API environment.</p>
                            </button>

                            <button className="group flex flex-col items-start p-6 bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-[0_0_20px_rgba(164,196,255,0.15)] hover:border-secondary-fixed transition-all text-left relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-secondary-fixed/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center mb-4 border border-secondary-container/30 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-secondary-fixed">view_list</span>
                                </div>
                                <h3 className="text-base font-bold text-on-surface mb-1 relative z-10">View All Sandboxes</h3>
                                <p className="text-xs text-on-surface-variant relative z-10">Manage your active deployments.</p>
                            </button>

                            <button className="group flex flex-col items-start p-6 bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-[0_0_20px_rgba(226,226,229,0.1)] hover:border-on-surface transition-all text-left relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-on-surface/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center mb-4 border border-outline-variant group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-on-surface">person_add</span>
                                </div>
                                <h3 className="text-base font-bold text-on-surface mb-1 relative z-10">Invite Team Member</h3>
                                <p className="text-xs text-on-surface-variant relative z-10">Collaborate with fellow developers.</p>
                            </button>
                        </div>

                        {/* Recent Projects */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-on-surface tracking-tight">Recent Projects</h2>
                                <button className="text-primary-fixed hover:text-primary-fixed-dim text-sm font-bold tracking-widest uppercase flex items-center gap-1 transition-colors">
                                    View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {data?.recent_projects.map(project => (
                                    <div key={project.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:border-outline hover:shadow-lg transition-all cursor-pointer group">
                                        <div className={`p-4 border-b border-outline-variant/50 flex justify-between items-start ${project.status === 'HEALTHY' ? 'bg-primary-container/5' : project.status === 'ISSUES' ? 'bg-error-container/5' : 'bg-surface-container-lowest'}`}>
                                            <div>
                                                <h3 className="font-bold text-lg text-on-surface group-hover:text-primary-fixed transition-colors">{project.name}</h3>
                                                <p className="text-xs font-mono text-on-surface-variant">{project.domain}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-sm border ${
                                                project.status === 'HEALTHY' ? 'border-primary-fixed/30 text-primary-fixed bg-primary-fixed/10' : 
                                                project.status === 'ISSUES' ? 'border-error/30 text-error bg-error/10' : 
                                                'border-outline-variant text-on-surface-variant'
                                            }`}>
                                                {project.status === 'ISSUES' ? `ISSUES (${project.issue_count})` : project.status}
                                            </span>
                                        </div>
                                        <div className="p-4 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">Active Sandboxes</p>
                                                <p className="text-sm font-bold text-on-surface">{project.active_count} Active</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">Last Updated</p>
                                                <p className="text-sm font-medium text-on-surface-variant">
                                                    {new Date(project.last_updated).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active Sandboxes */}
                        <div>
                            <h2 className="text-2xl font-semibold text-on-surface tracking-tight mb-6">Active Sandboxes</h2>
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden overflow-x-auto shadow-sm">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead className="bg-surface-container-low border-b border-outline-variant">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-on-surface-variant tracking-wider uppercase">Sandbox Name</th>
                                            <th className="px-6 py-4 text-xs font-bold text-on-surface-variant tracking-wider uppercase">Project</th>
                                            <th className="px-6 py-4 text-xs font-bold text-on-surface-variant tracking-wider uppercase">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-on-surface-variant tracking-wider uppercase">Live URL</th>
                                            <th className="px-6 py-4 text-xs font-bold text-on-surface-variant tracking-wider uppercase">Last Active</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/50">
                                        {data?.active_sandboxes.map(sandbox => (
                                            <tr key={sandbox.id} className="hover:bg-surface-container/50 transition-colors group">
                                                <td className="px-6 py-4 font-bold text-on-surface">{sandbox.name}</td>
                                                <td className="px-6 py-4 text-sm text-on-surface-variant">{sandbox.project_name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[11px] font-bold tracking-wide border ${
                                                        sandbox.status === 'RUNNING' ? 'border-primary-fixed/20 text-primary-fixed bg-primary-fixed/10' :
                                                        sandbox.status === 'SLEEPING' ? 'border-secondary-fixed/20 text-secondary-fixed bg-secondary-fixed/10' :
                                                        sandbox.status === 'BUILDING' ? 'border-tertiary-fixed/20 text-tertiary-fixed bg-tertiary-fixed/10' :
                                                        'border-error/20 text-error bg-error/10'
                                                    }`}>
                                                        {sandbox.status === 'RUNNING' && <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-pulse shadow-[0_0_5px_#00f0ff]"></span>}
                                                        {sandbox.status === 'BUILDING' && <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-bounce"></span>}
                                                        {sandbox.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {sandbox.live_url ? (
                                                        <a href={`https://${sandbox.live_url}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-primary-fixed-dim hover:text-primary-fixed hover:underline flex items-center gap-1 w-fit transition-colors">
                                                            {sandbox.live_url} <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                                        </a>
                                                    ) : (
                                                        <span className="font-mono text-xs text-on-surface-variant/50 italic">Not available</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-on-surface-variant">
                                                    {new Date(sandbox.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container transition-colors" title="Restart">restart_alt</button>
                                                        <button className="material-symbols-outlined text-on-surface-variant hover:text-error p-1 rounded hover:bg-surface-container transition-colors" title="Stop">stop_circle</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
            
            {/* Quick Create Floating Button */}
            <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary-fixed text-on-primary-fixed shadow-[0_4px_20px_rgba(0,240,255,0.3)] flex items-center justify-center group hover:scale-110 active:scale-95 transition-all z-40">
                <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">add</span>
            </button>
        </div>
    );
}
