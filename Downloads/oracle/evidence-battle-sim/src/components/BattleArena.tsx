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
    continueAfterRuling
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg px-8 py-5 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-navy-900 font-serif">
              Evidence Battle Simulator
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">Mode:</span> {session.mode.replace('_', ' ')} <span className="mx-2">•</span>
              <span className="font-semibold">Ruleset:</span> {session.ruleset === 'FRE' ? 'Federal Rules of Evidence' : 'Mock Trial'}
            </p>
          </div>
          <div>
            <button
              onClick={onExit}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Exit Battle
            </button>
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Main Content: Wider Transcript */}
          <div className="flex-1 min-w-0">
            <CourtroomDisplay
              transcript={session.transcript}
              isLoading={isProcessing}
            />
          </div>

          {/* Fixed Right Sidebar: Narrow with Controls + Stats */}
          <div className="w-80 flex flex-col gap-6 overflow-y-auto">
            {/* Action Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-0">
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
                      className="w-full bg-navy-700 hover:bg-navy-800 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      {isProcessing ? 'Processing...' : 'Continue →'}
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
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      Continue →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Battle Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-navy-900 mb-4 font-serif">
                Battle Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
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
