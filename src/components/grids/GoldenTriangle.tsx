import React, { useMemo } from 'react';
import { LineStyle } from '../../types';
import IntersectionDot from './IntersectionDot';

interface GoldenTriangleProps {
    lineColor: string;
    lineSize: number;
    lineStyle: LineStyle;
    dotColor: string;
    showDots: boolean;
    dotSize: number;
}

const GoldenTriangle: React.FC<GoldenTriangleProps> = ({
    lineColor,
    lineSize,
    lineStyle,
    dotColor,
    showDots,
    dotSize,
}) => {
    const dashArray = lineStyle === 'dashed' ? '6 4' : undefined;

    // Key intersection points (in percentages)
    const intersections = useMemo<[number, number][]>(() => {
        return [[50, 50]];
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
                    strokeDasharray={dashArray}
                />
                {/* Secondary diagonal: top-left to bottom-right */}
                <line
                    x1={0} y1={0} x2={100} y2={100}
                    stroke={lineColor}
                    strokeWidth={lineSize}
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray={dashArray}
                    opacity={0.5}
                />
                {/* Perpendicular from top-left to main diagonal */}
                <line
                    x1={0} y1={0} x2={50} y2={50}
                    stroke={lineColor}
                    strokeWidth={lineSize * 0.8}
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray={dashArray}
                    opacity={0.7}
                />
                {/* Perpendicular from bottom-right to secondary diagonal */}
                <line
                    x1={100} y1={100} x2={50} y2={50}
                    stroke={lineColor}
                    strokeWidth={lineSize * 0.8}
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray={dashArray}
                    opacity={0.7}
                />
                {/* Perpendicular from top-right to main diagonal */}
                <line
                    x1={100} y1={0} x2={50} y2={50}
                    stroke={lineColor}
                    strokeWidth={lineSize * 0.8}
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray={dashArray}
                    opacity={0.6}
                />
                {/* Perpendicular from bottom-left to secondary diagonal */}
                <line
                    x1={0} y1={100} x2={50} y2={50}
                    stroke={lineColor}
                    strokeWidth={lineSize * 0.8}
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray={dashArray}
                    opacity={0.6}
                />
            </svg>
            {showDots && intersections.map(([cx, cy], i) => (
                <IntersectionDot key={i} cx={cx} cy={cy} dotColor={dotColor} dotSize={dotSize} />
            ))}
        </>
    );
};

export default React.memo(GoldenTriangle);
