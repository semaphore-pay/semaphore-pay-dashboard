'use client';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export const BackgroundRippleEffect = ({
  cellSize = 56, // Removed hardcoded rows/cols from props
}: {
  cellSize?: number;
}) => {
  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);

  // State to hold dynamic dimensions
  const [dimensions, setDimensions] = useState({ rows: 8, cols: 27 });
  const [isMounted, setIsMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Calculate the exact amount of boxes needed to fill the screen
  useEffect(() => {
    setIsMounted(true);
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        setDimensions({
          // Math.ceil rounds up. We add +2 to ensure it bleeds slightly off-screen
          // so there are no empty gaps at the very edges when resizing.
          cols: Math.ceil(window.innerWidth / cellSize) + 2,
          rows: Math.ceil(window.innerHeight / cellSize) + 2,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [cellSize]);

  // Prevent hydration mismatch on the first render in Next.js
  if (!isMounted) return null;

  return (
    <div
      ref={ref}
      // Added flex, items-center, justify-center, and overflow-hidden to ensure it spans properly
      className={cn(
        'absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden',
        // Your colors are completely untouched
        '[--cell-border-color:var(--color-neutral-300)] [--cell-fill-color:var(--color-neutral-100)] [--cell-shadow-color:var(--color-neutral-500)]',
        'dark:[--cell-border-color:var(--color-neutral-700)] dark:[--cell-fill-color:var(--color-neutral-900)] dark:[--cell-shadow-color:var(--color-neutral-800)]'
      )}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-2 h-full w-full overflow-hidden" />
        <DivGrid
          key={`base-${rippleKey}`}
          className="mask-radial-from-20% mask-radial-at-top opacity-600"
          // Pass the dynamically calculated dimensions here
          rows={dimensions.rows}
          cols={dimensions.cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col });
            setRippleKey(k => k + 1);
          }}
          interactive
        />
      </div>
    </div>
  );
};
type DivGridProps = {
  className?: string;
  rows: number;
  cols: number;
  cellSize: number; // in pixels
  borderColor: string;
  fillColor: string;
  clickedCell: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
};

type CellStyle = React.CSSProperties & {
  ['--delay']?: string;
  ['--duration']?: string;
};

const DivGrid = ({
  className,
  rows = 7,
  cols = 30,
  cellSize = 56,
  borderColor = '#3f3f46',
  fillColor = 'rgba(14,165,233,0.3)',
  clickedCell = null,
  onCellClick = () => {},
  interactive = true,
}: DivGridProps) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols]
  );

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: 'auto',
  };

  return (
    <div className={cn('relative z-3', className)} style={gridStyle}>
      {cells.map(idx => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0;
        const delay = clickedCell ? Math.max(0, distance * 55) : 0; // ms
        const duration = 200 + distance * 80; // ms

        const style: CellStyle = clickedCell
          ? {
              '--delay': `${delay}ms`,
              '--duration': `${duration}ms`,
            }
          : {};

        return (
          <div
            key={idx}
            className={cn(
              'cell relative border-[0.5px] opacity-40 transition-opacity duration-150 will-change-transform hover:opacity-80 dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]',
              clickedCell && 'animate-cell-ripple fill-mode-[none]',
              !interactive && 'pointer-events-none'
            )}
            style={{
              backgroundColor: fillColor,
              borderColor: borderColor,
              ...style,
            }}
            onClick={
              interactive ? () => onCellClick?.(rowIdx, colIdx) : undefined
            }
          />
        );
      })}
    </div>
  );
};
