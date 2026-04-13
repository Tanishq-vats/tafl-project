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


## 🧠 Theory

### What is a Turing Machine?

A **Turing Machine** is a theoretical mathematical model of computation invented by the British mathematician and computer scientist **Alan Mathison Turing** in **1936**. It is not a physical machine, but an abstract device that manipulates symbols on a strip of tape according to a set of rules. Despite its simplicity, a Turing Machine can simulate any algorithm that a computer can execute — making it one of the most powerful models in theoretical computer science.

---

### Historical Background

Alan Turing introduced this concept in his landmark paper:
> *"On Computable Numbers, with an Application to the Entscheidungsproblem"* (1936)

In this paper, Turing addressed a fundamental question posed by mathematician David Hilbert — whether every mathematical problem can be solved algorithmically. Turing proved that some problems are **undecidable**, meaning no algorithm can ever solve them. The Turing Machine was his tool for formalizing what it means for a problem to be "computable."

---

### Formal Definition

A Turing Machine is formally defined as a **7-tuple**:

```
M = (Q, Σ, Γ, δ, q₀, q_accept, q_reject)
```

| Component | Description |
|-----------|-------------|
| **Q** | A finite set of **states** |
| **Σ** | The **input alphabet** (does not include blank symbol) |
| **Γ** | The **tape alphabet** (Σ ⊆ Γ, includes blank symbol `_` or `□`) |
| **δ** | The **transition function**: Q × Γ → Q × Γ × {L, R} |
| **q₀** | The **start state** (q₀ ∈ Q) |
| **q_accept** | The **accept state** |
| **q_reject** | The **reject state** (q_accept ≠ q_reject) |

---

### How It Works — Components

#### 1. 📼 The Tape
- Infinite in both directions (or one direction in some models)
- Divided into discrete **cells**, each holding one symbol from the tape alphabet Γ
- Initially contains the **input string**, surrounded by blank symbols (`_`)

#### 2. 🔍 The Read/Write Head
- Points to one cell on the tape at a time
- Can **read** the current symbol
- Can **write** a new symbol to the current cell
- Can move **Left (L)** or **Right (R)** one cell at a time

#### 3. 🔄 The State Register
- Holds the **current state** of the machine
- Starts in the **initial state q₀**
- Transitions through states based on the transition function δ

#### 4. ⚙️ The Transition Function (δ)
This is the "brain" of the machine. Given the current **state** and **symbol under the head**, it tells the machine:
1. What **symbol to write** on the tape
2. Which **direction to move** (Left or Right)
3. What **next state** to enter

**Example Transition:**
```
δ(q0, '0') = (q1, '1', R)
```
> *"If in state q0 and reading '0', write '1', move Right, and go to state q1"*

---

### Types of Turing Machines

| Type | Description |
|------|-------------|
| **Deterministic TM** | Each state-symbol pair has exactly one transition |
| **Non-Deterministic TM** | Multiple transitions possible; accepts if any path accepts |
| **Multi-Tape TM** | Multiple tapes with separate heads (but equivalent in power to single-tape) |
| **Universal TM (UTM)** | Can simulate any other Turing Machine given its description |

---

### The Church-Turing Thesis

> *"Any function that can be computed algorithmically can be computed by a Turing Machine."*

This is not a provable theorem, but a widely accepted philosophical thesis. It forms the foundation of modern computation theory and suggests that Turing Machines define the **limits of what is computable**.

---

### Decidability Concepts

| Term | Meaning |
|------|---------|
| **Decidable Language** | A TM always halts and accepts/rejects correctly |
| **Recognizable Language** | A TM halts and accepts if input is in the language, may loop otherwise |
| **Undecidable Problem** | No TM can solve it for all inputs (e.g., the Halting Problem) |

#### 🔴 The Halting Problem
Turing proved that it is **impossible** to build a TM that, given any program and its input, can always determine whether that program will halt or run forever. This was the first known **undecidable problem**.

---

### Why Turing Machines Matter

- They define the theoretical **limits of computation**
- Every modern programming language is **Turing Complete** (can simulate a TM)
- They are the basis for **complexity theory** (P vs NP problems)
- Understanding TMs helps understand what computers **can and cannot** do
- Used in **compiler theory**, **automata theory**, and **algorithm design**

---

### Example: Binary Increment Machine

A simple TM that adds 1 to a binary number:

```
States: {q0, q_accept}
Tape Alphabet: {0, 1, _}

Transitions:
δ(q0, 1) = (q0, 0, L)    → flip 1 to 0, carry over, move left
δ(q0, 0) = (q_accept, 1, R)  → flip 0 to 1, done
δ(q0, _) = (q_accept, 1, R)  → blank means leading zero, write 1
```

Input: `0 1 1`  → Output: `1 0 0`  (3 + 1 = 4 in binary ✅)

---

---

## 📖 Bibliography / References

> **Copy-paste ready for your README**

---

### 📘 Foundational Papers

1. **Turing, A. M.** (1936). *On Computable Numbers, with an Application to the Entscheidungsproblem*. Proceedings of the London Mathematical Society, Series 2, 42, 230–265.
   - 🔗 [Read Online (Archive)](https://www.cs.virginia.edu/~robins/Turing_Paper_1936.pdf)

2. **Church, A.** (1936). *An Unsolvable Problem of Elementary Number Theory*. American Journal of Mathematics, 58(2), 345–363.

---

### 📗 Textbooks

3. **Sipser, M.** (2012). *Introduction to the Theory of Computation* (3rd ed.). Cengage Learning.
   - The standard undergraduate textbook on automata and Turing Machines.

4. **Hopcroft, J. E., Motwani, R., & Ullman, J. D.** (2006). *Introduction to Automata Theory, Languages, and Computation* (3rd ed.). Addison-Wesley.

5. **Papadimitriou, C. H.** (1994). *Computational Complexity*. Addison-Wesley.

6. **Lewis, H. R., & Papadimitriou, C. H.** (1998). *Elements of the Theory of Computation* (2nd ed.). Prentice Hall.

---

### 🌐 Online References

7. **Stanford Encyclopedia of Philosophy** — Turing Machines.
   - 🔗 https://plato.stanford.edu/entries/turing-machine/

8. **Wikipedia** — Turing Machine.
   - 🔗 https://en.wikipedia.org/wiki/Turing_machine

9. **GeeksforGeeks** — Turing Machine in Theory of Computation.
   - 🔗 https://www.geeksforgeeks.org/turing-machine-in-toc/

10. **Brilliant.org** — Turing Machines.
    - 🔗 https://brilliant.org/wiki/turing-machines/

---

### 🎥 Video Resources (Optional to Cite)

11. **Computerphile** (YouTube). *Turing Machines Explained*.
    - 🔗 https://www.youtube.com/watch?v=dNRDvLACg5Q

12. **MIT OpenCourseWare** — 18.404J: Theory of Computation.
    - 🔗 https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/

---

### 🗒️ Citation Format Note

> The above references use **APA 7th Edition** format, which is standard for computer science academic work.

---


