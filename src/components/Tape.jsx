import { useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Tape — infinite-scrolling tape component using Framer Motion
// The head stays fixed in the centre; the tape slides beneath it.
// ─────────────────────────────────────────────────────────────────────────────

const CELL_SIZE = 64; // px width of each tape cell
const VISIBLE_CELLS = 17; // number of cells to render (odd for symmetry)
const HALF = Math.floor(VISIBLE_CELLS / 2);

const CELL_PALETTE = {
  blank: {
    bg: 'bg-bg-secondary',
    border: 'border-border',
    text: 'text-gray-600',
  },
  filled: {
    bg: 'bg-bg-elevated',
    border: 'border-border-bright',
    text: 'text-gray-200',
  },
  active: {
    bg: 'bg-accent-blue/10',
    border: 'border-accent-blue',
    text: 'text-accent-blue',
  },
  justWritten: {
    bg: 'bg-accent-purple/10',
    border: 'border-accent-purple',
    text: 'text-accent-purple',
  },
};

function TapeCell({ symbol, isActive, isBlank, index, justWritten }) {
  const palette = isActive ? CELL_PALETTE.active
    : justWritten ? CELL_PALETTE.justWritten
    : isBlank ? CELL_PALETTE.blank
    : CELL_PALETTE.filled;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        relative flex items-center justify-center
        w-16 h-16 flex-shrink-0
        border-2 rounded-lg
        font-mono font-bold text-2xl
        select-none cursor-default
        transition-colors duration-200
        ${palette.bg} ${palette.border} ${palette.text}
        ${isActive ? 'tape-cell-active shadow-lg' : ''}
      `}
      style={{ minWidth: CELL_SIZE, maxWidth: CELL_SIZE }}
    >
      {/* Cell index label */}
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-gray-700 font-mono">
        {index}
      </span>
      {/* Symbol */}
      <span className={isBlank ? 'opacity-20' : ''}>{symbol}</span>

      {/* Active glow ring */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-accent-blue/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}

export default function Tape({ tape, headPos, blankSymbol, lastWrittenPos }) {
  const tapeX = useMotionValue(0);

  // Animate tape sliding when head moves
  useEffect(() => {
    const targetX = -headPos * CELL_SIZE;
    const controls = animate(tapeX, targetX, {
      type: 'spring',
      stiffness: 200,
      damping: 30,
      mass: 0.8,
    });
    return controls.stop;
  }, [headPos, tapeX]);

  // Compute range of cells to render
  const cellRange = useMemo(() => {
    const cells = [];
    for (let i = headPos - HALF - 2; i <= headPos + HALF + 2; i++) {
      cells.push(i);
    }
    return cells;
  }, [headPos]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Read/Write Head indicator */}
      <div className="flex flex-col items-center gap-1">
        <div className="head-arrow">
          <motion.div
            className="flex flex-col items-center"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="text-accent-blue text-xs font-mono font-semibold tracking-widest uppercase mb-1 opacity-80">
              Head
            </div>
            {/* Downward arrow */}
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
              <path d="M10 0 L10 10 M10 10 L4 4 M10 10 L16 4" stroke="#4f8ef7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 16 L10 10" stroke="#4f8ef7" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Tape viewport */}
      <div
        className="relative overflow-hidden w-full"
        style={{ height: CELL_SIZE + 32 }}
      >
        {/* Center marker line */}
        <div
          className="absolute top-0 bottom-8 w-px bg-accent-blue/30 z-10 pointer-events-none"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />

        {/* Edge fade masks */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />

        {/* Sliding tape */}
        <motion.div
          className="absolute flex items-start gap-2 top-0"
          style={{
            x: tapeX,
            left: `calc(50% - ${CELL_SIZE / 2}px)`,
          }}
        >
          {cellRange.map((pos) => {
            const sym = tape.get(pos) ?? blankSymbol;
            const isBlank = sym === blankSymbol;
            const isActive = pos === headPos;
            const justWritten = pos === lastWrittenPos && pos !== headPos;

            return (
              <TapeCell
                key={pos}
                symbol={sym}
                isActive={isActive}
                isBlank={isBlank}
                index={pos}
                justWritten={justWritten}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Tape info bar */}
      <div className="flex items-center gap-6 text-xs text-gray-500 font-mono">
        <span>Head @ <span className="text-accent-blue font-semibold">{headPos}</span></span>
        <span className="w-px h-4 bg-border-subtle" />
        <span>Reading: <span className="text-accent-cyan font-semibold">"{tape.get(headPos) ?? blankSymbol}"</span></span>
        <span className="w-px h-4 bg-border-subtle" />
        <span>Cells used: <span className="text-gray-400">{tape.size}</span></span>
      </div>
    </div>
  );
}
