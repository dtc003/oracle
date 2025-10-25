import React, { useEffect } from 'react';
import { useBattleContext } from '../context/BattleContext';
import { CourtroomDisplay } from './courtroom/CourtroomDisplay';
import { ObjectionButton } from './courtroom/ObjectionButton';
import { ObjectionForm } from './courtroom/ObjectionForm';

interface BattleArenaProps {
  onExit: () => void;
}

export function BattleArena({ onExit }: BattleArenaProps) {
  const [isObjecting, setIsObjecting] = React.useState(false);

  const {
    session,
    currentObjection,
    currentCounter,
    currentRuling,
    isProcessing,
    continueExamination,
    makeObjection,
    processObjection,
    continueAfterRuling,
    endBattle
  } = useBattleContext();

  // Auto-start examination when battle begins
  useEffect(() => {
    if (session && session.transcript.length === 0) {
      continueExamination();
    }
  }, [session]);

  // Auto-process objection when made
  useEffect(() => {
    if (currentObjection && !currentCounter) {
      processObjection();
    }
  }, [currentObjection, currentCounter]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading battle...</div>
      </div>
    );
  }

  const canObject = session.currentState === 'NONE' &&
    session.transcript.length > 0 &&
    !isProcessing &&
    !currentObjection;

  const showObjectionForm = isObjecting || currentObjection !== null;

  const handleObjectClick = () => {
    setIsObjecting(true);
  };

  const handleSubmitObjection = (objectionName: string, grounds: string) => {
    makeObjection(objectionName, grounds);
  };

  const handleContinue = () => {
    setIsObjecting(false);
    continueAfterRuling();
    continueExamination();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg px-6 py-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Evidence Battle Simulator
            </h1>
            <p className="text-sm text-gray-600">
              Mode: {session.mode.replace('_', ' ')} | Ruleset: {session.ruleset === 'FRE' ? 'Federal Rules of Evidence' : 'Mock Trial'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={endBattle}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition-colors"
            >
              End Battle
            </button>
            <button
              onClick={onExit}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Exit
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Transcript with inline objection button */}
          <div className="lg:col-span-2 space-y-6">
            <CourtroomDisplay
              transcript={session.transcript}
              isLoading={isProcessing}
            />

            {/* Inline Objection Controls */}
            {!showObjectionForm ? (
              <div className="space-y-4">
                <ObjectionButton
                  onObject={handleObjectClick}
                  disabled={!canObject}
                  isObjectionInProgress={false}
                />

                {/* Continue Button */}
                {canObject && session.transcript.length > 0 && (
                  <button
                    onClick={continueExamination}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                  >
                    {isProcessing ? 'Processing...' : 'Continue Examination →'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <ObjectionForm
                  ruleset={session.ruleset}
                  onSubmitObjection={handleSubmitObjection}
                  counterArgument={currentCounter || undefined}
                  ruling={currentRuling || undefined}
                  isProcessing={isProcessing}
                />

                {currentRuling && (
                  <button
                    onClick={handleContinue}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                  >
                    Continue Examination →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Battle Stats */}
          <div className="space-y-6">
            {/* Battle Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Battle Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Objections:</span>
                  <span className="font-bold">{session.objectionBattles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sustained:</span>
                  <span className="font-bold text-green-600">
                    {session.objectionBattles.filter(b => b.ruling.decision === 'SUSTAINED').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overruled:</span>
                  <span className="font-bold text-orange-600">
                    {session.objectionBattles.filter(b => b.ruling.decision === 'OVERRULED').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exchanges:</span>
                  <span className="font-bold">{Math.floor(session.transcript.filter(t => t.type === 'QUESTION').length)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
