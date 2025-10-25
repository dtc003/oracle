import React, { useState } from 'react';
import { CaseType, ExaminationType, CaseBasedModeConfig } from '../../types';

interface CaseBasedModeProps {
  onStartBattle: (config: CaseBasedModeConfig) => void;
  onBack: () => void;
}

export function CaseBasedMode({ onStartBattle, onBack }: CaseBasedModeProps) {
  const [caseType, setCaseType] = useState<CaseType>('CIVIL');
  const [examinationType, setExaminationType] = useState<ExaminationType>('DIRECT');
  const [parties, setParties] = useState({
    plaintiff: '',
    defendant: '',
    prosecution: ''
  });
  const [claims, setClaims] = useState('');
  const [keyFacts, setKeyFacts] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: CaseBasedModeConfig = {
      caseType,
      parties,
      claims,
      keyFacts,
      examinationType
    };

    onStartBattle(config);
  };

  const exampleCivil = {
    plaintiff: 'Jane Smith',
    defendant: 'ABC Corporation',
    claims: 'Personal injury from defective product',
    keyFacts: `• Plaintiff purchased a coffee maker from defendant in January 2024
• Coffee maker exploded on February 1, 2024, causing burns to plaintiff's hands
• Plaintiff required emergency treatment and has permanent scarring
• Defendant was aware of similar incidents with this model prior to plaintiff's purchase
• No recall was issued`
  };

  const exampleCriminal = {
    prosecution: 'State of California',
    defendant: 'John Doe',
    claims: 'Burglary in the First Degree',
    keyFacts: `• Defendant allegedly broke into a residence on Main Street on October 15, 2024
• Homeowner was present during the alleged break-in
• Police found defendant's fingerprints on a window
• Stolen items worth $5,000 were recovered from defendant's vehicle
• Defendant claims he was at a friend's house at the time of the incident`
  };

  const loadExample = () => {
    if (caseType === 'CIVIL') {
      setParties({
        plaintiff: exampleCivil.plaintiff,
        defendant: exampleCivil.defendant,
        prosecution: ''
      });
      setClaims(exampleCivil.claims);
      setKeyFacts(exampleCivil.keyFacts);
    } else {
      setParties({
        plaintiff: '',
        defendant: exampleCriminal.defendant,
        prosecution: exampleCriminal.prosecution
      });
      setClaims(exampleCriminal.claims);
      setKeyFacts(exampleCriminal.keyFacts);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="text-white hover:text-gray-300 mb-6 flex items-center gap-2"
        >
          ← Back to Mode Selection
        </button>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              ⚖️ Case-Based Dynamic Examination
            </h1>
            <p className="text-gray-600">
              Provide details about your case, and the AI will generate a realistic examination
              with witness testimony tailored to your scenario.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Case Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Case Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCaseType('CIVIL')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    caseType === 'CIVIL'
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🏛️</div>
                  <div className="font-bold">Civil Case</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCaseType('CRIMINAL')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    caseType === 'CRIMINAL'
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">⚖️</div>
                  <div className="font-bold">Criminal Case</div>
                </button>
              </div>
            </div>

            {/* Examination Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Examination Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setExaminationType('DIRECT')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    examinationType === 'DIRECT'
                      ? 'border-green-600 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <div className="font-bold">Direct Examination</div>
                  <div className="text-xs text-gray-600 mt-1">Your own witness</div>
                </button>
                <button
                  type="button"
                  onClick={() => setExaminationType('CROSS')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    examinationType === 'CROSS'
                      ? 'border-green-600 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <div className="font-bold">Cross-Examination</div>
                  <div className="text-xs text-gray-600 mt-1">Opposing witness</div>
                </button>
              </div>
            </div>

            {/* Parties */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Parties Involved
              </label>
              {caseType === 'CIVIL' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      value={parties.plaintiff}
                      onChange={(e) => setParties({ ...parties, plaintiff: e.target.value })}
                      placeholder="Plaintiff name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={parties.defendant}
                      onChange={(e) => setParties({ ...parties, defendant: e.target.value })}
                      placeholder="Defendant name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      value={parties.prosecution}
                      onChange={(e) => setParties({ ...parties, prosecution: e.target.value })}
                      placeholder="Prosecution (e.g., State of California)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={parties.defendant}
                      onChange={(e) => setParties({ ...parties, defendant: e.target.value })}
                      placeholder="Defendant name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Claims */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Claims / Charges
              </label>
              <input
                type="text"
                value={claims}
                onChange={(e) => setClaims(e.target.value)}
                placeholder={caseType === 'CIVIL' ? 'e.g., Negligence, Personal Injury' : 'e.g., Burglary, Assault'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Key Facts */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Key Facts (bullet points)
              </label>
              <textarea
                value={keyFacts}
                onChange={(e) => setKeyFacts(e.target.value)}
                placeholder="• Fact 1&#10;• Fact 2&#10;• Fact 3"
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Example Button */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">💡 Need an example?</p>
              <button
                type="button"
                onClick={loadExample}
                className="text-sm text-blue-700 hover:text-blue-900 underline"
              >
                Load example {caseType.toLowerCase()} case
              </button>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Generate Examination 🚀
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
