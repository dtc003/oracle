import React from 'react';

interface ObjectionButtonProps {
  onObject: () => void;
  disabled?: boolean;
  isObjectionInProgress?: boolean;
}

export function ObjectionButton({ onObject, disabled, isObjectionInProgress }: ObjectionButtonProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <button
        onClick={onObject}
        disabled={disabled || isObjectionInProgress}
        className={`
          relative overflow-hidden
          text-4xl font-black uppercase tracking-wider
          px-16 py-8
          rounded-xl
          transform transition-all duration-200
          ${
            disabled || isObjectionInProgress
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-red-500/50 cursor-pointer animate-pulse-slow'
          }
        `}
        style={{
          textShadow: disabled || isObjectionInProgress ? 'none' : '2px 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        {isObjectionInProgress ? (
          <span className="flex items-center gap-3">
            <span className="animate-spin">⚖</span>
            OBJECTING...
          </span>
        ) : (
          <>
            <span className="relative z-10">⚠ OBJECT! ⚠</span>
            {!disabled && (
              <span className="absolute inset-0 bg-white opacity-20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            )}
          </>
        )}
      </button>

      <div className="mt-4 text-center">
        {disabled ? (
          <p className="text-sm text-gray-500">
            Wait for a question or answer to object
          </p>
        ) : isObjectionInProgress ? (
          <p className="text-sm text-gray-600">
            Complete your objection below
          </p>
        ) : (
          <p className="text-sm text-gray-700 font-semibold">
            Click when you hear objectionable testimony!
          </p>
        )}
      </div>

      {!disabled && !isObjectionInProgress && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
          <p className="text-xs text-blue-900 font-semibold mb-2">💡 TIP:</p>
          <p className="text-xs text-blue-800">
            Object immediately after a question is asked OR after a witness gives an answer.
            Be ready to state your objection and grounds!
          </p>
        </div>
      )}
    </div>
  );
}
