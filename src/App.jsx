import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Cpu, Github, BookOpen, Sparkles } from 'lucide-react';

import Tape from './components/Tape';
import StateDisplay from './components/StateDisplay';
import ControlPanel from './components/ControlPanel';
import RuleEditor from './components/RuleEditor';
import PresetSelector from './components/PresetSelector';
import CloudPanel from './components/CloudPanel';
import ExecutionLog from './components/ExecutionLog';

import { useTuringMachine, MACHINE_STATUS } from './hooks/useTuringMachine';
import { useFirebase } from './hooks/useFirebase';
import { PRESETS, DEFAULT_PRESET } from './lib/presets';

// ─────────────────────────────────────────────────────────────────────────────
// App — Root application component
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [activePresetId, setActivePresetId] = useState(DEFAULT_PRESET.id);
  const [lastWrittenPos, setLastWrittenPos] = useState(null);

  const tm = useTuringMachine(DEFAULT_PRESET);
  const firebase = useFirebase();

  // Load from URL param on mount (shareable links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const machineId = params.get('machine');
    if (machineId && firebase.isFirebaseReady) {
      firebase.loadMachineById(machineId).then(config => {
        if (config) {
          tm.loadConfig(config);
          setActivePresetId(null);
        }
      });
    }
  }, []); // eslint-disable-line

  // Track last written cell for visual feedback
  const wrappedStep = useCallback(() => {
    const prevHeadPos = tm.headPos;
    tm.step();
    setLastWrittenPos(prevHeadPos);
    setTimeout(() => setLastWrittenPos(null), 800);
  }, [tm]);

  const handleLoadPreset = useCallback((preset) => {
    tm.loadConfig(preset);
    setActivePresetId(preset.id);
  }, [tm]);

  const handleLoadCloud = useCallback((config) => {
    tm.loadConfig(config);
    setActivePresetId(null);
  }, [tm]);

  const isTerminal = tm.status === MACHINE_STATUS.ACCEPTED || tm.status === MACHINE_STATUS.REJECTED;

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid #2a2a4a',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
        }}
      />

      {/* ─── Header ─── */}
      <header className="border-b border-border sticky top-0 z-50 backdrop-blur-xl bg-bg-primary/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-lg">
                <Cpu size={18} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-green border border-bg-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                Turing Machine Simulator
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Interactive computation model</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${tm.status === MACHINE_STATUS.RUNNING
                ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
                : tm.status === MACHINE_STATUS.ACCEPTED
                ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
                : tm.status === MACHINE_STATUS.REJECTED
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-bg-elevated border-border text-gray-500'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                ${tm.status === MACHINE_STATUS.RUNNING ? 'bg-accent-green animate-pulse' : 
                  tm.status === MACHINE_STATUS.ACCEPTED ? 'bg-accent-green' :
                  tm.status === MACHINE_STATUS.REJECTED ? 'bg-red-500' : 'bg-gray-600'
                }`}
              />
              {tm.status.charAt(0).toUpperCase() + tm.status.slice(1)}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">

        {/* ─── Terminal Banner ─── */}
        <AnimatePresence>
          {isTerminal && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-xl border px-6 py-4 flex items-center gap-4
                ${tm.status === MACHINE_STATUS.ACCEPTED
                  ? 'bg-accent-green/10 border-accent-green/30'
                  : 'bg-red-500/10 border-red-500/30'
                }`}
            >
              <Sparkles size={20} className={tm.status === MACHINE_STATUS.ACCEPTED ? 'text-accent-green' : 'text-red-400'} />
              <div>
                <p className={`font-bold text-base ${tm.status === MACHINE_STATUS.ACCEPTED ? 'text-accent-green' : 'text-red-400'}`}>
                  {tm.status === MACHINE_STATUS.ACCEPTED ? '✓ Machine Accepted the Input!' : '✗ Machine Rejected the Input'}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  Completed in <span className="font-mono font-semibold">{tm.steps}</span> steps.
                  Final state: <span className="font-mono font-semibold">{tm.currentState}</span>.
                  Tape output: <span className="font-mono font-semibold text-accent-cyan">{tm.getTapeSnapshot()}</span>
                </p>
              </div>
              <button
                onClick={() => tm.reset()}
                className="ml-auto text-sm underline text-gray-400 hover:text-white transition-colors"
              >
                Reset &rarr;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Tape Visualization ─── */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tape</h2>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-accent-blue/10 border border-accent-blue inline-block" />
                Current Head
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-accent-purple/10 border border-accent-purple inline-block" />
                Just Written
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-bg-secondary border border-border inline-block opacity-40" />
                Blank (B)
              </span>
            </div>
          </div>
          <Tape
            tape={tm.tape}
            headPos={tm.headPos}
            blankSymbol={tm.blankSymbol}
            lastWrittenPos={lastWrittenPos}
          />
        </div>

        {/* ─── State Display ─── */}
        <StateDisplay
          currentState={tm.currentState}
          status={tm.status}
          steps={tm.steps}
          history={tm.history}
        />

        {/* ─── Controls ─── */}
        <ControlPanel
          status={tm.status}
          steps={tm.steps}
          initialTape={tm.initialTape}
          setInitialTape={tm.setInitialTape}
          initialState={tm.initialState}
          setInitialState={tm.setInitialState}
          speed={tm.speed}
          changeSpeed={tm.changeSpeed}
          step={wrappedStep}
          play={tm.play}
          pause={tm.pause}
          reset={tm.reset}
          undo={tm.undo}
          historyLength={tm.history.length}
        />

        {/* ─── Two-column: Presets + Cloud ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PresetSelector
            onLoad={handleLoadPreset}
            activePresetId={activePresetId}
          />
          <CloudPanel
            rules={tm.rules}
            initialTape={tm.initialTape}
            initialState={tm.initialState}
            onLoad={handleLoadCloud}
            savedMachines={firebase.savedMachines}
            isLoading={firebase.isLoading}
            isFirebaseReady={firebase.isFirebaseReady}
            saveMachine={firebase.saveMachine}
            loadMachines={firebase.loadMachines}
            deleteMachine={firebase.deleteMachine}
            getShareUrl={firebase.getShareUrl}
          />
        </div>

        {/* ─── Rule Editor (full width) ─── */}
        <RuleEditor
          rules={tm.rules}
          setRules={tm.setRules}
          lastMatchedRuleId={tm.lastMatchedRuleId}
        />

        {/* ─── Execution Log ─── */}
        <ExecutionLog history={tm.history} />

        {/* ─── Explainer card ─── */}
        <div className="glass-panel p-6 border border-border-subtle">
          <div className="flex items-start gap-4">
            <BookOpen size={18} className="text-accent-purple flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2 text-sm text-gray-400 leading-relaxed">
              <p className="text-gray-200 font-semibold">How to use this simulator</p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs">
                <li>
                  <strong className="text-gray-300">Load a preset</strong> (e.g., "Binary Incrementer") or define your own rules in the Transition Table below.
                </li>
                <li>
                  <strong className="text-gray-300">Set the input tape</strong> string and initial state in the Controls panel, then click <em>Reset</em>.
                </li>
                <li>
                  <strong className="text-gray-300">Press Step</strong> to advance one computation step at a time, or <strong className="text-gray-300">Play</strong> to run automatically.
                </li>
                <li>
                  Watch the <strong className="text-gray-300">tape</strong> update in real time — the highlighted cell is where the head currently sits. The most recently matched rule is highlighted in the Transition Table.
                </li>
                <li>
                  Use <strong className="text-gray-300">Undo</strong> to go back one step, or <em>Reset</em> to start over.
                </li>
                <li>
                  Save configurations to the cloud and share the generated URL with your teacher or classmates.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>
            Turing Machine Simulator · Built with React, Framer Motion & Tailwind CSS
          </p>
          <p>
            A visual tool for understanding the foundations of computer science.
          </p>
        </div>
      </footer>
    </div>
  );
}
