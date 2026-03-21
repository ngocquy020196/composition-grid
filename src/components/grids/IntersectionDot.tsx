import React from 'react';

interface IntersectionDotProps {
    cx: number;
    cy: number;
    dotColor: string;
    dotSize: number;
}

const IntersectionDot: React.FC<IntersectionDotProps> = ({ cx, cy, dotColor, dotSize }) => (
    <div
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
);

export default React.memo(IntersectionDot);
