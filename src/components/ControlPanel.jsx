import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, SkipForward, RotateCcw, Undo2,
  FastForward, Gauge, ChevronRight,
} from 'lucide-react';
import { MACHINE_STATUS } from '../hooks/useTuringMachine';

// ─────────────────────────────────────────────────────────────────────────────
// ControlPanel — Playback controls, input configuration, and speed slider
// ─────────────────────────────────────────────────────────────────────────────

const SPEED_OPTIONS = [
  { label: '0.5×', value: 1200 },
  { label: '1×', value: 600 },
  { label: '2×', value: 300 },
  { label: '4×', value: 100 },
  { label: '8×', value: 50 },
];

export default function ControlPanel({
  status,
  steps,
  initialTape,
  setInitialTape,
  initialState,
  setInitialState,
  speed,
  changeSpeed,
  step,
  play,
  pause,
  reset,
  undo,
  historyLength,
}) {
  const [localTape, setLocalTape] = useState(initialTape);
  const [localState, setLocalState] = useState(initialState);

  const isRunning = status === MACHINE_STATUS.RUNNING;
  const isTerminal = status === MACHINE_STATUS.ACCEPTED || status === MACHINE_STATUS.REJECTED;
  const canStep = !isRunning && !isTerminal;
  const canUndo = historyLength > 0 && !isRunning;

  const handleReset = () => {
    setInitialTape(localTape);
    setInitialState(localState);
    reset(localTape, localState);
  };

  const handlePlayPause = () => {
    if (isRunning) pause();
    else play();
  };

  const currentSpeedLabel = SPEED_OPTIONS.find(s => s.value === speed)?.label ?? '1×';

  return (
    <div className="glass-panel p-5 flex flex-col gap-5">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
        <Gauge size={14} className="text-accent-blue" />
        Controls
      </h3>

      {/* Input configuration row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 font-medium">Input Tape</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={localTape}
              onChange={e => setLocalTape(e.target.value)}
              placeholder="e.g. 1011"
              className="input-field flex-1 min-w-0"
              disabled={isRunning}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 font-medium">Initial State</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={localState}
              onChange={e => setLocalState(e.target.value)}
              placeholder="q0"
              className="input-field flex-1 min-w-0"
              disabled={isRunning}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="btn-secondary flex items-center gap-1.5 whitespace-nowrap"
              title="Load input and reset"
              disabled={isRunning}
            >
              <RotateCcw size={14} />
              Reset
            </motion.button>
          </div>
        </div>
      </div>

      {/* Playback buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Undo */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={undo}
          disabled={!canUndo}
          className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo last step"
        >
          <Undo2 size={15} />
          Undo
        </motion.button>

        {/* Step */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={step}
          disabled={!canStep}
          className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          title="Advance one step"
        >
          <SkipForward size={15} />
          Step
        </motion.button>

        {/* Play / Pause */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={handlePlayPause}
          disabled={isTerminal}
          className={`btn-primary disabled:opacity-40 disabled:cursor-not-allowed min-w-[100px] justify-center
            ${isRunning ? 'bg-accent-amber hover:brightness-105 shadow-none' : ''}`}
          title={isRunning ? 'Pause' : 'Play'}
        >
          {isRunning ? (
            <>
              <Pause size={15} />
              Pause
            </>
          ) : (
            <>
              <Play size={15} />
              Play
            </>
          )}
        </motion.button>

        {/* Speed selector */}
        <div className="flex items-center gap-2 ml-auto">
          <FastForward size={13} className="text-gray-500" />
          <div className="flex rounded-lg overflow-hidden border border-border">
            {SPEED_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => changeSpeed(opt.value)}
                className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors
                  ${speed === opt.value
                    ? 'bg-accent-blue/20 text-accent-blue border-x border-accent-blue/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-bg-elevated'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step counter bar */}
      <div className="flex items-center gap-3 text-xs text-gray-600">
        <ChevronRight size={12} />
        <span>{steps} step{steps !== 1 ? 's' : ''} executed</span>
        {historyLength > 0 && (
          <span className="text-gray-700"> · {historyLength} step{historyLength !== 1 ? 's' : ''} in history</span>
        )}
      </div>
    </div>
  );
}
