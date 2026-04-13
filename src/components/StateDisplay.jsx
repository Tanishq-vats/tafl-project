import { motion, AnimatePresence } from 'framer-motion';
import { MACHINE_STATUS } from '../hooks/useTuringMachine';

// ─────────────────────────────────────────────────────────────────────────────
// StateDisplay — Shows the current machine state and computation status
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  [MACHINE_STATUS.IDLE]: {
    label: 'Idle',
    color: 'text-gray-400',
    borderColor: 'border-gray-600',
    bgColor: 'bg-gray-600/10',
    glow: '',
    dot: 'bg-gray-500',
  },
  [MACHINE_STATUS.RUNNING]: {
    label: 'Running',
    color: 'text-accent-green',
    borderColor: 'border-accent-green/50',
    bgColor: 'bg-accent-green/10',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]',
    dot: 'bg-accent-green animate-pulse',
  },
  [MACHINE_STATUS.PAUSED]: {
    label: 'Paused',
    color: 'text-accent-amber',
    borderColor: 'border-accent-amber/50',
    bgColor: 'bg-accent-amber/10',
    glow: '',
    dot: 'bg-accent-amber',
  },
  [MACHINE_STATUS.ACCEPTED]: {
    label: 'Accepted ✓',
    color: 'text-accent-green',
    borderColor: 'border-accent-green',
    bgColor: 'bg-accent-green/10',
    glow: 'shadow-[0_0_30px_rgba(52,211,153,0.4)]',
    dot: 'bg-accent-green',
  },
  [MACHINE_STATUS.REJECTED]: {
    label: 'Rejected ✗',
    color: 'text-red-400',
    borderColor: 'border-red-500/60',
    bgColor: 'bg-red-500/10',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
    dot: 'bg-red-500',
  },
  [MACHINE_STATUS.ERROR]: {
    label: 'Error',
    color: 'text-red-400',
    borderColor: 'border-red-500/60',
    bgColor: 'bg-red-500/10',
    glow: '',
    dot: 'bg-red-500',
  },
};

export default function StateDisplay({ currentState, status, steps, history }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[MACHINE_STATUS.IDLE];
  const lastSnapshot = history?.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Current State */}
      <motion.div
        layout
        className={`glass-panel p-4 flex flex-col gap-2 border ${cfg.borderColor} ${cfg.bgColor} ${cfg.glow} transition-all duration-300`}
      >
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">State</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentState}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={`font-mono text-xl font-bold ${cfg.color} ${status === MACHINE_STATUS.RUNNING ? 'state-active-pulse' : ''}`}
          >
            {currentState}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* Status */}
      <div className={`glass-panel p-4 flex flex-col gap-2 border ${cfg.borderColor} ${cfg.bgColor} ${cfg.glow} transition-all duration-300`}>
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Status</span>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />
          <span className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Steps */}
      <div className="glass-panel p-4 flex flex-col gap-2 border border-border">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Steps</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={steps}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="font-mono text-xl font-bold text-accent-cyan"
          >
            {steps.toLocaleString()}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Last Rule Applied */}
      <div className="glass-panel p-4 flex flex-col gap-2 border border-border">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Last Rule</span>
        {lastSnapshot?.ruleApplied ? (
          <div className="font-mono text-xs leading-relaxed text-gray-300">
            <span className="text-accent-blue">{lastSnapshot.ruleApplied.currentState}</span>
            <span className="text-gray-600">,</span>
            <span className="text-accent-cyan">{lastSnapshot.symbolRead}</span>
            <span className="text-gray-500"> → </span>
            <span className="text-accent-purple">{lastSnapshot.ruleApplied.writeSymbol}</span>
            <span className="text-gray-600">,</span>
            <span className={`font-bold ${lastSnapshot.ruleApplied.direction === 'R' ? 'text-accent-green' : lastSnapshot.ruleApplied.direction === 'L' ? 'text-accent-pink' : 'text-gray-400'}`}>
              {lastSnapshot.ruleApplied.direction}
            </span>
            <span className="text-gray-500">, </span>
            <span className="text-accent-amber">{lastSnapshot.ruleApplied.nextState}</span>
          </div>
        ) : (
          <span className="text-gray-600 text-xs">—</span>
        )}
      </div>
    </div>
  );
}
