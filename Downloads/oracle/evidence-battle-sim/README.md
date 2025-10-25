# Evidence Battle Simulator

🏛️ **Master evidence objections through AI-powered courtroom practice**

A legal technology application designed to help law students and litigators practice real-time evidence objections against sophisticated AI opponents.

## 🚀 Quick Start

The app is currently running at: **http://localhost:5173/**

### Prerequisites
- Node.js 18+ installed
- Firebase project with Firestore and Anonymous Auth enabled
- Anthropic API key

### Environment Setup

The `.env.local` file is already configured with:
- ✅ Anthropic API key
- ✅ Firebase credentials

### Running the App

```bash
npm run dev
```

Then open http://localhost:5173/ in your browser.

## 📋 Features

### Three Practice Modes

#### 1. 📄 Scripted Examination
- Paste your own Q&A examination script
- AI executes it line-by-line
- Focus on specific scenarios you need to practice

#### 2. ⚖️ Case-Based Dynamic
- Input case details (parties, claims, facts)
- AI generates realistic examination questions
- Choose direct or cross-examination
- Questions tailored to your case facts

#### 3. 🤖 AI-Generated Scenario
- Zero setup required
- AI creates complete case from scratch
- Random civil or criminal scenarios
- Perfect for rapid-fire practice

### Core Features

- **Real-Time Objections**: Large, prominent "OBJECT!" button
- **Two-Step Objection Process**:
  1. State objection name (Hearsay, Leading, etc.)
  2. State grounds and rule citation
- **AI Counter-Arguments**: Sophisticated opposing counsel responses
- **Judge Rulings**: Educational rulings with justifications
- **Two Rulesets**:
  - Federal Rules of Evidence (FRE) - Full complexity
  - Mock Trial Rules - Simplified for competitions

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude (Claude 3.5 Sonnet)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Anonymous Auth

### Project Structure

```
src/
├── components/
│   ├── courtroom/          # Core courtroom UI components
│   │   ├── CourtroomDisplay.tsx
│   │   ├── ObjectionButton.tsx
│   │   └── ObjectionForm.tsx
│   ├── modes/              # Mode-specific setup screens
│   │   ├── ModeSelector.tsx
│   │   ├── ScriptedMode.tsx
│   │   ├── CaseBasedMode.tsx
│   │   └── AIGeneratedMode.tsx
│   └── BattleArena.tsx     # Main battle orchestration
├── services/
│   ├── ai.ts               # Anthropic AI integration
│   ├── firebase.ts         # Firebase/Firestore operations
│   └── rules.ts            # FRE & Mock Trial rulesets
├── hooks/
│   └── useBattle.ts        # Battle state management
├── types/
│   └── index.ts            # TypeScript definitions
└── App.tsx                 # Main app router
```

## 🎯 Key Components

### AI Service (`src/services/ai.ts`)
The most critical component for achieving 85% fidelity goal:
- `generateExaminingCounselQuestion()` - Creates strategic questions
- `generateWitnessResponse()` - Realistic witness answers
- `generateCounterArgument()` - **Critical**: Sophisticated legal arguments
- `generateJudgeRuling()` - Educational rulings with justifications

### Rules Engine (`src/services/rules.ts`)
- Full FRE rules: 401-403, 602, 611(c), 701, 802-803, 901, 1002
- Simplified Mock Trial ruleset
- Rule lookup and objection matching

### Battle Hook (`src/hooks/useBattle.ts`)
Manages entire battle lifecycle:
- Examination progression
- Objection flow (Objection → Counter → Ruling)
- Transcript management
- Statistics tracking

## 🔥 Next Steps

### Immediate Testing
1. Open http://localhost:5173/
2. Select a ruleset (FRE or Mock Trial)
3. Choose a mode
4. Start practicing!

### To Deploy (When Ready)
1. Build: `npm run build`
2. Deploy `dist/` folder to:
   - Vercel (recommended)
   - Netlify
   - Firebase Hosting

### Future Enhancements (V2)
- [ ] Text-to-Speech for courtroom roles
- [ ] User profiles and progress tracking
- [ ] Analytics dashboard
- [ ] More FRE rules coverage
- [ ] Multiplayer mode (practice with peers)

## 🐛 Troubleshooting

### Firebase Issues
If you see Firebase errors, ensure you've enabled:
1. Firestore Database (in test mode for development)
2. Authentication → Anonymous provider

### API Key Issues
If AI isn't responding:
1. Check `.env.local` has valid `VITE_ANTHROPIC_API_KEY`
2. Verify API key has credits
3. Check browser console for errors

### Build Issues
If build fails:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📊 Success Metrics (PRD Goals)

- **Fidelity Goal**: 85% of users rate AI arguments as "Courtroom Quality"
- **Educational Impact**: 20% proficiency increase after 10 objection battles
- **Engagement**: Users complete 3+ battles per month

## 🏛️ Evidence Rules Covered

### Federal Rules of Evidence (FRE)
- **401-403**: Relevance and probative value
- **602**: Personal knowledge requirement
- **611(c)**: Leading questions
- **701**: Lay opinion testimony
- **802-803**: Hearsay rule and exceptions
- **901**: Authentication
- **1002**: Best evidence rule

### Mock Trial Rules
Simplified versions of:
- Relevance
- Leading questions
- Hearsay
- Personal knowledge
- Opinion testimony
- Authentication
- Unfair prejudice

## 📝 License

Private project - All rights reserved

## 🙋 Support

For issues or questions about the codebase, check:
1. Browser console for errors
2. Terminal output for server errors
3. `.env.local` configuration

---

**Built with** ⚖️ **for law students and litigators**

**Status**: ✅ **LIVE AND RUNNING** at http://localhost:5173/
