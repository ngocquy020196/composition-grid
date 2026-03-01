import React from 'react';
import { GridType } from '../types';

interface GridOverlayProps {
    gridType: GridType;
    lineColor: string;
    dotColor: string;
    showDots: boolean;
    dotSize?: number;
    lineSize?: number;
    opacity?: number;
}

const GRID_POSITIONS: Record<GridType, number[]> = {
    thirds: [33.333, 66.667],
    golden: [38.197, 61.803],
};

const GridOverlay: React.FC<GridOverlayProps> = ({
    gridType,
    lineColor,
    dotColor,
    showDots,
    dotSize = 8,
    lineSize = 1,
    opacity = 0.75,
}) => {
    const positions = GRID_POSITIONS[gridType];
    const [p1, p2] = positions;

    const intersections: [number, number][] = [
        [p1, p1],
        [p1, p2],
        [p2, p1],
        [p2, p2],
    ];

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, opacity }}>
            {/* Grid lines SVG */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                }}
            >
                {/* Vertical lines */}
                <line
                    x1={p1}
                    y1={0}
                    x2={p1}
                    y2={100}
                    stroke={lineColor}
                    strokeWidth={lineSize}
                    vectorEffect="non-scaling-stroke"
                />
                <line
                    x1={p2}
                    y1={0}
                    x2={p2}
                    y2={100}
                    stroke={lineColor}
                    strokeWidth={lineSize}
                    vectorEffect="non-scaling-stroke"
                />

                {/* Horizontal lines */}
                <line
                    x1={0}
                    y1={p1}
                    x2={100}
                    y2={p1}
                    stroke={lineColor}
                    strokeWidth={lineSize}
                    vectorEffect="non-scaling-stroke"
                />
                <line
                    x1={0}
                    y1={p2}
                    x2={100}
                    y2={p2}
                    stroke={lineColor}
                    strokeWidth={lineSize}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {/* Intersection dots — rendered as HTML divs to stay perfectly round */}
            {showDots && intersections.map(([cx, cy], i) => (
                <div
                    key={i}
                    className="cg-dot"
                    style={{
                        position: 'absolute',
                        left: `${cx}%`,
                        top: `${cy}%`,
                        width: dotSize,
                        height: dotSize,
                        borderRadius: '50%',
                        backgroundColor: dotColor,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                    }}
                />
            ))}
        </div>
    );
};

export default GridOverlay;
