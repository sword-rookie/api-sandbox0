import React, { useState, useEffect } from 'react';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectNode: (type: string, title: string, color: string, icon: string, inputs: string[], outputs: string[]) => void;
}

const nodeTypes = [
    { type: 'execution', title: 'HTTP Request', color: '#00f0ff', icon: 'http', inputs: ['Trigger'], outputs: ['Success', 'Failure', 'Response'] },
    { type: 'execution', title: 'Branch', color: '#ff00ff', icon: 'call_split', inputs: ['In'], outputs: ['True', 'False'] },
    { type: 'execution', title: 'Database Query', color: '#f0ff00', icon: 'database', inputs: ['Execute'], outputs: ['Result', 'Error'] },
    { type: 'execution', title: 'Cache Set', color: '#00ffaa', icon: 'memory', inputs: ['Set'], outputs: ['Done'] },
    { type: 'execution', title: 'Response', color: '#ff5555', icon: 'send', inputs: ['Send'], outputs: [] },
    { type: 'data', title: 'JSON Parse', color: '#aaaaaa', icon: 'code', inputs: ['String'], outputs: ['JSON'] }
];

export default function CommandPalette({ isOpen, onClose, onSelectNode }: CommandPaletteProps) {
    const [search, setSearch] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                if (!isOpen) onClose(); // It's handled by parent, but we can call onClose to toggle if we want
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filteredNodes = nodeTypes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="w-[500px] bg-surface-container-low border border-outline rounded-xl shadow-2xl overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-outline flex items-center gap-3 bg-surface-container">
                    <span className="material-symbols-outlined text-on-surface-variant">search</span>
                    <input 
                        type="text" 
                        autoFocus
                        placeholder="Search nodes... (HTTP, DB, Cache)" 
                        className="bg-transparent border-none outline-none text-on-surface w-full font-mono text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                    {filteredNodes.length > 0 ? (
                        filteredNodes.map((node, idx) => (
                            <button
                                key={idx}
                                className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-high transition-colors group"
                                onClick={() => {
                                    onSelectNode(node.type, node.title, node.color, node.icon, node.inputs, node.outputs);
                                    setSearch('');
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ color: node.color }}>{node.icon}</span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-on-surface group-hover:text-primary-fixed transition-colors">{node.title}</span>
                                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">{node.type} Node</span>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center text-on-surface-variant text-sm font-mono">No nodes found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
