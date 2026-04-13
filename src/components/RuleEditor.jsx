import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, Check, X, AlertCircle,
  ChevronsUpDown, Table2, Download, Upload,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// ─────────────────────────────────────────────────────────────────────────────
// RuleEditor — JSON-like UI for managing Turing Machine transition rules
// ─────────────────────────────────────────────────────────────────────────────

const DIRECTION_OPTIONS = ['L', 'R', 'N'];
const EMPTY_RULE = {
  currentState: '',
  readSymbol: '',
  writeSymbol: '',
  direction: 'R',
  nextState: '',
};

function DirectionBadge({ dir }) {
  const colors = {
    L: 'badge-blue bg-blue-500/10 text-blue-400 border border-blue-500/20',
    R: 'badge bg-accent-green/10 text-accent-green border border-accent-green/20',
    N: 'badge bg-gray-500/10 text-gray-400 border border-gray-500/20',
  };
  return (
    <span className={`badge font-mono font-bold ${colors[dir] ?? colors.N}`}>{dir}</span>
  );
}

function RuleRow({ rule, index, isActive, isEditing, onEdit, onSave, onCancel, onDelete }) {
  const [draft, setDraft] = useState({ ...rule });

  const handleSave = () => {
    if (!draft.currentState || !draft.readSymbol || !draft.writeSymbol || !draft.nextState) return;
    onSave(draft);
  };

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
        backgroundColor: isActive ? 'rgba(79, 142, 247, 0.08)' : 'transparent',
      }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className={`border-b border-border/50 last:border-0 group
        ${isActive ? 'rule-highlight-flash' : ''}
      `}
    >
      {isEditing ? (
        <>
          <td className="p-2 text-xs text-gray-600 font-mono">{index + 1}</td>
          {['currentState', 'readSymbol', 'writeSymbol', 'nextState'].map(field => (
            <td key={field} className="p-1">
              <input
                value={draft[field]}
                onChange={e => setDraft(prev => ({ ...prev, [field]: e.target.value }))}
                className="input-field w-full text-xs py-1.5 px-2"
                placeholder={field === 'readSymbol' || field === 'writeSymbol' ? 'B for blank' : field}
              />
            </td>
          ))}
          <td className="p-1">
            <select
              value={draft.direction}
              onChange={e => setDraft(prev => ({ ...prev, direction: e.target.value }))}
              className="input-field w-full text-xs py-1.5 px-2"
            >
              {DIRECTION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </td>
          <td className="p-2">
            <div className="flex gap-1">
              <button onClick={handleSave} className="text-accent-green hover:text-green-300 transition-colors" title="Save">
                <Check size={14} />
              </button>
              <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 transition-colors" title="Cancel">
                <X size={14} />
              </button>
            </div>
          </td>
        </>
      ) : (
        <>
          <td className="p-2 text-xs text-gray-600 font-mono w-8">{index + 1}</td>
          <td className="p-2">
            <span className={`font-mono text-sm font-semibold ${isActive ? 'text-accent-blue' : 'text-gray-200'}`}>
              {rule.currentState}
            </span>
          </td>
          <td className="p-2">
            <span className="font-mono text-sm px-2 py-0.5 rounded bg-bg-secondary border border-border text-accent-cyan">
              {rule.readSymbol}
            </span>
          </td>
          <td className="p-2">
            <span className="font-mono text-sm px-2 py-0.5 rounded bg-bg-secondary border border-border text-accent-purple">
              {rule.writeSymbol}
            </span>
          </td>
          <td className="p-2"><DirectionBadge dir={rule.direction} /></td>
          <td className="p-2">
            <span className={`font-mono text-sm font-semibold ${isActive ? 'text-accent-amber' : 'text-gray-300'}`}>
              {rule.nextState}
            </span>
          </td>
          <td className="p-2">
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(rule)} className="text-gray-500 hover:text-accent-blue transition-colors" title="Edit rule">
                <Edit3 size={13} />
              </button>
              <button onClick={() => onDelete(rule.id)} className="text-gray-500 hover:text-red-400 transition-colors" title="Delete rule">
                <Trash2 size={13} />
              </button>
            </div>
          </td>
        </>
      )}
    </motion.tr>
  );
}

