import React from 'react';
import { GridType, LineStyle, SpiralOrientation } from '../types';
import { StandardGrid, FibonacciSpiral, GoldenTriangle } from './grids';

interface GridOverlayProps {
    gridTypes: GridType[];
    lineColor: string;
    dotColor: string;
    showDots: boolean;
    dotSize?: number;
    lineSize?: number;
    lineStyle?: LineStyle;
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

const GridOverlay: React.FC<GridOverlayProps> = ({
    gridTypes,
    lineColor,
    dotColor,
    showDots,
    dotSize = 8,
    lineSize = 1,
    lineStyle = 'solid',
    opacity = 0.75,
    spiralOrientation = 0,
}) => {
    const renderGrid = (type: GridType) => {
        const commonProps = { lineColor, lineSize, lineStyle, dotColor, showDots, dotSize };

        switch (type) {
            case 'thirds':
            case 'golden':
                return <StandardGrid positions={GRID_POSITIONS[type]} {...commonProps} />;
            case 'fibonacci':
                return (
                    <div style={{ width: '100%', height: '100%', transform: SPIRAL_TRANSFORMS[spiralOrientation] }}>
                        <FibonacciSpiral {...commonProps} />
                    </div>
                );
            case 'triangle':
                return <GoldenTriangle {...commonProps} />;
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
