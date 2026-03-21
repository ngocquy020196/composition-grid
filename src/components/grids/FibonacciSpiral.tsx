import React, { useMemo } from 'react';
import { LineStyle } from '../../types';
import IntersectionDot from './IntersectionDot';

interface FibonacciSpiralProps {
    lineColor: string;
    lineSize: number;
    lineStyle: LineStyle;
    dotColor: string;
    showDots: boolean;
    dotSize: number;
}

const FibonacciSpiral: React.FC<FibonacciSpiralProps> = ({
    lineColor,
    lineSize,
    lineStyle,
    dotColor,
    showDots,
    dotSize,
}) => {
    const dashArray = lineStyle === 'dashed' ? '6 4' : undefined;

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
                        strokeDasharray={dashArray}
                    />
                ))}
                <path
                    d={spiralPath}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth={lineSize * 1.5}
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray={dashArray}
                />
            </svg>
            {showDots && goldenPoints.map(([cx, cy], i) => (
                <IntersectionDot key={i} cx={cx} cy={cy} dotColor={dotColor} dotSize={dotSize} />
            ))}
        </>
    );
};

export default React.memo(FibonacciSpiral);
