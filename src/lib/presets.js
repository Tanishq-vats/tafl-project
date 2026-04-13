// ─────────────────────────────────────────────────────────────────────────────
// Preset machine configurations for the Turing Machine Simulator
// ─────────────────────────────────────────────────────────────────────────────

export const PRESETS = [
  {
    id: 'binary-incrementer',
    name: 'Binary Incrementer',
    description: 'Increments a binary number by 1. Scans right to the end, then adds 1 with carry propagation going left.',
    emoji: '➕',
    color: 'blue',
    initialTape: '1011',
    initialState: 'q0',
    acceptStates: ['qAccept'],
    rejectStates: ['qReject'],
    blankSymbol: 'B',
    rules: [
      // Move right until blank (end of number)
      { id: '1', currentState: 'q0', readSymbol: '0', writeSymbol: '0', direction: 'R', nextState: 'q0' },
      { id: '2', currentState: 'q0', readSymbol: '1', writeSymbol: '1', direction: 'R', nextState: 'q0' },
      // Hit blank: start incrementing from right
      { id: '3', currentState: 'q0', readSymbol: 'B', writeSymbol: 'B', direction: 'L', nextState: 'q1' },
      // Carry propagation: 1 → 0, keep going left
      { id: '4', currentState: 'q1', readSymbol: '1', writeSymbol: '0', direction: 'L', nextState: 'q1' },
      // No carry: 0 → 1, done
      { id: '5', currentState: 'q1', readSymbol: '0', writeSymbol: '1', direction: 'R', nextState: 'qAccept' },
      // All 1s (overflow): write 1 at leftmost position (blank = new MSB)
      { id: '6', currentState: 'q1', readSymbol: 'B', writeSymbol: '1', direction: 'R', nextState: 'qAccept' },
    ],
  },
  {
    id: 'binary-inverter',
    name: 'Binary Inverter',
    description: 'Flips every bit in a binary string: 0 becomes 1 and 1 becomes 0. Moves right until it hits a blank.',
    emoji: '🔄',
    color: 'purple',
    initialTape: '10110',
    initialState: 'q0',
    acceptStates: ['qAccept'],
    rejectStates: [],
    blankSymbol: 'B',
    rules: [
      { id: '1', currentState: 'q0', readSymbol: '0', writeSymbol: '1', direction: 'R', nextState: 'q0' },
      { id: '2', currentState: 'q0', readSymbol: '1', writeSymbol: '0', direction: 'R', nextState: 'q0' },
      { id: '3', currentState: 'q0', readSymbol: 'B', writeSymbol: 'B', direction: 'L', nextState: 'qAccept' },
    ],
  },
  {
    id: 'unary-addition',
    name: 'Unary Addition',
    description: 'Adds two unary numbers separated by a "+". E.g. "111+11" → "11111". Uses 1s to represent numbers.',
    emoji: '🔢',
    color: 'green',
    initialTape: '111+11',
    initialState: 'q0',
    acceptStates: ['qAccept'],
    rejectStates: [],
    blankSymbol: 'B',
    rules: [
      // Move right past first block of 1s
      { id: '1', currentState: 'q0', readSymbol: '1', writeSymbol: '1', direction: 'R', nextState: 'q0' },
      // At the +, replace it with a 1 and continue right
      { id: '2', currentState: 'q0', readSymbol: '+', writeSymbol: '1', direction: 'R', nextState: 'q1' },
      // Move right past second block of 1s
      { id: '3', currentState: 'q1', readSymbol: '1', writeSymbol: '1', direction: 'R', nextState: 'q1' },
      // At blank: erase last 1 (to balance the + we converted to 1)
      { id: '4', currentState: 'q1', readSymbol: 'B', writeSymbol: 'B', direction: 'L', nextState: 'q2' },
      // Erase the trailing 1
      { id: '5', currentState: 'q2', readSymbol: '1', writeSymbol: 'B', direction: 'L', nextState: 'qAccept' },
    ],
  },
  {
    id: 'palindrome-checker',
    name: 'Palindrome Checker (Binary)',
    description: 'Checks if a binary string is a palindrome. Accepts if the string reads the same forwards and backwards.',
    emoji: '🪞',
    color: 'pink',
    initialTape: '10101',
    initialState: 'q0',
    acceptStates: ['qAccept'],
    rejectStates: ['qReject'],
    blankSymbol: 'B',
    rules: [
      // Read leftmost symbol
      { id: '1', currentState: 'q0', readSymbol: '0', writeSymbol: 'X', direction: 'R', nextState: 'q1' },
      { id: '2', currentState: 'q0', readSymbol: '1', writeSymbol: 'Y', direction: 'R', nextState: 'q3' },
      { id: '3', currentState: 'q0', readSymbol: 'X', writeSymbol: 'X', direction: 'R', nextState: 'qAccept' },
      { id: '4', currentState: 'q0', readSymbol: 'Y', writeSymbol: 'Y', direction: 'R', nextState: 'qAccept' },
      { id: '5', currentState: 'q0', readSymbol: 'B', writeSymbol: 'B', direction: 'R', nextState: 'qAccept' },
      // Move right (skipping middle symbols) to find rightmost 0
      { id: '6', currentState: 'q1', readSymbol: '0', writeSymbol: '0', direction: 'R', nextState: 'q1' },
      { id: '7', currentState: 'q1', readSymbol: '1', writeSymbol: '1', direction: 'R', nextState: 'q1' },
      { id: '8', currentState: 'q1', readSymbol: 'X', writeSymbol: 'X', direction: 'L', nextState: 'q2' },
      { id: '9', currentState: 'q1', readSymbol: 'Y', writeSymbol: 'Y', direction: 'L', nextState: 'q2' },
      { id: '10', currentState: 'q1', readSymbol: 'B', writeSymbol: 'B', direction: 'L', nextState: 'q2' },
      // Match rightmost 0
      { id: '11', currentState: 'q2', readSymbol: '0', writeSymbol: 'X', direction: 'L', nextState: 'q5' },
      { id: '12', currentState: 'q2', readSymbol: '1', writeSymbol: '1', direction: 'L', nextState: 'qReject' },
      // Move right to find rightmost 1
      { id: '13', currentState: 'q3', readSymbol: '0', writeSymbol: '0', direction: 'R', nextState: 'q3' },
      { id: '14', currentState: 'q3', readSymbol: '1', writeSymbol: '1', direction: 'R', nextState: 'q3' },
      { id: '15', currentState: 'q3', readSymbol: 'X', writeSymbol: 'X', direction: 'L', nextState: 'q4' },
      { id: '16', currentState: 'q3', readSymbol: 'Y', writeSymbol: 'Y', direction: 'L', nextState: 'q4' },
      { id: '17', currentState: 'q3', readSymbol: 'B', writeSymbol: 'B', direction: 'L', nextState: 'q4' },
      // Match rightmost 1
      { id: '18', currentState: 'q4', readSymbol: '1', writeSymbol: 'Y', direction: 'L', nextState: 'q5' },
      { id: '19', currentState: 'q4', readSymbol: '0', writeSymbol: '0', direction: 'L', nextState: 'qReject' },
      // Walk back left to start
      { id: '20', currentState: 'q5', readSymbol: '0', writeSymbol: '0', direction: 'L', nextState: 'q5' },
      { id: '21', currentState: 'q5', readSymbol: '1', writeSymbol: '1', direction: 'L', nextState: 'q5' },
      { id: '22', currentState: 'q5', readSymbol: 'X', writeSymbol: 'X', direction: 'R', nextState: 'q0' },
      { id: '23', currentState: 'q5', readSymbol: 'Y', writeSymbol: 'Y', direction: 'R', nextState: 'q0' },
      { id: '24', currentState: 'q5', readSymbol: 'B', writeSymbol: 'B', direction: 'R', nextState: 'q0' },
    ],
  },
];

export const BLANK_SYMBOL = 'B';
export const DEFAULT_PRESET = PRESETS[0];
