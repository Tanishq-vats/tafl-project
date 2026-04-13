import { useState, useCallback, useRef, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// useTuringMachine — Core Turing Machine logic hook
// 
// Tape is represented as a JS Map<number, string> for true infinite support
// in both directions. Missing keys default to the blank symbol.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_BLANK = 'B';

/**
 * Build a tape Map from an initial string, centered at position 0.
 */
const buildTape = (input, blank = DEFAULT_BLANK) => {
  const tape = new Map();
  if (!input) return tape;
  for (let i = 0; i < input.length; i++) {
    tape.set(i, input[i]);
  }
  return tape;
};

/**
 * Read a symbol from the tape, returning blank if undefined.
 */
const readTape = (tape, pos, blank = DEFAULT_BLANK) => {
  return tape.get(pos) ?? blank;
};

/**
 * Build a transition lookup from the rules array.
 * Key: `${currentState},${readSymbol}`
 */
const buildLookup = (rules) => {
  const map = new Map();
  for (const rule of rules) {
    const key = `${rule.currentState},${rule.readSymbol}`;
    map.set(key, rule);
  }
  return map;
};

export const MACHINE_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ERROR: 'error',
};

export function useTuringMachine(preset) {
  const [tape, setTape] = useState(() => buildTape(preset?.initialTape ?? ''));
  const [headPos, setHeadPos] = useState(0);
  const [currentState, setCurrentState] = useState(preset?.initialState ?? 'q0');
  const [rules, setRules] = useState(preset?.rules ?? []);
  const [status, setStatus] = useState(MACHINE_STATUS.IDLE);
  const [steps, setSteps] = useState(0);
  const [history, setHistory] = useState([]);
  const [lastMatchedRuleId, setLastMatchedRuleId] = useState(null);
  const [speed, setSpeed] = useState(600); // ms per step
  const [blankSymbol] = useState(preset?.blankSymbol ?? DEFAULT_BLANK);
  const [acceptStates] = useState(new Set(preset?.acceptStates ?? ['qAccept', 'accept', 'halt-accept']));
  const [rejectStates] = useState(new Set(preset?.rejectStates ?? ['qReject', 'reject', 'halt-reject']));
  const [initialTape, setInitialTape] = useState(preset?.initialTape ?? '');
  const [initialState, setInitialState] = useState(preset?.initialState ?? 'q0');

  const playIntervalRef = useRef(null);
  const stateRef = useRef({ tape, headPos, currentState, rules, status });

  // Keep ref in sync
  useEffect(() => {
    stateRef.current = { tape, headPos, currentState, rules, status };
  }, [tape, headPos, currentState, rules, status]);

  /** Perform one computation step. Returns the new status. */
  const performStep = useCallback((
    currentTape,
    currentHeadPos,
    curState,
    rulesList,
    curAcceptStates,
    curRejectStates,
    curBlank,
    curHistory,
    curSteps,
  ) => {
    const symbolRead = readTape(currentTape, currentHeadPos, curBlank);

    // Check for accept / reject immediately if entering those states
    if (curAcceptStates.has(curState)) {
      setStatus(MACHINE_STATUS.ACCEPTED);
      setLastMatchedRuleId(null);
      return { status: MACHINE_STATUS.ACCEPTED, tape: currentTape, headPos: currentHeadPos, state: curState };
    }
    if (curRejectStates.has(curState)) {
      setStatus(MACHINE_STATUS.REJECTED);
      setLastMatchedRuleId(null);
      return { status: MACHINE_STATUS.REJECTED, tape: currentTape, headPos: currentHeadPos, state: curState };
    }

    const lookup = buildLookup(rulesList);
    const key = `${curState},${symbolRead}`;
    const rule = lookup.get(key);

    if (!rule) {
      // No matching transition → implicit reject
      setStatus(MACHINE_STATUS.REJECTED);
      setLastMatchedRuleId(null);
      return { status: MACHINE_STATUS.REJECTED, tape: currentTape, headPos: currentHeadPos, state: curState };
    }

    // Apply the rule
    const newTape = new Map(currentTape);
    if (rule.writeSymbol === curBlank) {
      newTape.delete(currentHeadPos); // keep tape clean
    } else {
      newTape.set(currentHeadPos, rule.writeSymbol);
    }

    const dirMap = { L: -1, R: 1, N: 0, S: 0 };
    const newHeadPos = currentHeadPos + (dirMap[rule.direction] ?? 0);
    const newState = rule.nextState;
    const newSteps = curSteps + 1;

    // Save history snapshot for undo
    const snapshot = {
      tape: currentTape,
      headPos: currentHeadPos,
      state: curState,
      stepNumber: curSteps,
      ruleApplied: rule,
      symbolRead,
    };

    setTape(newTape);
    setHeadPos(newHeadPos);
    setCurrentState(newState);
    setSteps(newSteps);
    setLastMatchedRuleId(rule.id);
    setHistory(prev => [...prev, snapshot]);

    // Check if new state is terminal
    let newStatus = MACHINE_STATUS.RUNNING;
    if (curAcceptStates.has(newState)) {
      newStatus = MACHINE_STATUS.ACCEPTED;
      setStatus(MACHINE_STATUS.ACCEPTED);
    } else if (curRejectStates.has(newState)) {
      newStatus = MACHINE_STATUS.REJECTED;
      setStatus(MACHINE_STATUS.REJECTED);
    }

    return { status: newStatus, tape: newTape, headPos: newHeadPos, state: newState };
  }, []);

  /** Public: advance one step */
  const step = useCallback(() => {
    const { tape: t, headPos: h, currentState: s, rules: r, status: st } = stateRef.current;
    if (st === MACHINE_STATUS.ACCEPTED || st === MACHINE_STATUS.REJECTED) return;
    if (st === MACHINE_STATUS.IDLE) setStatus(MACHINE_STATUS.RUNNING);

    return performStep(t, h, s, r, acceptStates, rejectStates, blankSymbol, history, steps);
  }, [performStep, acceptStates, rejectStates, blankSymbol, history, steps]);

  /** Public: undo last step */
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setTape(last.tape);
      setHeadPos(last.headPos);
      setCurrentState(last.state);
      setSteps(last.stepNumber);
      setLastMatchedRuleId(null);
      setStatus(MACHINE_STATUS.PAUSED);
      return prev.slice(0, -1);
    });
  }, []);

  /** Public: start auto-play */
  const play = useCallback(() => {
    if (stateRef.current.status === MACHINE_STATUS.ACCEPTED || stateRef.current.status === MACHINE_STATUS.REJECTED) return;
    setStatus(MACHINE_STATUS.RUNNING);

    const tick = () => {
      const { tape: t, headPos: h, currentState: s, rules: r } = stateRef.current;
      const result = performStep(t, h, s, r, acceptStates, rejectStates, blankSymbol, [], 0);
      if (!result) return;
      if (result.status === MACHINE_STATUS.ACCEPTED || result.status === MACHINE_STATUS.REJECTED) {
        clearInterval(playIntervalRef.current);
      }
    };

    playIntervalRef.current = setInterval(tick, speed);
  }, [speed, performStep, acceptStates, rejectStates, blankSymbol]);

  /** Public: pause */
  const pause = useCallback(() => {
    clearInterval(playIntervalRef.current);
    setStatus(MACHINE_STATUS.PAUSED);
  }, []);

  /** Public: reset to initial state */
  const reset = useCallback((newInput, newState) => {
    clearInterval(playIntervalRef.current);
    const inp = newInput ?? initialTape;
    const st = newState ?? initialState;
    setTape(buildTape(inp, blankSymbol));
    setHeadPos(0);
    setCurrentState(st);
    setStatus(MACHINE_STATUS.IDLE);
    setSteps(0);
    setHistory([]);
    setLastMatchedRuleId(null);
  }, [initialTape, initialState, blankSymbol]);

  /** Public: Load a complete preset / configuration */
  const loadConfig = useCallback((config) => {
    clearInterval(playIntervalRef.current);
    const inp = config.initialTape ?? '';
    const st = config.initialState ?? 'q0';
    setInitialTape(inp);
    setInitialState(st);
    setRules(config.rules ?? []);
    setTape(buildTape(inp, config.blankSymbol ?? blankSymbol));
    setHeadPos(0);
    setCurrentState(st);
    setStatus(MACHINE_STATUS.IDLE);
    setSteps(0);
    setHistory([]);
    setLastMatchedRuleId(null);
  }, [blankSymbol]);

  /** Public: update the speed */
  const changeSpeed = useCallback((newSpeed) => {
    setSpeed(newSpeed);
    if (stateRef.current.status === MACHINE_STATUS.RUNNING) {
      clearInterval(playIntervalRef.current);
      const tick = () => {
        const { tape: t, headPos: h, currentState: s, rules: r } = stateRef.current;
        const result = performStep(t, h, s, r, acceptStates, rejectStates, blankSymbol, [], 0);
        if (!result) return;
        if (result.status === MACHINE_STATUS.ACCEPTED || result.status === MACHINE_STATUS.REJECTED) {
          clearInterval(playIntervalRef.current);
        }
      };
      playIntervalRef.current = setInterval(tick, newSpeed);
    }
  }, [performStep, acceptStates, rejectStates, blankSymbol]);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(playIntervalRef.current), []);

  // Serialize tape to readable string (for display)
  const getTapeSnapshot = useCallback(() => {
    if (tape.size === 0) return '';
    const keys = [...tape.keys()];
    const min = Math.min(...keys);
    const max = Math.max(...keys);
    let result = '';
    for (let i = min; i <= max; i++) {
      result += readTape(tape, i, blankSymbol);
    }
    return result;
  }, [tape, blankSymbol]);

  return {
    tape,
    headPos,
    currentState,
    rules,
    setRules,
    status,
    steps,
    history,
    lastMatchedRuleId,
    speed,
    blankSymbol,
    initialTape,
    setInitialTape,
    initialState,
    setInitialState,
    step,
    undo,
    play,
    pause,
    reset,
    loadConfig,
    changeSpeed,
    getTapeSnapshot,
    readTape: (pos) => readTape(tape, pos, blankSymbol),
  };
}
