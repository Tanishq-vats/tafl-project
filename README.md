# Turing Machine Simulator

An interactive visual simulator for Turing Machines

## ✨ Features

- **Infinite Tape** — Visual, spring-animated tape using Framer Motion. Head stays centered, tape slides beneath it.
- **Step-by-step execution** — Use Step, Play, Pause, and Undo.
- **Transition Table Editor** — Add rules via form UI, or switch to JSON edit mode for bulk import.
- **Active Rule Highlighting** — The matching transition rule flashes in the table as it fires.
- **Presets Included:**
  - ➕ **Binary Incrementer** — Ready for your teacher to demo
  - 🔄 Binary Inverter
  - 🔢 Unary Addition
  - 🪞 Palindrome Checker (Binary)
- **Cloud Save / Share** — Save configurations to Firebase and share links
- **Execution Log** — Full trace of every step taken
- **Export Rules** — Download your transition table as JSON

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Tape.jsx            # Infinite scrolling tape (Framer Motion)
│   ├── StateDisplay.jsx    # Current state + status indicators
│   ├── ControlPanel.jsx    # Play/Pause/Step/Undo/Reset + speed
│   ├── RuleEditor.jsx      # Transition table UI + JSON editor
│   ├── PresetSelector.jsx  # Built-in machine presets
│   ├── CloudPanel.jsx      # Firebase save/load/share
│   └── ExecutionLog.jsx    # Step-by-step execution trace
├── hooks/
│   ├── useTuringMachine.js # Core TM logic (infinite tape via Map)
│   └── useFirebase.js      # Firestore CRUD operations
├── lib/
│   ├── firebase.js         # Firebase initialization
│   └── presets.js          # All preset machine definitions
├── App.jsx                 # Root component
├── main.jsx                # Entry point
└── index.css               # Global styles + Tailwind
```

---

## 🧠 How Turing Machines Work

A Turing Machine consists of:
- An **infinite tape** divided into cells, each holding a symbol (or blank `B`)
- A **read/write head** that can read and write one cell at a time
- A **finite set of states**, with one designated start state
- A **transition function** (the rules table): given (current state, read symbol) → (write symbol, direction, next state)

The machine halts when it enters an accept or reject state, or when no matching rule exists.
