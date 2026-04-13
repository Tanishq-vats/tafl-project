# Turing Machine Simulator

An interactive visual simulator for Turing Machines — a fundamental model of computation.

Built with **React**, **Framer Motion**, **Tailwind CSS**, and **Firebase**.

---

## 🚀 Deploy in 60 Seconds

### Option A: Bolt.new (Zero Setup)
1. Open [bolt.new](https://bolt.new)
2. Drag-and-drop this entire folder into the editor
3. The app will auto-install dependencies and start

### Option B: Vercel
1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → Import Project → select your repo
3. Set environment variables (see Firebase setup below)
4. Click Deploy

### Option C: Local Development
```bash
npm install
npm run dev
```

---

## 🔥 Firebase Setup (for Cloud Save / Share)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (or use an existing one)
3. Add a Web App to your project (Project Settings → Web Apps → Add App)
4. Copy your config credentials
5. Create a Firestore Database in **Native mode**
6. Set Firestore Security Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /machines/{machineId} {
      allow read: if true;
      allow write: if true; // For a classroom setting — restrict in production
    }
  }
}
```

7. Populate your `.env` file (copy `.env.example` → `.env`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

> **Without Firebase**, the app works fully — only the Cloud Save/Share feature is disabled. All presets and local simulation work offline.

---

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
