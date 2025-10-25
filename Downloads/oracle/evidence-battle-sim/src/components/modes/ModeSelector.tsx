import React from 'react';
import { ExaminationMode, RulesetType, User } from '../../types';
import { getAllRulesets } from '../../services/rules';
import { canAccessMode } from '../../config/subscriptionPlans';

interface ModeSelectorProps {
  onSelectMode: (mode: ExaminationMode, ruleset: RulesetType) => void;
  onUpgrade?: () => void;
  user: User | null;
}

export function ModeSelector({ onSelectMode, onUpgrade, user }: ModeSelectorProps) {
  const [selectedRuleset, setSelectedRuleset] = React.useState<RulesetType>('FRE');
  const rulesets = getAllRulesets();

  const userTier = user?.subscription.tier || 'FREE';

  const modes = [
    {
      id: 'SCRIPTED' as ExaminationMode,
      title: 'Scripted Examination',
      icon: '📄',
      description: 'Paste your own Q&A script and practice objecting to prepared testimony',
      features: ['Perfect for reviewing specific scenarios', 'Use your own case materials', 'Great for exam prep'],
      requiresPro: true
    },
    {
      id: 'CASE_BASED' as ExaminationMode,
      title: 'Case-Based Dynamic',
      icon: '⚖️',
      description: 'Input case details and let AI generate a realistic examination',
      features: ['Custom case scenarios', 'AI adapts to your facts', 'Direct or cross-examination'],
      requiresPro: true
    },
    {
      id: 'AI_GENERATED' as ExaminationMode,
      title: 'AI-Generated Scenario',
      icon: '🤖',
      description: 'Instant practice with a completely AI-generated case and examination',
      features: ['Zero setup required', 'Fresh scenarios every time', 'Jump right into practice', '100% FREE forever'],
      requiresPro: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-3 px-6 py-3 bg-navy-800/50 backdrop-blur-sm rounded-full border border-gold-500/30">
              <span className="text-2xl">⚖️</span>
              <span className="text-gold-400 font-serif text-sm font-semibold tracking-wide uppercase">Legal Excellence</span>
            </div>
          </div>
          <h1 className="text-6xl sm:text-7xl font-serif font-bold text-white mb-6 tracking-tight">
            Evidence Battle Simulator
          </h1>
          <p className="text-xl text-navy-200 max-w-2xl mx-auto font-light">
            Master evidence objections through AI-powered courtroom practice
          </p>
        </div>

        {/* Ruleset Selection */}
        <div className="card">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy-900 to-navy-700 text-white flex items-center justify-center font-serif font-bold text-xl shadow-lg">
              1
            </div>
            <h2 className="text-3xl font-serif font-bold text-navy-900">
              Select Your Ruleset
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {rulesets.map((ruleset) => (
              <button
                key={ruleset.type}
                onClick={() => setSelectedRuleset(ruleset.type)}
                className={`group p-8 rounded-2xl border-3 transition-all text-left relative overflow-hidden shadow-md hover:shadow-2xl transform hover:-translate-y-1 ${
                  selectedRuleset === ruleset.type
                    ? 'border-navy-700 bg-gradient-to-br from-navy-50 to-white shadow-2xl scale-105'
                    : 'border-navy-200 hover:border-navy-500 bg-white'
                }`}
                style={{ borderWidth: '3px' }}
              >
                {selectedRuleset === ruleset.type && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <h3 className="text-2xl font-serif font-bold text-navy-900 mb-3">
                  {ruleset.name}
                </h3>
                <p className="text-sm text-navy-600 leading-relaxed mb-4">
                  {ruleset.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-navy-500">
                  <span className="px-3 py-1 bg-navy-100 rounded-full font-medium">
                    {ruleset.rules.length} rules covered
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="card">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy-900 to-navy-700 text-white flex items-center justify-center font-serif font-bold text-xl shadow-lg">
              2
            </div>
            <h2 className="text-3xl font-serif font-bold text-navy-900">
              Choose Your Practice Mode
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {modes.map((mode) => {
              const isLocked = mode.requiresPro && !canAccessMode(mode.id, userTier);

              return (
                <div
                  key={mode.id}
                  className={`group bg-white rounded-2xl p-8 flex flex-col shadow-lg border-2 transition-all duration-300 relative ${
                    isLocked
                      ? 'border-gray-300 opacity-90'
                      : 'border-navy-200 hover:border-navy-500 hover:shadow-2xl'
                  }`}
                >
                  {/* Lock Badge */}
                  {isLocked && (
                    <div className="absolute -top-3 -right-3 bg-gold-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}

                  {/* Free Badge for AI mode */}
                  {mode.id === 'AI_GENERATED' && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      FREE
                    </div>
                  )}

                  <div className={`text-6xl mb-6 text-center transition-transform ${
                    isLocked ? 'opacity-50' : 'group-hover:scale-110'
                  }`}>
                    {mode.icon}
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-navy-900 mb-4 text-center">
                    {mode.title}
                  </h3>

                  <p className={`text-sm mb-6 text-center leading-relaxed flex-1 ${
                    isLocked ? 'text-gray-500' : 'text-navy-600'
                  }`}>
                    {mode.description}
                  </p>

                  <ul className="text-xs text-navy-500 space-y-3 mb-8">
                    {mode.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-navy-600 mt-0.5 font-bold">•</span>
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isLocked ? (
                    <div className="space-y-3">
                      <div className="bg-gold-50 border border-gold-200 rounded-lg p-3 text-center">
                        <p className="text-xs font-semibold text-gold-800 mb-1">
                          🔒 Pro Feature
                        </p>
                        <p className="text-xs text-gold-700">
                          Upgrade to unlock this mode
                        </p>
                      </div>
                      <button
                        onClick={onUpgrade}
                        className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl hover:from-gold-600 hover:to-gold-700 transition-all duration-200 transform hover:-translate-y-1 text-center"
                      >
                        Upgrade to Pro →
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectMode(mode.id, selectedRuleset)}
                      className={`w-full font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 border-2 transform hover:-translate-y-1 text-center ${
                        mode.id === 'AI_GENERATED'
                          ? 'bg-green-600 text-white hover:bg-green-700 border-green-600 hover:border-green-700'
                          : 'bg-navy-900 text-white hover:bg-navy-800 border-navy-900 hover:border-navy-700'
                      }`}
                    >
                      Start Practice →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-navy-300 text-sm">
          <p className="font-serif">Built to help law students and litigators master evidence objections</p>
          <p className="mt-2">
            Currently using: <span className="font-semibold text-gold-400">
              {rulesets.find(r => r.type === selectedRuleset)?.name}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
