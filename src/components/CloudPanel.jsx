import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, CloudOff, Save, Trash2, ExternalLink,
  Copy, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// CloudPanel — Save / Load machines from Firebase Firestore
// ─────────────────────────────────────────────────────────────────────────────

export default function CloudPanel({
  rules,
  initialTape,
  initialState,
  onLoad,
  savedMachines,
  isLoading,
  isFirebaseReady,
  saveMachine,
  loadMachines,
  deleteMachine,
  getShareUrl,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [machineName, setMachineName] = useState('');
  const [machineDesc, setMachineDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && isFirebaseReady) {
      loadMachines();
    }
  }, [isOpen, isFirebaseReady, loadMachines]);

  const handleSave = async () => {
    if (!machineName.trim()) {
      toast.error('Please enter a machine name.');
      return;
    }
    setIsSaving(true);
    await saveMachine({
      name: machineName.trim(),
      description: machineDesc.trim(),
      initialTape,
      initialState,
      rules,
    });
    setMachineName('');
    setMachineDesc('');
    setIsSaving(false);
    loadMachines();
  };

  const handleCopyShareUrl = (machineId) => {
    const url = getShareUrl(machineId);
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Share link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link.');
    });
  };

  return (
    <div className="glass-panel overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(p => !p)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-bg-elevated transition-colors"
      >
        <div className="flex items-center gap-2">
          {isFirebaseReady ? (
            <Cloud size={14} className="text-accent-blue" />
          ) : (
            <CloudOff size={14} className="text-gray-500" />
          )}
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Cloud Save / Share
          </h3>
          {!isFirebaseReady && (
            <span className="badge text-[10px] bg-gray-500/10 text-gray-500 border border-gray-500/20 ml-1">
              Not Configured
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 flex flex-col gap-4 border-t border-border">
              {!isFirebaseReady ? (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-400">
                  <p className="font-semibold mb-1">Firebase not configured</p>
                  <p className="text-xs text-amber-500/70 leading-relaxed">
                    To enable cloud save, edit <code className="font-mono bg-amber-500/10 px-1 rounded">src/lib/firebase.js</code> with
                    your Firebase project credentials, or set the{' '}
                    <code className="font-mono bg-amber-500/10 px-1 rounded">VITE_FIREBASE_*</code> environment variables.
                  </p>
                </div>
              ) : (
                <>
                  {/* Save form */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Save Current Machine</p>
                    <input
                      value={machineName}
                      onChange={e => setMachineName(e.target.value)}
                      placeholder="Machine name (e.g., My Binary Sorter)"
                      className="input-field text-sm"
                    />
                    <input
                      value={machineDesc}
                      onChange={e => setMachineDesc(e.target.value)}
                      placeholder="Optional description"
                      className="input-field text-sm"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      disabled={isSaving || !machineName.trim()}
                      className="btn-primary self-start disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      {isSaving ? 'Saving...' : 'Save to Cloud'}
                    </motion.button>
                  </div>

                  {/* Saved machines list */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Saved Machines</p>
                      <button
                        onClick={loadMachines}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                        title="Refresh list"
                      >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                      </button>
                    </div>

                    {isLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-12 shimmer rounded-lg" />
                        ))}
                      </div>
                    ) : savedMachines.length === 0 ? (
                      <p className="text-xs text-gray-600 py-4 text-center">
                        No saved machines yet. Save your current configuration above!
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {savedMachines.map(machine => (
                          <div
                            key={machine.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-border-bright hover:bg-bg-elevated transition-all group"
                          >
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-200 truncate">{machine.name}</p>
                              {machine.description && (
                                <p className="text-xs text-gray-600 truncate">{machine.description}</p>
                              )}
                              <p className="text-xs text-gray-700 font-mono">
                                {machine.rules?.length ?? 0} rules · Input: {machine.initialTape}
                              </p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onLoad(machine)}
                                className="text-xs px-2 py-1 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/20 hover:bg-accent-blue/20 transition-colors"
                                title="Load this machine"
                              >
                                Load
                              </button>
                              <button
                                onClick={() => handleCopyShareUrl(machine.id)}
                                className="text-gray-500 hover:text-gray-300 p-1 transition-colors"
                                title="Copy share link"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                onClick={() => deleteMachine(machine.id)}
                                className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
