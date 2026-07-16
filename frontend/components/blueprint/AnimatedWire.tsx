import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export default function AnimatedWire({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: 3,
                    stroke: 'var(--color-primary-fixed)',
                    opacity: 0.6,
                }}
            />
            <BaseEdge
                path={edgePath}
                style={{
                    ...style,
                    strokeWidth: 4,
                    stroke: '#00f0ff',
                    strokeDasharray: '5 10',
                    animation: 'flow 1s linear infinite',
                }}
                className="animated-wire"
            />
        </>
    );
}
