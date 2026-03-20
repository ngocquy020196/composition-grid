import React, { useMemo } from 'react';
import { GridType, SpiralOrientation } from '../types';

interface GridOverlayProps {
    gridTypes: GridType[];
    lineColor: string;
    dotColor: string;
    showDots: boolean;
    dotSize?: number;
    lineSize?: number;
    opacity?: number;
    spiralOrientation?: SpiralOrientation;
}

// CSS transforms for 4 spiral orientations
const SPIRAL_TRANSFORMS: Record<SpiralOrientation, string> = {
    0: 'none',           // Default (top-left)
    1: 'scaleX(-1)',     // Flipped horizontally (top-right)
    2: 'scale(-1, -1)',  // Flipped both (bottom-right)
    3: 'scaleY(-1)',     // Flipped vertically (bottom-left)
};

const GRID_POSITIONS: Record<'thirds' | 'golden', number[]> = {
    thirds: [33.333, 66.667],
    golden: [38.197, 61.803],
};

// ─── Standard Grid (Thirds / Golden) ────────────────────────────────────────
const StandardGrid: React.FC<{
    positions: number[];
    lineColor: string;
    lineSize: number;
    dotColor: string;
    showDots: boolean;
    dotSize: number;
}> = ({ positions, lineColor, lineSize, dotColor, showDots, dotSize }) => {
    const [p1, p2] = positions;

    const intersections = useMemo<[number, number][]>(
        () => [[p1, p1], [p1, p2], [p2, p1], [p2, p2]],
        [p1, p2]
    );

    return (
        <>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
                <line x1={p1} y1={0} x2={p1} y2={100} stroke={lineColor} strokeWidth={lineSize} vectorEffect="non-scaling-stroke" />
                <line x1={p2} y1={0} x2={p2} y2={100} stroke={lineColor} strokeWidth={lineSize} vectorEffect="non-scaling-stroke" />
                <line x1={0} y1={p1} x2={100} y2={p1} stroke={lineColor} strokeWidth={lineSize} vectorEffect="non-scaling-stroke" />
                <line x1={0} y1={p2} x2={100} y2={p2} stroke={lineColor} strokeWidth={lineSize} vectorEffect="non-scaling-stroke" />
            </svg>
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
        </>
    );
};

