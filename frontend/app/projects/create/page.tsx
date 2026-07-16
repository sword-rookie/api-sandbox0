'use client'

import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import TopNavBar from '../../../components/TopNavBar';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import BlueprintNode from '../../../components/blueprint/BlueprintNode';
import AnimatedWire from '../../../components/blueprint/AnimatedWire';
import CommandPalette from '../../../components/blueprint/CommandPalette';

const nodeTypes = {
    blueprint: BlueprintNode
};

const edgeTypes = {
    animatedWire: AnimatedWire
};

export default function CreateProjectPage() {
    return (
        <ReactFlowProvider>
            <Suspense fallback={<div className="bg-background min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-fixed border-t-transparent rounded-full animate-spin"></div></div>}>
                <CreateProjectEditor />
            </Suspense>
        </ReactFlowProvider>
    );
}

function CreateProjectEditor() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [projectName, setProjectName] = useState('Untitled Project');
    const [projectId, setProjectId] = useState<string | null>(searchParams.get('id'));
    const [isSaving, setIsSaving] = useState(false);
    
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [palettePosition, setPalettePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (!projectId || !user) return;
        
        const fetchProject = async () => {
            const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
            try {
                const res = await fetch(`${apiURL}/api/projects/${projectId}`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setProjectName(data.name || 'Untitled Project');
                    if (data.blueprint_schema) {
                        setNodes(data.blueprint_schema.nodes || []);
                        setEdges(data.blueprint_schema.edges || []);
                    }
                }
            } catch (err) {
                console.error("Failed to load project:", err);
            }
        };
        fetchProject();
    }, [projectId, user, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, type: 'animatedWire' }, eds)),
        [setEdges]
    );

    const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        setPalettePosition({ x: event.clientX, y: event.clientY });
        setPaletteOpen(true);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                setPalettePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
                setPaletteOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const spawnNode = (type: string, title: string, color: string, icon: string, inputs: string[], outputs: string[]) => {
        const newNode = {
            id: `node_${Date.now()}`,
            type: 'blueprint',
            position: { x: palettePosition.x - 200, y: palettePosition.y - 100 }, // approximate offset
            data: { title, type, color, icon, inputs, outputs }
        };
        setNodes((nds) => nds.concat(newNode));
        setPaletteOpen(false);
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        const blueprintSchema = { nodes, edges };
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
        
        try {
            if (!projectId) {
                // Create new project
                const res = await fetch(`${apiURL}/api/projects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        name: projectName,
                        description: 'Draft project from visual builder',
                        blueprint_schema: blueprintSchema
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    setProjectId(data.id);
                    // Update URL without reloading to reflect new ID
                    window.history.replaceState(null, '', `/projects/create?id=${data.id}`);
                } else {
                    console.error("Failed to save draft");
                }
            } else {
                // Update existing project
                const res = await fetch(`${apiURL}/api/projects/${projectId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        name: projectName,
                        blueprint_schema: blueprintSchema
                    })
                });
                
                if (!res.ok) {
                    console.error("Failed to update draft");
                }
            }
        } catch (error) {
            console.error("Error saving draft:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !user) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-fixed border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-background text-on-surface font-sans h-screen flex flex-col overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
            <TopNavBar />
            
            {/* Editor Toolbar */}
            <div className="h-14 border-b border-outline-variant bg-surface-container flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/projects')} className="material-symbols-outlined text-on-surface-variant hover:text-primary-fixed transition-colors">
                        arrow_back
                    </button>
                    <input 
                        type="text" 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="bg-transparent border-none outline-none font-bold text-lg text-on-surface w-64 hover:bg-surface-container-high focus:bg-surface-container-high px-2 py-1 rounded transition-colors"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-on-surface-variant">Press Right-Click or CTRL+P to add nodes</span>
                    <button 
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-1.5 bg-surface-container-high border border-outline text-on-surface text-sm font-bold rounded-lg hover:bg-primary-fixed hover:text-on-primary-fixed hover:border-primary-fixed transition-all disabled:opacity-50"
                    >
                        {isSaving ? (
                            <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">save</span>
                        )}
                        Save Draft
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onPaneContextMenu={onPaneContextMenu}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={{ type: 'animatedWire' }}
                    fitView
                    className="bg-background"
                >
                    <Background color="#3a3939" gap={40} size={1} />
                    <Controls className="bg-surface-container border-outline fill-on-surface" />
                    <MiniMap 
                        nodeColor={(node) => {
                            return node.data?.color as string || '#00f0ff';
                        }}
                        maskColor="rgba(19, 19, 19, 0.7)"
                        className="bg-surface-container-lowest border border-outline rounded-lg shadow-xl"
                    />
                </ReactFlow>

                <CommandPalette 
                    isOpen={paletteOpen} 
                    onClose={() => setPaletteOpen(false)} 
                    onSelectNode={spawnNode} 
                />
            </div>
        </div>
    );
}
