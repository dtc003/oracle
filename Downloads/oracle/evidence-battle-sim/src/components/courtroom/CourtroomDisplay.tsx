import React, { useEffect, useRef } from 'react';
import { TranscriptEntry } from '../../types';

interface CourtroomDisplayProps {
  transcript: TranscriptEntry[];
  isLoading?: boolean;
}

export function CourtroomDisplay({ transcript, isLoading }: CourtroomDisplayProps) {
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const getEntryStyles = (entry: TranscriptEntry) => {
    switch (entry.type) {
      case 'QUESTION':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'ANSWER':
        return 'bg-gray-50 border-l-4 border-gray-400';
      case 'OBJECTION':
        return 'bg-red-50 border-l-4 border-red-600 font-semibold';
      case 'ARGUMENT':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'RULING':
        return 'bg-purple-50 border-l-4 border-purple-600 font-semibold';
      default:
        return 'bg-white border-l-4 border-gray-300';
    }
  };

  const getSpeakerColor = (role: TranscriptEntry['role']) => {
    switch (role) {
      case 'EXAMINING_COUNSEL':
        return 'text-blue-700';
      case 'WITNESS':
        return 'text-gray-700';
      case 'OPPOSING_COUNSEL':
        return 'text-red-700';
      case 'JUDGE':
        return 'text-purple-700';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-900 text-white px-8 py-5 rounded-t-xl">
        <h2 className="text-2xl font-bold font-serif">Courtroom Transcript</h2>
        <p className="text-sm text-gray-200 mt-1">Live Examination</p>
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-4">
        {transcript.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">Examination will begin shortly...</p>
            <p className="text-sm mt-2">The transcript will appear here.</p>
          </div>
        ) : (
          <>
            {transcript.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-lg ${getEntryStyles(entry)} transition-all duration-200`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`font-bold text-sm uppercase ${getSpeakerColor(entry.role)}`}>
                    {entry.speaker}
                  </span>
                  <span className="text-xs text-gray-500">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-900 leading-relaxed">
                  {entry.content}
                </div>
                {entry.type === 'OBJECTION' && (
                  <div className="mt-2 text-xs text-red-600 uppercase font-semibold">
                    ⚠ Objection Made
                  </div>
                )}
                {entry.type === 'RULING' && (
                  <div className="mt-2 text-xs text-purple-600 uppercase font-semibold">
                    ⚖ Judge's Ruling
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="text-sm text-gray-600 mt-2">Processing...</p>
              </div>
            )}
          </>
        )}
        <div ref={transcriptEndRef} />
      </div>

      {/* Legend */}
      <div className="bg-gray-50 px-8 py-4 rounded-b-xl border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Question</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>Answer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>Objection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Argument</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded"></div>
            <span>Ruling</span>
          </div>
        </div>
      </div>
    </div>
  );
}
