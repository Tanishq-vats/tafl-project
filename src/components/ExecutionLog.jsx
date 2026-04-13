import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ArrowRight, ArrowLeft, Minus } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// ExecutionLog — Shows a scrollable log of all machine steps taken so far
// ─────────────────────────────────────────────────────────────────────────────

const DirIcon = ({ dir }) => {
  if (dir === 'R') return <ArrowRight size={10} className="text-accent-green" />;
  if (dir === 'L') return <ArrowLeft size={10} className="text-accent-blue" />;
  return <Minus size={10} className="text-gray-500" />;
};

export default function ExecutionLog({ history }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom as steps accumulate
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history.length]);

  if (history.length === 0) {
    return (
      <div className="glass-panel p-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <History size={14} className="text-accent-cyan" />
          Execution Log
        </h3>
        <p className="text-xs text-gray-600 text-center py-6">
          No steps yet. Press Play or Step to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <History size={14} className="text-accent-cyan" />
          Execution Log
        </h3>
        <span className="badge-blue text-[10px]">{history.length} steps</span>
      </div>

      <div className="overflow-y-auto max-h-56 flex flex-col gap-0.5 pr-1">
        <AnimatePresence initial={false}>
          {history.map((snap, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={`
                flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-mono
                ${idx === history.length - 1
                  ? 'bg-accent-blue/10 border border-accent-blue/20'
                  : 'hover:bg-bg-elevated'
                }
              `}
            >
              {/* Step number */}
              <span className="text-gray-700 w-6 text-right flex-shrink-0">
                {snap.stepNumber + 1}
              </span>
              {/* State */}
              <span className="text-accent-blue font-semibold w-12 truncate">
                {snap.state}
              </span>
              {/* Read */}
              <span className="text-gray-500">read</span>
              <span className="px-1 rounded bg-bg-secondary border border-border text-accent-cyan">
                {snap.symbolRead}
              </span>
              {/* Arrow */}
              <span className="text-gray-700">→</span>
              {/* Write */}
              <span className="text-gray-500">write</span>
              <span className="px-1 rounded bg-bg-secondary border border-border text-accent-purple">
                {snap.ruleApplied?.writeSymbol ?? '?'}
              </span>
              {/* Direction */}
              <DirIcon dir={snap.ruleApplied?.direction ?? 'N'} />
              {/* Next state */}
              <span className="text-accent-amber font-semibold ml-auto truncate">
                → {snap.ruleApplied?.nextState ?? '?'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
