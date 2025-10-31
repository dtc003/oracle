import React, { useState } from 'react';
import { ScriptedQA } from '../../types';
import { parseScript } from '../../services/openai';

interface ScriptedModeProps {
  onStartBattle: (script: ScriptedQA[]) => void;
  onBack: () => void;
}

export function ScriptedMode({ onStartBattle, onBack }: ScriptedModeProps) {
  const [scriptText, setScriptText] = useState('');
  const [parsedScript, setParsedScript] = useState<ScriptedQA[] | null>(null);
  const [error, setError] = useState<string>('');

  const exampleScript = `Q: Where were you on the night of October 15th?
A: I was at the grocery store on Main Street.

Q: What time did you arrive at the store?
A: Around 8:30 PM.

Q: What did you see when you got there?
A: I saw the defendant's car in the parking lot.

Q: How do you know it was the defendant's car?
A: My neighbor told me it was his car.

Q: What happened next?
A: The defendant came running out of the store.`;

  const handleParse = () => {
    setError('');
    if (!scriptText.trim()) {
      setError('Please enter a script');
      return;
    }

    try {
      const parsed = parseScript(scriptText);
      if (parsed.length === 0) {
        setError('No Q&A pairs found. Make sure your script uses "Q:" and "A:" format.');
        return;
      }
      setParsedScript(parsed);
    } catch (err) {
      setError('Failed to parse script. Please check the format.');
    }
  };

  const handleStart = () => {
    if (parsedScript) {
      onStartBattle(parsedScript);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="text-white hover:text-gray-300 mb-6 flex items-center gap-2"
        >
          ← Back to Mode Selection
        </button>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              📄 Scripted Examination Mode
            </h1>
            <p className="text-gray-600">
              Paste your Q&A examination script below. The AI will execute it line-by-line,
              and you can practice objecting in real-time.
            </p>
          </div>

          {!parsedScript ? (
            <>
              {/* Script Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Your Examination Script
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Format: Use "Q:" for questions and "A:" for answers. Each Q&A pair on separate lines.
                </p>
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder={exampleScript}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Example */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">💡 Example Format:</p>
                <pre className="text-xs text-blue-800 font-mono whitespace-pre-wrap">
                  {exampleScript}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setScriptText(exampleScript)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Use Example Script
                </button>
                <button
                  onClick={handleParse}
                  disabled={!scriptText.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Parse Script →
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Parsed Script Preview */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  ✓ Script Parsed Successfully
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Found {parsedScript.length} Q&A pairs. Review below:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {parsedScript.map((qa, idx) => (
                    <div key={qa.id} className="mb-4 last:mb-0">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-2">
                        <p className="text-xs text-gray-500 mb-1">Question {idx + 1}</p>
                        <p className="text-sm text-gray-800">{qa.question}</p>
                      </div>
                      <div className="bg-gray-100 border-l-4 border-gray-400 p-3 rounded">
                        <p className="text-xs text-gray-500 mb-1">Answer {idx + 1}</p>
                        <p className="text-sm text-gray-800">{qa.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Battle */}
              <div className="flex gap-4">
                <button
                  onClick={() => setParsedScript(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  ← Edit Script
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Start Battle! 🚀
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
