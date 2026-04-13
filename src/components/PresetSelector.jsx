import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronRight, Info } from 'lucide-react';
import { PRESETS } from '../lib/presets';

// ─────────────────────────────────────────────────────────────────────────────
// PresetSelector — Grid of preset Turing Machines to quickly load
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_CLASSES = {
  blue: {
    border: 'border-accent-blue/30 hover:border-accent-blue/60',
    bg: 'hover:bg-accent-blue/5',
    badge: 'badge-blue',
    icon: 'text-accent-blue',
    glow: 'hover:shadow-[0_0_20px_rgba(79,142,247,0.15)]',
  },
  purple: {
    border: 'border-accent-purple/30 hover:border-accent-purple/60',
    bg: 'hover:bg-accent-purple/5',
    badge: 'badge-purple',
    icon: 'text-accent-purple',
    glow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
  },
  green: {
    border: 'border-accent-green/30 hover:border-accent-green/60',
    bg: 'hover:bg-accent-green/5',
    badge: 'badge-green',
    icon: 'text-accent-green',
    glow: 'hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]',
  },
  pink: {
    border: 'border-accent-pink/30 hover:border-accent-pink/60',
    bg: 'hover:bg-accent-pink/5',
    badge: 'bg-accent-pink/10 text-accent-pink border border-accent-pink/20',
    icon: 'text-accent-pink',
    glow: 'hover:shadow-[0_0_20px_rgba(244,114,182,0.15)]',
  },
};

export default function PresetSelector({ onLoad, activePresetId }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
        <Zap size={14} className="text-accent-amber" />
        Presets
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESETS.map((preset) => {
          const colors = COLOR_CLASSES[preset.color] ?? COLOR_CLASSES.blue;
          const isActive = activePresetId === preset.id;
          const isExpanded = expandedId === preset.id;

          return (
            <motion.div
              key={preset.id}
              layout
              className={`
                relative rounded-xl border p-4 cursor-pointer select-none
                transition-all duration-200
                ${colors.border} ${colors.bg} ${colors.glow}
                ${isActive ? 'ring-1 ring-offset-0' : ''}
              `}
              onMouseEnter={() => setHoveredId(preset.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onLoad(preset)}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-2 right-2">
                  <span className={`badge text-[10px] ${colors.badge}`}>Active</span>
                </div>
              )}

              {/* Emoji + Name */}
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{preset.emoji}</span>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${colors.icon}`}>{preset.name}</p>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                <span className="font-mono text-xs text-gray-600">
                  Input: <span className="text-gray-400">{preset.initialTape}</span>
                </span>
                <span className="flex-1" />
                <span className="font-mono text-xs text-gray-600">
                  {preset.rules.length} rules
                </span>
                <motion.div
                  animate={{ x: hoveredId === preset.id ? 3 : 0 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <ChevronRight size={13} className={colors.icon} />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
