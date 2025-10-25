import { useState, useEffect } from 'react';
import { ModeSelector } from './components/modes/ModeSelector';
import { ScriptedMode } from './components/modes/ScriptedMode';
import { CaseBasedMode } from './components/modes/CaseBasedMode';
import { AIGeneratedMode } from './components/modes/AIGeneratedMode';
import { BattleArena } from './components/BattleArena';
import { BattleProvider, useBattleContext } from './context/BattleContext';
import {
  ExaminationMode,
  RulesetType,
  ScriptedQA,
  CaseBasedModeConfig,
  AIGeneratedModeConfig
} from './types';
import { generateFullScenario } from './services/ai';
import { signInAnonymousUser } from './services/firebase';

type AppScreen = 'MODE_SELECT' | 'SCRIPTED_SETUP' | 'CASE_BASED_SETUP' | 'AI_GENERATED_SETUP' | 'BATTLE';

function AppContent() {
  const [screen, setScreen] = useState<AppScreen>('MODE_SELECT');
  const [selectedMode, setSelectedMode] = useState<ExaminationMode | null>(null);
  const [selectedRuleset, setSelectedRuleset] = useState<RulesetType>('FRE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  console.log('AppContent rendering, screen:', screen);

  const { startBattle } = useBattleContext();

  // Sign in anonymously on load
  useEffect(() => {
    // Temporarily disabled for testing - Firebase not set up yet
    // signInAnonymousUser().catch(err => {
    //   console.error('Auth error:', err);
    //   // Continue anyway - auth is not critical for v1
    // });
    console.log('App loaded successfully!');
  }, []);

  const handleModeSelect = (mode: ExaminationMode, ruleset: RulesetType) => {
    setSelectedMode(mode);
    setSelectedRuleset(ruleset);

    switch (mode) {
      case 'SCRIPTED':
        setScreen('SCRIPTED_SETUP');
        break;
      case 'CASE_BASED':
        setScreen('CASE_BASED_SETUP');
        break;
      case 'AI_GENERATED':
        setScreen('AI_GENERATED_SETUP');
        break;
    }
  };

  const handleScriptedStart = (script: ScriptedQA[]) => {
    startBattle('SCRIPTED', selectedRuleset, { script });
    setScreen('BATTLE');
  };

  const handleCaseBasedStart = async (config: CaseBasedModeConfig) => {
    setIsLoading(true);
    setError('');

    try {
      const caseData = {
        id: crypto.randomUUID(),
        caseType: config.caseType,
        parties: config.parties,
        claims: config.claims,
        keyFacts: config.keyFacts,
        examinationType: config.examinationType,
        createdAt: new Date(),
        userId: 'anonymous'
      };

      startBattle('CASE_BASED', selectedRuleset, { caseData });
      setScreen('BATTLE');
    } catch (err) {
      setError('Failed to start case-based battle. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIGeneratedStart = async (config: AIGeneratedModeConfig) => {
    setIsLoading(true);
    setError('');

    try {
      const scenario = await generateFullScenario(
        selectedRuleset,
        config.preferredScenarioType
      );

      startBattle('AI_GENERATED', selectedRuleset, { scenario });
      setScreen('BATTLE');
    } catch (err) {
      setError('Failed to generate scenario. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setScreen('MODE_SELECT');
    setSelectedMode(null);
  };

  const handleExit = () => {
    setScreen('MODE_SELECT');
    setSelectedMode(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => {
              setError('');
              handleBack();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Back to Mode Selection
          </button>
        </div>
      </div>
    );
  }

  switch (screen) {
    case 'MODE_SELECT':
      return <ModeSelector onSelectMode={handleModeSelect} />;

    case 'SCRIPTED_SETUP':
      return <ScriptedMode onStartBattle={handleScriptedStart} onBack={handleBack} />;

    case 'CASE_BASED_SETUP':
      return <CaseBasedMode onStartBattle={handleCaseBasedStart} onBack={handleBack} />;

    case 'AI_GENERATED_SETUP':
      return <AIGeneratedMode onStartBattle={handleAIGeneratedStart} onBack={handleBack} />;

    case 'BATTLE':
      return <BattleArena onExit={handleExit} />;

    default:
      return <ModeSelector onSelectMode={handleModeSelect} />;
  }
}

function App() {
  return (
    <BattleProvider>
      <AppContent />
    </BattleProvider>
  );
}

export default App;
