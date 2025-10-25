import React, { useState } from 'react';
import { RulesetType, CounterArgument, JudgeRuling, Rebuttal } from '../../types';
import { getAllObjections } from '../../services/rules';

interface ObjectionFormProps {
  ruleset: RulesetType;
  onSubmitObjection: (objectionName: string, grounds: string) => void;
  onSubmitRebuttal?: (rebuttalContent: string) => void;
  counterArgument?: CounterArgument;
  rebuttal?: Rebuttal;
  ruling?: JudgeRuling;
  isProcessing?: boolean;
}

export function ObjectionForm({
  ruleset,
  onSubmitObjection,
  onSubmitRebuttal,
  counterArgument,
  rebuttal,
  ruling,
  isProcessing
}: ObjectionFormProps) {
  const [objectionText, setObjectionText] = useState('');
  const [rebuttalText, setRebuttalText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (objectionText.trim()) {
      // Extract objection name from the first line or first few words
      const lines = objectionText.trim().split('\n');
      const objectionName = lines[0].substring(0, 50); // First line or 50 chars as name
      onSubmitObjection(objectionName, objectionText);
    }
  };

  const handleRebuttalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rebuttalText.trim() && onSubmitRebuttal) {
      onSubmitRebuttal(rebuttalText);
    }
  };

  const handleReset = () => {
    setObjectionText('');
    setRebuttalText('');
  };

  // If we have a ruling, show the complete battle flow
  if (ruling) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* User's Objection */}
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
          <h3 className="font-bold text-red-900 mb-2">YOUR OBJECTION</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{objectionText}</p>
        </div>

        {/* Counter-Argument */}
        {counterArgument && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-bold text-yellow-900 mb-2">EXAMINING COUNSEL'S RESPONSE</h3>
            <p className="text-sm text-gray-800 italic">"{counterArgument.content}"</p>
            {counterArgument.citeRules && counterArgument.citeRules.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                Rules cited: {counterArgument.citeRules.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* User's Rebuttal */}
        {rebuttal && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <h3 className="font-bold text-blue-900 mb-2">YOUR REBUTTAL</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{rebuttal.content}</p>
          </div>
        )}

        {/* Judge's Ruling */}
        <div className={`border-l-4 p-4 rounded ${
          ruling.decision === 'SUSTAINED'
            ? 'bg-green-50 border-green-600'
            : 'bg-orange-50 border-orange-600'
        }`}>
          <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
            ⚖ JUDGE'S RULING
          </h3>
          <div className={`text-2xl font-black mb-3 ${
            ruling.decision === 'SUSTAINED' ? 'text-green-700' : 'text-orange-700'
          }`}>
            {ruling.decision}
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">
            {ruling.justification}
          </p>
          {ruling.rulesApplied.length > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              Rules applied: {ruling.rulesApplied.join(', ')}
            </p>
          )}
        </div>

        {/* Continue Button */}
        <div className="text-center pt-4">
          <button
            onClick={handleReset}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Continue Examination →
          </button>
        </div>
      </div>
    );
  }

  // If counter-argument exists and no rebuttal yet, show rebuttal form
  if (counterArgument && !rebuttal && !ruling) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
          <h3 className="font-bold text-red-900 mb-2">YOUR OBJECTION</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{objectionText}</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <h3 className="font-bold text-yellow-900 mb-2">EXAMINING COUNSEL'S RESPONSE</h3>
          <p className="text-sm text-gray-800 italic">"{counterArgument.content}"</p>
          {counterArgument.citeRules && counterArgument.citeRules.length > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              Rules cited: {counterArgument.citeRules.join(', ')}
            </p>
          )}
        </div>

        {/* Rebuttal Form */}
        <div className="border-t-2 border-gray-200 pt-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Your Rebuttal
          </h3>
          <form onSubmit={handleRebuttalSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Respond to examining counsel's argument:
              </label>
              <textarea
                value={rebuttalText}
                onChange={(e) => setRebuttalText(e.target.value)}
                placeholder="e.g., Your Honor, counsel is mischaracterizing my objection. The statement is clearly being offered to prove the truth of the matter asserted, not merely to show state of mind. The key distinction is..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Make your rebuttal argument addressing examining counsel's response
              </p>
            </div>

            <button
              type="submit"
              disabled={!rebuttalText.trim() || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-lg"
            >
              {isProcessing ? 'Submitting Rebuttal...' : 'Submit Rebuttal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If rebuttal submitted but no ruling yet (judge is deliberating)
  if (counterArgument && rebuttal && !ruling) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
          <h3 className="font-bold text-red-900 mb-2">YOUR OBJECTION</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{objectionText}</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <h3 className="font-bold text-yellow-900 mb-2">EXAMINING COUNSEL'S RESPONSE</h3>
          <p className="text-sm text-gray-800 italic">"{counterArgument.content}"</p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
          <h3 className="font-bold text-blue-900 mb-2">YOUR REBUTTAL</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{rebuttal.content}</p>
        </div>

        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-sm text-gray-600 mt-2">Judge is deliberating...</p>
        </div>
      </div>
    );
  }

  // Single-step objection form
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        State Your Objection
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Make your objection and state your grounds:
          </label>
          <textarea
            value={objectionText}
            onChange={(e) => setObjectionText(e.target.value)}
            placeholder={ruleset === 'FRE'
              ? "e.g., Objection, hearsay! This is an out-of-court statement being offered for the truth of the matter asserted, which violates FRE 802."
              : "e.g., Objection, hearsay! The witness is testifying about what someone else said outside of court, which violates Rule 3."
            }
            rows={6}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
            required
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">
            State your objection clearly with the rule citation and grounds. Be specific and cite the applicable rule.
          </p>
        </div>

        <button
          type="submit"
          disabled={!objectionText.trim() || isProcessing}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-lg"
        >
          {isProcessing ? 'Submitting Objection...' : 'Submit Objection'}
        </button>
      </form>
    </div>
  );
}
