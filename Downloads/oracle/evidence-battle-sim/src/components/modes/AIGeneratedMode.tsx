import React, { useState } from 'react';
import { AIGeneratedModeConfig } from '../../types';

interface AIGeneratedModeProps {
  onStartBattle: (config: AIGeneratedModeConfig) => void;
  onBack: () => void;
}

export function AIGeneratedMode({ onStartBattle, onBack }: AIGeneratedModeProps) {
  const [scenarioType, setScenarioType] = useState<'CIVIL' | 'CRIMINAL' | 'RANDOM'>('RANDOM');

  const handleStart = () => {
    onStartBattle({ preferredScenarioType: scenarioType });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="text-white hover:text-gray-300 mb-6 flex items-center gap-2"
        >
          ← Back to Mode Selection
        </button>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-8 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              AI-Generated Scenario
            </h1>
            <p className="text-gray-600">
              The fastest way to practice! AI creates a complete courtroom scenario instantly.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Choose Your Scenario Type (Optional)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setScenarioType('CIVIL')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  scenarioType === 'CIVIL'
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="text-3xl mb-2">🏛️</div>
                <div className="font-bold text-sm">Civil Case</div>
              </button>
              <button
                onClick={() => setScenarioType('CRIMINAL')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  scenarioType === 'CRIMINAL'
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="text-3xl mb-2">⚖️</div>
                <div className="font-bold text-sm">Criminal Case</div>
              </button>
              <button
                onClick={() => setScenarioType('RANDOM')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  scenarioType === 'RANDOM'
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="text-3xl mb-2">🎲</div>
                <div className="font-bold text-sm">Surprise Me!</div>
              </button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h4 className="font-semibold text-green-900 mb-3">What You'll Get:</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Complete case background with parties and claims</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Realistic witness with name, role, and background</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>AI-generated examination questions and witness answers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Strategic questions designed to test your objection skills</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">💡 Pro Tip:</span> This mode is perfect for rapid-fire
              practice sessions. The AI generates fresh scenarios every time, so you can practice
              multiple rounds without repetition!
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-lg transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleStart}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              Generate & Start! 🚀
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Scenario generation typically takes 5-10 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
