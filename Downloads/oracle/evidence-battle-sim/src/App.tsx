import { useState, useEffect } from 'react';
import { ModeSelector } from './components/modes/ModeSelector';
import { ScriptedMode } from './components/modes/ScriptedMode';
import { CaseBasedMode } from './components/modes/CaseBasedMode';
import { AIGeneratedMode } from './components/modes/AIGeneratedMode';
import { BattleArena } from './components/BattleArena';
import { PricingPage } from './components/pricing/PricingPage';
import { AuthPage } from './components/auth/AuthPage';
import { SignupAfterPayment } from './components/auth/SignupAfterPayment';
import { SuccessPage } from './components/SuccessPage';
import { BattleProvider, useBattleContext } from './context/BattleContext';
import {
  ExaminationMode,
  RulesetType,
  ScriptedQA,
  CaseBasedModeConfig,
  AIGeneratedModeConfig,
  User
} from './types';
import { generateFullScenario } from './services/ai';
import { onAuthChange, getCurrentUser, signOut } from './services/auth';
import { canAccessMode } from './config/subscriptionPlans';

type AppScreen = 'HOME' | 'AUTH' | 'SCRIPTED_SETUP' | 'CASE_BASED_SETUP' | 'AI_GENERATED_SETUP' | 'BATTLE' | 'PRICING' | 'ACCOUNT' | 'SUCCESS' | 'SIGNUP_AFTER_PAYMENT';

function AppContent() {
  // Detect initial screen from URL
  const getInitialScreen = (): AppScreen => {
    const path = window.location.pathname;
    if (path.includes('/signup-after-payment')) return 'SIGNUP_AFTER_PAYMENT';
    return 'HOME';
  };

  const [screen, setScreen] = useState<AppScreen>(getInitialScreen());
  const [selectedMode, setSelectedMode] = useState<ExaminationMode | null>(null);
  const [selectedRuleset, setSelectedRuleset] = useState<RulesetType>('FRE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { startBattle } = useBattleContext();

  // Listen to auth state changes (but don't force navigation)
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch their data
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Error loading user data:', err);
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Detect Stripe checkout success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      setScreen('SUCCESS');
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setScreen('HOME');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleModeSelect = (mode: ExaminationMode, ruleset: RulesetType) => {
    setSelectedMode(mode);
    setSelectedRuleset(ruleset);

    // Check if user can access this mode
    const userTier = user?.subscription.tier || 'FREE';
    const hasAccess = canAccessMode(mode, userTier);

    // AI_GENERATED is always free and accessible
    if (mode === 'AI_GENERATED') {
      setScreen('AI_GENERATED_SETUP');
      return;
    }

    // Premium modes require login + subscription
    if (!hasAccess) {
      // Show paywall
      setScreen('PRICING');
      return;
    }

    // User has access, proceed
    switch (mode) {
      case 'SCRIPTED':
        setScreen('SCRIPTED_SETUP');
        break;
      case 'CASE_BASED':
        setScreen('CASE_BASED_SETUP');
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
      const userId = user?.id || `anonymous-${crypto.randomUUID()}`;
      const caseData = {
        id: crypto.randomUUID(),
        caseType: config.caseType,
        parties: config.parties,
        claims: config.claims,
        keyFacts: config.keyFacts,
        examinationType: config.examinationType,
        createdAt: new Date(),
        userId
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
    setScreen('HOME');
    setSelectedMode(null);
  };

  const handleExit = () => {
    setScreen('HOME');
    setSelectedMode(null);
  };

  // Show loading only while checking auth (brief moment)
  if (authLoading) {
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
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  switch (screen) {
    case 'HOME':
      return (
        <div>
          {/* Header with login/logout */}
          {user ? (
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <span className="font-bold">
                  {user.displayName || user.email}
                </span>
                <span className="ml-4 text-sm text-gray-300">
                  {user.subscription.tier === 'FREE' ? 'Free Plan' : `${user.subscription.tier} Plan`}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setScreen('ACCOUNT')}
                  className="bg-navy-700 hover:bg-navy-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Account
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-navy-700 hover:bg-navy-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <div className="text-sm text-gray-300">
                Try AI-Generated mode for free! Sign up to unlock all features.
              </div>
              <button
                onClick={() => setScreen('AUTH')}
                className="bg-gold-600 hover:bg-gold-700 px-6 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                Sign In / Sign Up
              </button>
            </div>
          )}
          <ModeSelector
            user={user}
            onSelectMode={handleModeSelect}
            onUpgrade={() => setScreen('PRICING')}
            onLogin={() => setScreen('AUTH')}
          />
        </div>
      );

    case 'AUTH':
      return <AuthPage onComplete={() => setScreen('HOME')} />;

    case 'PRICING':
      return <PricingPage user={user} onClose={() => setScreen('HOME')} />;

    case 'SCRIPTED_SETUP':
      return <ScriptedMode onStartBattle={handleScriptedStart} onBack={handleBack} />;

    case 'CASE_BASED_SETUP':
      return <CaseBasedMode onStartBattle={handleCaseBasedStart} onBack={handleBack} />;

    case 'AI_GENERATED_SETUP':
      return (
        <div>
          {isLoading ? (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
                <p className="text-white text-xl">Generating AI scenario...</p>
              </div>
            </div>
          ) : (
            <AIGeneratedMode onStartBattle={handleAIGeneratedStart} onBack={handleBack} />
          )}
        </div>
      );

    case 'BATTLE':
      return <BattleArena onExit={handleExit} />;

    case 'ACCOUNT':
      return (
        <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-gray-900 p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-6">Account Management</h1>
            {user && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <p className="text-lg font-semibold">{user.displayName || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="text-lg font-semibold">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Subscription Plan</label>
                  <p className="text-lg font-semibold">{user.subscription.tier}</p>
                </div>
                <div className="pt-4 border-t">
                  <button
                    onClick={() => setScreen('HOME')}
                    className="bg-navy-700 hover:bg-navy-800 text-white px-6 py-2 rounded-lg"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case 'SUCCESS':
      return <SuccessPage onContinue={() => setScreen('HOME')} />;

    case 'SIGNUP_AFTER_PAYMENT':
      return <SignupAfterPayment onComplete={() => setScreen('HOME')} />;

    default:
      return (
        <div>
          <ModeSelector
            user={user}
            onSelectMode={handleModeSelect}
            onUpgrade={() => setScreen('PRICING')}
            onLogin={() => setScreen('AUTH')}
          />
        </div>
      );
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
