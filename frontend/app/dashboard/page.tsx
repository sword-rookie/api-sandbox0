'use client'

import React from 'react';
import Link from 'next/link';
import TopNavBar from '../../components/TopNavBar';

export default function DashboardHome() {
    return (
        <div className="bg-background text-on-surface font-sans min-h-screen selection:bg-primary-container selection:text-on-primary-container">
            {/* TopNavBar */}
            <TopNavBar />

            {/* SideNavBar */}
            <aside className="fixed left-0 top-16 bottom-0 w-64 hidden md:flex flex-col py-4 px-2 bg-surface-container-lowest border-r border-outline-variant">
                <div className="px-4 mb-8 flex items-center gap-2">
                    <div className="w-10 h-10 bg-secondary-container rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-secondary-container">deployed_code</span>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Project Alpha</h3>
                        <p className="font-mono text-xs text-on-surface-variant">Production Cluster</p>
                    </div>
                </div>
                <nav className="flex-1 space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-lg transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined">folder</span>
                        <span className="text-sm">Projects</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined">inventory_2</span>
                        <span className="text-sm">All Sandboxes</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined">history</span>
                        <span className="text-sm">Activity</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined">group</span>
                        <span className="text-sm">Team</span>
                    </Link>
                    <Link href="/settings/account" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-sm">Settings</span>
                    </Link>
                </nav>
                <div className="mt-auto space-y-4 px-4">
                    <div className="bg-surface-container rounded-xl p-4 border border-outline-variant">
                        <p className="text-[10px] font-bold text-on-surface-variant mb-2 tracking-widest">STORAGE USED</p>
                        <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden mb-1">
                            <div className="h-full bg-primary-container w-3/4 shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-on-surface font-mono">1.2GB / 2.0GB</span>
                        </div>
                        <button className="w-full py-1.5 rounded-lg border border-primary-container/30 text-primary-container text-xs font-bold uppercase tracking-wide hover:bg-primary-container/10 transition-colors">
                            Upgrade Storage
                        </button>
                    </div>
                    <div className="flex items-center justify-around border-t border-outline-variant pt-4">
                        <button className="flex flex-col items-center gap-1 group">
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
                            <span className="text-[10px] font-bold uppercase text-on-surface-variant">Active</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                            <span className="material-symbols-outlined text-on-surface-variant group-hover:scale-110 transition-transform">nights_stay</span>
                            <span className="text-[10px] font-bold uppercase text-on-surface-variant">Sleeping</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Canvas */}
            <main className="md:ml-64 pt-16 min-h-screen">
                <div className="max-w-[1440px] mx-auto p-6 md:p-10 space-y-16">
                    
                    {/* Welcome Section */}
                    <section className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">Welcome back, Alex</h1>
                        <p className="text-lg text-on-surface-variant max-w-[672px]">What would you like to do today? Your project clusters are healthy and 5 sandboxes are currently active.</p>
                    </section>

                    {/* Quick Action Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <button className="group flex flex-col items-start p-8 bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:border-primary-container transition-all text-left">
                            <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors">
                                <span className="material-symbols-outlined text-primary-container">create_new_folder</span>
                            </div>
                            <h3 className="text-lg font-bold text-on-surface mb-1">Create New Project</h3>
                            <p className="text-sm text-on-surface-variant">Initialize a fresh infrastructure cluster.</p>
                        </button>
                        <button className="group flex flex-col items-start p-8 bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:border-primary-container transition-all text-left">
                            <div className="w-12 h-12 rounded-lg bg-tertiary-container/10 flex items-center justify-center mb-4 group-hover:bg-tertiary-container/20 transition-colors">
                                <span className="material-symbols-outlined text-tertiary-fixed-dim">terminal</span>
                            </div>
                            <h3 className="text-lg font-bold text-on-surface mb-1">Create New Sandbox</h3>
                            <p className="text-sm text-on-surface-variant">Spin up a temporary API environment.</p>
                        </button>
                        <button className="group flex flex-col items-start p-8 bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:border-primary-container transition-all text-left">
                            <div className="w-12 h-12 rounded-lg bg-secondary-container/10 flex items-center justify-center mb-4 group-hover:bg-secondary-container/20 transition-colors">
                                <span className="material-symbols-outlined text-secondary">explore</span>
                            </div>
                            <h3 className="text-lg font-bold text-on-surface mb-1">View All Sandboxes</h3>
                            <p className="text-sm text-on-surface-variant">Manage your existing active deployments.</p>
                        </button>
                        <button className="group flex flex-col items-start p-8 bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:border-primary-container transition-all text-left">
                            <div className="w-12 h-12 rounded-lg bg-outline-variant/10 flex items-center justify-center mb-4 group-hover:bg-outline-variant/20 transition-colors">
                                <span className="material-symbols-outlined text-on-surface-variant">person_add</span>
                            </div>
                            <h3 className="text-lg font-bold text-on-surface mb-1">Invite Team Member</h3>
                            <p className="text-sm text-on-surface-variant">Collaborate with fellow developers.</p>
                        </button>
                    </section>

                    {/* Recent Projects Grid */}
                    <section className="space-y-8">
                        <div className="flex justify-between items-end">
                            <h2 className="text-3xl font-bold text-on-surface">Recent Projects</h2>
                            <Link href="/projects" className="text-primary-container text-xs font-bold tracking-widest hover:underline uppercase">
                                VIEW ALL PROJECTS
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Project Card 1 */}
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:border-primary-container/50 transition-colors cursor-pointer group">
                                <div className="h-24 bg-gradient-to-br from-secondary-container/30 to-surface-container relative">
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#00f0ff 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
                                    <div className="absolute bottom-4 left-4 flex gap-1">
                                        <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[10px] px-2 py-0.5 rounded-full font-bold">HEALTHY</span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">Project Alpha</h4>
                                        <p className="text-xs text-on-surface-variant font-mono">alpha-production.infra</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-outline-variant">
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant tracking-wider">SANDBOXES</p>
                                            <p className="text-sm font-bold text-on-surface">12 Active</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant tracking-wider">UPDATED</p>
                                            <p className="text-sm font-bold text-on-surface">2m ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Card 2 */}
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:border-primary-container/50 transition-colors cursor-pointer group">
                                <div className="h-24 bg-gradient-to-br from-error-container/20 to-surface-container relative">
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffb4ab 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
                                    <div className="absolute bottom-4 left-4 flex gap-1">
                                        <span className="bg-error text-on-error text-[10px] px-2 py-0.5 rounded-full font-bold">ISSUES (2)</span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">Beta Service</h4>
                                        <p className="text-xs text-on-surface-variant font-mono">beta-service.test</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-outline-variant">
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant tracking-wider">SANDBOXES</p>
                                            <p className="text-sm font-bold text-on-surface">5 Active</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant tracking-wider">UPDATED</p>
                                            <p className="text-sm font-bold text-on-surface">14h ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Card 3 */}
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:border-primary-container/50 transition-colors cursor-pointer group">
                                <div className="h-24 bg-gradient-to-br from-primary-container/10 to-surface-container relative">
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#00f0ff 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
                                    <div className="absolute bottom-4 left-4 flex gap-1">
                                        <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[10px] px-2 py-0.5 rounded-full font-bold">HEALTHY</span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">Delta Analytics</h4>
                                        <p className="text-xs text-on-surface-variant font-mono">delta-v3.analytics</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-outline-variant">
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant tracking-wider">SANDBOXES</p>
                                            <p className="text-sm font-bold text-on-surface">3 Active</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant tracking-wider">UPDATED</p>
                                            <p className="text-sm font-bold text-on-surface">2d ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Active Sandboxes Table */}
                    <section className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-bold text-on-surface">Active Sandboxes</h2>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-on-surface-variant">Showing 5 of 20 active</span>
                                <button className="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container rounded-lg">filter_list</button>
                            </div>
                        </div>
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden overflow-x-auto">
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
                                <tbody className="divide-y divide-outline-variant/30">
                                    <tr className="hover:bg-surface-container-low transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#00f0ff]"></div>
                                                <span className="font-bold text-on-surface">auth-v2-dev</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">Project Alpha</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 bg-primary-container/10 text-primary-container px-2 py-1 rounded text-[11px] font-bold">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span> RUNNING
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a className="font-mono text-xs text-primary-fixed-dim hover:underline flex items-center gap-1 w-fit" href="#">
                                                auth-v2.clarity.dev <span className="material-symbols-outlined text-xs">open_in_new</span>
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">Just now</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface">more_vert</button>
                                        </td>
                                    </tr>

                                    <tr className="hover:bg-surface-container-low transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                                <span className="font-bold text-on-surface">payment-gate-test</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">Beta Service</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-[11px] font-bold">
                                                SLEEPING
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a className="font-mono text-xs text-primary-fixed-dim hover:underline flex items-center gap-1 w-fit" href="#">
                                                pay-test.clarity.dev <span className="material-symbols-outlined text-xs">open_in_new</span>
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">45m ago</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface">more_vert</button>
                                        </td>
                                    </tr>

                                    <tr className="hover:bg-surface-container-low transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-tertiary-fixed"></div>
                                                <span className="font-bold text-on-surface">worker-node-4</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">Project Alpha</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 bg-tertiary-container/10 text-tertiary-fixed-dim px-2 py-1 rounded text-[11px] font-bold">
                                                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-bounce"></span> BUILDING
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-outline italic">Provisioning...</span>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">2m ago</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface">more_vert</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>

            {/* Floating Action Button */}
            <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary-container text-on-primary-container shadow-[0_4px_20px_rgba(0,240,255,0.4)] flex items-center justify-center group hover:scale-110 active:scale-95 transition-all z-[60]">
                <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">add</span>
            </button>
        </div>
    );
}
