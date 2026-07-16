import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface BlueprintNodeProps {
    data: {
        title: string;
        type: string;
        icon?: string;
        color?: string;
        inputs?: string[];
        outputs?: string[];
    };
    selected?: boolean;
}

export default function BlueprintNode({ data, selected }: BlueprintNodeProps) {
    // Dynamic color based on node category, defaulting to a cybernetic blue
    const color = data.color || '#00f0ff';
    const isExecution = data.type === 'execution';

    return (
        <div className={`relative min-w-[220px] rounded-xl border border-outline bg-surface-container-low shadow-xl transition-all duration-200
            ${selected ? 'ring-2 ring-primary-fixed shadow-[0_0_15px_rgba(0,240,255,0.4)]' : ''}`}
        >
            {/* Gradient Header */}
            <div className="flex items-center gap-2 rounded-t-xl px-4 py-2 border-b border-outline"
                style={{
                    background: `linear-gradient(to right, ${color}22, transparent)`,
                    borderTop: `2px solid ${color}`
                }}
            >
                <span className="material-symbols-outlined text-sm" style={{ color }}>
                    {data.icon || 'settings'}
                </span>
                <span className="font-bold text-sm tracking-wide text-on-surface">
                    {data.title}
                </span>
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col gap-3 bg-surface-container-lowest rounded-b-xl">
                
                {/* Inputs */}
                <div className="flex flex-col gap-2">
                    {data.inputs?.map((input, idx) => (
                        <div key={idx} className="relative flex items-center justify-start min-h-[20px]">
                            <span className="text-xs font-mono text-on-surface-variant ml-2">{input}</span>
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={`in-${input}`}
                                style={{
                                    left: -20,
                                    width: isExecution ? 14 : 12,
                                    height: isExecution ? 14 : 12,
                                    background: 'var(--color-surface-container)',
                                    border: `2px solid ${color}`,
                                    borderRadius: isExecution ? '0' : '50%',
                                    transform: isExecution ? 'rotate(45deg)' : 'none',
                                    zIndex: 10
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Outputs */}
                <div className="flex flex-col gap-2">
                    {data.outputs?.map((output, idx) => (
                        <div key={idx} className="relative flex items-center justify-end min-h-[20px]">
                            <span className="text-xs font-mono text-on-surface-variant mr-2">{output}</span>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`out-${output}`}
                                style={{
                                    right: -20,
                                    width: isExecution ? 14 : 12,
                                    height: isExecution ? 14 : 12,
                                    background: 'var(--color-surface-container)',
                                    border: `2px solid ${color}`,
                                    borderRadius: isExecution ? '0' : '50%',
                                    transform: isExecution ? 'rotate(45deg)' : 'none',
                                    zIndex: 10
                                }}
                            />
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
