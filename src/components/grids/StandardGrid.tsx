import React, { useMemo } from 'react';
import { LineStyle } from '../../types';
import IntersectionDot from './IntersectionDot';

interface StandardGridProps {
    positions: number[];
    lineColor: string;
    lineSize: number;
    lineStyle: LineStyle;
    dotColor: string;
    showDots: boolean;
    dotSize: number;
}

const StandardGrid: React.FC<StandardGridProps> = ({
    positions,
    lineColor,
    lineSize,
    lineStyle,
    dotColor,
    showDots,
    dotSize,
}) => {
    const dashArray = lineStyle === 'dashed' ? '6 4' : undefined;
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
                <line x1={p1} y1={0} x2={p1} y2={100} stroke={lineColor} strokeWidth={lineSize} vectorEffect="non-scaling-stroke" strokeDasharray={dashArray} />
                <line x1={p2} y1={0} x2={p2} y2={100} stroke={lineColor} strokeWidth={lineSize} vectorEffect="non-scaling-stroke" strokeDasharray={dashArray} />
                <line x1={0} y1={p1} x2={100} y2={p1} stroke={lineColor} strokeWidth={lineSize} vectorEffect="non-scaling-stroke" strokeDasharray={dashArray} />
                <line x1={0} y1={p2} x2={100} y2={p2} stroke={lineColor} strokeWidth={lineSize} vectorEffect="non-scaling-stroke" strokeDasharray={dashArray} />
            </svg>
            {showDots && intersections.map(([cx, cy], i) => (
                <IntersectionDot key={i} cx={cx} cy={cy} dotColor={dotColor} dotSize={dotSize} />
            ))}
        </>
    );
};

export default React.memo(StandardGrid);
