'use client'

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

const InteractiveNetworkCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width: number;
        let height: number;
        let nodes: {x: number, y: number, vx: number, vy: number, radius: number}[] = [];
        const nodeCount = 35; // Denser network

        const initNodes = () => {
            nodes = [];
            for (let i = 0; i < nodeCount; i++) {
                nodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: (Math.random() - 0.5) * 1.2,
                    radius: Math.random() * 2 + 1
                });
            }
        };

        const resize = () => {
            if (!canvas.parentElement) return;
            width = canvas.width = canvas.parentElement.offsetWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
            initNodes();
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.lineWidth = 1;

            // Update and draw connections
            for (let i = 0; i < nodes.length; i++) {
                let n1 = nodes[i];
                n1.x += n1.vx;
                n1.y += n1.vy;

                // Bounce
                if (n1.x < 0 || n1.x > width) n1.vx *= -1;
                if (n1.y < 0 || n1.y > height) n1.vy *= -1;

                ctx.beginPath();
                ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#00f0ff';
                ctx.fill();

                // Connect nodes to each other
                for (let j = i + 1; j < nodes.length; j++) {
                    let n2 = nodes[j];
                    let dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 - dist/150 * 0.15})`;
                        ctx.stroke();
                    }
                }

                // Connect to mouse
                const mouseDist = Math.hypot(n1.x - mouseRef.current.x, n1.y - mouseRef.current.y);
                if (mouseDist < 250) {
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 - mouseDist/250 * 0.4})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.lineWidth = 1;
                }
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        
        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        window.addEventListener('resize', resize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full z-0 cursor-crosshair"
        />
    );
};

export default function LoginPage() {
    return (
        <div className="bg-background text-on-surface min-h-screen selection:bg-primary-container/30">
            <style jsx global>{`
                .blueprint-bg {
                    background-image: radial-gradient(circle at 2px 2px, rgba(0, 219, 233, 0.05) 1px, transparent 0);
                    background-size: 40px 40px;
                }
                .glow-effect {
                    box-shadow: 0 0 20px rgba(0, 240, 255, 0.15);
                }
            `}</style>
            <main className="flex min-h-screen overflow-hidden">
                {/* Left Side: Visual Experience (55%) */}
                <section className="hidden lg:flex lg:w-[55%] relative flex-col justify-center items-center p-16 bg-surface-container-lowest overflow-hidden border-r border-outline-variant/30">
                    {/* Animated Background Canvas */}
                    <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,219,233,0.05),transparent_70%)]">
                        <InteractiveNetworkCanvas />
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-center max-w-[36rem] mx-auto">
                        <h1 className="text-5xl font-bold text-on-surface mb-6 tracking-tighter">
                            Welcome Back
                        </h1>
                        <p className="text-lg text-on-surface-variant mb-16">
                            Build faster with isolated sandboxes. Deploy, test, and scale with infrastructure that feels like magic.
                        </p>
                        
                        {/* Micro-Graphic: Floating Node */}
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-surface-container-high border border-primary-fixed-dim/20 glow-effect animate-pulse">
                            <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
                            <span className="font-mono text-sm text-primary-fixed-dim">SANDBOX_ID: CLARITY_BETA_01</span>
                        </div>
                    </div>
                    
                    {/* Trusted Footer */}
                    <div className="absolute bottom-8 left-0 w-full text-center px-10">
                        <p className="text-xs text-outline uppercase tracking-[0.2em] font-bold">
                            Trusted by developers shipping 10x faster
                        </p>
                    </div>
                </section>

                {/* Right Side: Login Form (45%) */}
                <section className="w-full lg:w-[45%] flex flex-col justify-center items-center px-4 md:px-10 py-16 bg-surface relative">
                    <div className="w-full max-w-[420px]">
                        {/* Brand Header */}
                        <div className="mb-16 text-center">
                            <Link href="/" className="inline-flex items-center gap-1 mb-6 hover:opacity-80 transition-opacity">
                                <span className="material-symbols-outlined text-primary-fixed-dim text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
                                <span className="text-2xl font-bold text-primary-fixed-dim tracking-tight">Clarity Machine</span>
                            </Link>
                            <h2 className="text-3xl font-bold text-on-surface mb-1">
                                Sign in to your workspace
                            </h2>
                            <p className="text-base text-on-surface-variant">
                                Access your projects and sandboxes
                            </p>
                        </div>
                        
                        {/* Form */}
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); window.location.href = '/dashboard'; }}>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest" htmlFor="email">Email Address</label>
                                <div className="relative group">
                                    <input 
                                        className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-6 py-4 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none" 
                                        id="email" 
                                        name="email" 
                                        placeholder="name@company.com" 
                                        type="email" 
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="password">Password</label>
                                    <a className="text-xs font-bold text-primary-fixed-dim hover:underline uppercase tracking-widest" href="#">Forgot Password?</a>
                                </div>
                                <div className="relative group">
                                    <input 
                                        className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-6 py-4 text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none" 
                                        id="password" 
                                        name="password" 
                                        placeholder="••••••••" 
                                        type="password" 
                                        required 
                                    />
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface" type="button">
                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                    </button>
                                </div>
                            </div>
                            
                            <button className="w-full bg-primary-container text-on-primary font-bold py-4 rounded-lg glow-effect hover:opacity-90 active:scale-95 transition-all duration-200 text-lg" type="submit">
                                Sign In
                            </button>
                        </form>
                        
                        {/* Divider */}
                        <div className="relative my-12 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-outline-variant/30"></span>
                            </div>
                            <span className="relative px-6 bg-surface text-xs font-bold text-outline uppercase tracking-widest">Or continue with</span>
                        </div>
                        
                        {/* Social Logins */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 bg-surface-container-low border border-outline-variant/50 py-4 rounded-lg hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
                                <svg className="w-5 h-5" viewBox="0 0 48 48">
                                    <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335"></path>
                                    <path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#4285F4"></path>
                                    <path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05"></path>
                                    <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853"></path>
                                </svg>
                                <span className="font-bold text-on-surface text-sm uppercase tracking-wider">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-surface-container-low border border-outline-variant/50 py-4 rounded-lg hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
                                <svg className="w-5 h-5 fill-current text-on-surface" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                                </svg>
                                <span className="font-bold text-on-surface text-sm uppercase tracking-wider">GitHub</span>
                            </button>
                        </div>
                        
                        {/* Bottom Link */}
                        <div className="mt-16 text-center">
                            <p className="text-base text-on-surface-variant">
                                Don't have an account?{' '}
                                <Link className="text-primary-fixed-dim font-semibold hover:underline" href="/signup">Sign up</Link>
                            </p>
                        </div>
                    </div>
                    
                    {/* Mobile Footer (Internal) */}
                    <div className="lg:hidden mt-auto pt-16 text-center">
                        <p className="text-xs font-bold text-outline opacity-50 uppercase tracking-widest">
                            © 2026 Clarity Machine
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