function AddRuleForm({ onAdd }) {
  const [form, setForm] = useState({ ...EMPTY_RULE });
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!form.currentState || !form.readSymbol || !form.writeSymbol || !form.nextState) {
      setError('All fields except direction are required.');
      return;
    }
    setError('');
    onAdd({ ...form, id: uuidv4() });
    setForm({ ...EMPTY_RULE });
  };

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Add New Rule</p>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {[
          { key: 'currentState', placeholder: 'State (q0)' },
          { key: 'readSymbol', placeholder: 'Read (0,1,B)' },
          { key: 'writeSymbol', placeholder: 'Write (0,1,B)' },
          { key: 'nextState', placeholder: 'Next state' },
        ].map(({ key, placeholder }) => (
          <input
            key={key}
            value={form[key]}
            onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className="input-field text-xs py-1.5"
          />
        ))}
        <select
          value={form.direction}
          onChange={e => setForm(prev => ({ ...prev, direction: e.target.value }))}
          className="input-field text-xs py-1.5"
        >
          {DIRECTION_OPTIONS.map(d => <option key={d} value={d}>{d === 'L' ? '← Left' : d === 'R' ? '→ Right' : '• Stay'}</option>)}
        </select>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          className="btn-primary text-xs py-1.5 justify-center"
        >
          <Plus size={14} />
          Add Rule
        </motion.button>
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

export default function RuleEditor({ rules, setRules, lastMatchedRuleId }) {
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'json'
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');

  const handleAdd = useCallback((newRule) => {
    setRules(prev => [...prev, newRule]);
  }, [setRules]);

  const handleDelete = useCallback((id) => {
    setRules(prev => prev.filter(r => r.id !== id));
  }, [setRules]);

  const handleEdit = useCallback((rule) => {
    setEditingId(rule.id);
  }, []);

  const handleSave = useCallback((updatedRule) => {
    setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
    setEditingId(null);
  }, [setRules]);

  const handleCancel = () => setEditingId(null);

  const handleJsonEdit = () => {
    setJsonText(JSON.stringify(rules, null, 2));
    setViewMode('json');
  };

  const handleJsonSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error('Must be an array of rules');
      const validated = parsed.map(r => ({
        id: r.id || uuidv4(),
        currentState: String(r.currentState || ''),
        readSymbol: String(r.readSymbol || ''),
        writeSymbol: String(r.writeSymbol || ''),
        direction: ['L', 'R', 'N', 'S'].includes(r.direction) ? r.direction : 'R',
        nextState: String(r.nextState || ''),
      }));
      setRules(validated);
      setViewMode('table');
      setJsonError('');
    } catch (e) {
      setJsonError(e.message);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'turing-rules.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Table2 size={14} className="text-accent-purple" />
          Transition Table
          <span className="badge-purple ml-1">{rules.length} rule{rules.length !== 1 ? 's' : ''}</span>
        </h3>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportJson}
            className="btn-secondary text-xs py-1.5"
            title="Export rules as JSON"
          >
            <Download size={13} />
            Export
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={viewMode === 'table' ? handleJsonEdit : handleJsonSave}
            className="btn-secondary text-xs py-1.5"
          >
            {viewMode === 'table' ? (
              <><ChevronsUpDown size={13} />JSON Edit</>
            ) : (
              <><Check size={13} />Apply JSON</>
            )}
          </motion.button>
        </div>
      </div>

      {viewMode === 'json' ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            className="input-field font-mono text-xs h-64 resize-none leading-relaxed"
            spellCheck={false}
          />
          {jsonError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} /> {jsonError}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={handleJsonSave} className="btn-primary text-xs py-1.5">
              <Check size={13} />Apply
            </button>
            <button onClick={() => { setViewMode('table'); setJsonError(''); }} className="btn-secondary text-xs py-1.5">
              <X size={13} />Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-border">
                  <th className="p-2 text-left w-8">#</th>
                  <th className="p-2 text-left">Current State</th>
                  <th className="p-2 text-left">Read</th>
                  <th className="p-2 text-left">Write</th>
                  <th className="p-2 text-left">Dir</th>
                  <th className="p-2 text-left">Next State</th>
                  <th className="p-2 text-left w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-600 text-sm">
                        No rules defined. Add a rule below or load a preset.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule, idx) => (
                      <RuleRow
                        key={rule.id}
                        rule={rule}
                        index={idx}
                        isActive={rule.id === lastMatchedRuleId}
                        isEditing={editingId === rule.id}
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Add Rule Form */}
          <AddRuleForm onAdd={handleAdd} />
        </>
      )}
    </div>
  );
}