// ─── Fibonacci Spiral ────────────────────────────────────────────────────────
const FibonacciSpiral: React.FC<{
    lineColor: string;
    lineSize: number;
    dotColor: string;
    showDots: boolean;
    dotSize: number;
}> = ({ lineColor, lineSize, dotColor, showDots, dotSize }) => {
    // Use a golden rectangle viewBox (φ:1 ratio = 161.8:100)
    // preserveAspectRatio="none" stretches it to fit the image
    const VW = 161.8;
    const VH = 100;

    const { spiralPath, divisionLines } = useMemo(() => {
        let x = 0, y = 0, w = VW, h = VH;
        const steps = 10;
        const pathParts: string[] = [];
        const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

        for (let i = 0; i < steps; i++) {
            const dir = i % 4;
            let sq: number;
            let toX: number, toY: number;

            switch (dir) {
                case 0: // Cut square from LEFT
                    sq = h;
                    if (i === 0) pathParts.push(`M ${x} ${y + sq}`);
                    toX = x + sq; toY = y;
                    lines.push({ x1: x + sq, y1: y, x2: x + sq, y2: y + h });
                    pathParts.push(`A ${sq} ${sq} 0 0 1 ${toX} ${toY}`);
                    x += sq; w -= sq;
                    break;
                case 1: // Cut square from TOP
                    sq = w;
                    toX = x + sq; toY = y + sq;
                    lines.push({ x1: x, y1: y + sq, x2: x + w, y2: y + sq });
                    pathParts.push(`A ${sq} ${sq} 0 0 1 ${toX} ${toY}`);
                    y += sq; h -= sq;
                    break;
                case 2: // Cut square from RIGHT
                    sq = h;
                    toX = x + w - sq; toY = y + h;
                    lines.push({ x1: x + w - sq, y1: y, x2: x + w - sq, y2: y + h });
                    pathParts.push(`A ${sq} ${sq} 0 0 1 ${toX} ${toY}`);
                    w -= sq;
                    break;
                case 3: // Cut square from BOTTOM
                    sq = w;
                    toX = x; toY = y + h - sq;
                    lines.push({ x1: x, y1: y + h - sq, x2: x + w, y2: y + h - sq });
                    pathParts.push(`A ${sq} ${sq} 0 0 1 ${toX} ${toY}`);
                    h -= sq;
                    break;
            }
        }

        return { spiralPath: pathParts.join(' '), divisionLines: lines };
    }, []);

    // Golden ratio dots (percentage of image dimensions)
    const goldenPoints = useMemo<[number, number][]>(() => [
        [38.2, 38.2], [38.2, 61.8], [61.8, 38.2], [61.8, 61.8],
    ], []);

    return (
        <>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${VW} ${VH}`}
                preserveAspectRatio="none"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
                {divisionLines.map((l, i) => (
                    <line
                        key={`line-${i}`}
                        x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                        stroke={lineColor}
                        strokeWidth={lineSize * 0.5}
                        vectorEffect="non-scaling-stroke"
                        opacity={0.4}
                    />
                ))}
                <path
                    d={spiralPath}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth={lineSize * 1.5}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            {showDots && goldenPoints.map(([cx, cy], i) => (
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
        </>
    );
};

// ─── Golden Triangle ─────────────────────────────────────────────────────────
const GoldenTriangle: React.FC<{
    lineColor: string;
    lineSize: number;
    dotColor: string;
    showDots: boolean;
    dotSize: number;
}> = ({ lineColor, lineSize, dotColor, showDots, dotSize }) => {
    // Main diagonal + perpendicular lines from opposite corners
    // Creates the "golden triangle" / "dynamic symmetry" composition guide

    // Key intersection points (in percentages)
    const intersections = useMemo<[number, number][]>(() => {
        // Intersection of perpendicular from top-right corner to the main diagonal
        // For a rectangle with aspect ratio ~3:2, the key points are:
        // Main diagonal: (0,100) to (100,0)
        // Perpendicular from (100,100): meets diagonal at ~(50, 50)
        // Perpendicular from (0,0): meets diagonal at ~(50, 50)
        // For exact: perpendicular from (100,100) to line y = -x + 100 → (50,50)
        // Perpendicular from (0,0) to line y = -x + 100 → (50,50)
        // Center intersection point where all diagonals meet
        return [
            [50, 50],
        ];
    }, []);

    return (
        <>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
                {/* Main diagonal: bottom-left to top-right */}
                <line
                    x1={0} y1={100} x2={100} y2={0}
                    stroke={lineColor}
                    strokeWidth={lineSize}
                    vectorEffect="non-scaling-stroke"
                />
                {/* Secondary diagonal: top-left to bottom-right */}
                <line
                    x1={0} y1={0} x2={100} y2={100}
                    stroke={lineColor}
                    strokeWidth={lineSize}
                    vectorEffect="non-scaling-stroke"
                    opacity={0.5}
                />
                {/* Perpendicular from top-left to main diagonal */}
                <line
                    x1={0} y1={0} x2={50} y2={50}
                    stroke={lineColor}
                    strokeWidth={lineSize * 0.8}
                    vectorEffect="non-scaling-stroke"
                    opacity={0.7}
                />
                {/* Perpendicular from bottom-right to secondary diagonal */}
                <line
                    x1={100} y1={100} x2={50} y2={50}
                    stroke={lineColor}
                    strokeWidth={lineSize * 0.8}
                    vectorEffect="non-scaling-stroke"
                    opacity={0.7}
                />
                {/* Perpendicular from top-right to main diagonal */}
                <line
                    x1={100} y1={0} x2={50} y2={50}
                    stroke={lineColor}
                    strokeWidth={lineSize * 0.8}
                    vectorEffect="non-scaling-stroke"
                    opacity={0.6}
                />
                {/* Perpendicular from bottom-left to secondary diagonal */}
                <line
                    x1={0} y1={100} x2={50} y2={50}
                    stroke={lineColor}
                    strokeWidth={lineSize * 0.8}
                    vectorEffect="non-scaling-stroke"
                    opacity={0.6}
                />
            </svg>
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
        </>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const GridOverlay: React.FC<GridOverlayProps> = ({
    gridTypes,
    lineColor,
    dotColor,
    showDots,
    dotSize = 8,
    lineSize = 1,
    opacity = 0.75,
    spiralOrientation = 0,
}) => {
    const renderGrid = (type: GridType) => {
        switch (type) {
            case 'thirds':
            case 'golden':
                return (
                    <StandardGrid
                        positions={GRID_POSITIONS[type]}
                        lineColor={lineColor}
                        lineSize={lineSize}
                        dotColor={dotColor}
                        showDots={showDots}
                        dotSize={dotSize}
                    />
                );
            case 'fibonacci':
                return (
                    <div style={{ width: '100%', height: '100%', transform: SPIRAL_TRANSFORMS[spiralOrientation] }}>
                        <FibonacciSpiral
                            lineColor={lineColor}
                            lineSize={lineSize}
                            dotColor={dotColor}
                            showDots={showDots}
                            dotSize={dotSize}
                        />
                    </div>
                );
            case 'triangle':
                return (
                    <GoldenTriangle
                        lineColor={lineColor}
                        lineSize={lineSize}
                        dotColor={dotColor}
                        showDots={showDots}
                        dotSize={dotSize}
                    />
                );
        }
    };

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, opacity }}>
            {gridTypes.map((type) => (
                <React.Fragment key={type}>{renderGrid(type)}</React.Fragment>
            ))}
        </div>
    );
};

export default React.memo(GridOverlay);
