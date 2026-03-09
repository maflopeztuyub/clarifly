'use client';

import { useState, useEffect } from 'react';
import { startRecording, stopRecording, getRecordingDuration } from '@/utils/audioRecording';
import type { RecordingState } from '@/types';

interface RecorderPanelProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export default function RecorderPanel({ onRecordingComplete, disabled = false }: RecorderPanelProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state !== 'recording') return;

    const interval = setInterval(() => {
      setDuration(getRecordingDuration());
    }, 100);

    return () => clearInterval(interval);
  }, [state]);

  const handleStartRecording = async () => {
    try {
      setError(null);
      setState('recording');
      setDuration(0);
      await startRecording();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      setState('idle');
    }
  };

  const handleStopRecording = async () => {
    try {
      setState('processing');
      const audioBlob = await stopRecording();
      onRecordingComplete(audioBlob);
      setState('ready');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMessage);
      setState('idle');
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">⚠️ {error}</p>
          <p className="text-sm text-red-700 mt-1">Make sure you allow microphone access in your browser.</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {(state === 'recording' || (state === 'ready' && duration > 0)) && (
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 font-mono mb-2">{formatTime(duration)}</div>
          </div>
        )}

        <div className="flex justify-center w-full">
          {state === 'idle' && (
            <button
              onClick={handleStartRecording}
              disabled={disabled}
              className="w-44 h-44 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold text-2xl shadow-xl transition-all duration-200 flex items-center justify-center"
            >
              Repeat
            </button>
          )}

          {state === 'recording' && (
            <button
              onClick={handleStopRecording}
              className="w-44 h-44 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-2xl shadow-xl transition-all duration-200 flex items-center justify-center"
            >
              Stop
            </button>
          )}

          {state === 'ready' && (
            <button
              onClick={handleStartRecording}
              disabled={disabled}
              className="w-44 h-44 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold text-2xl shadow-xl transition-all duration-200 flex items-center justify-center"
            >
              Again
            </button>
          )}

          {state === 'processing' && (
            <button
              disabled
              className="w-44 h-44 rounded-full bg-gray-400 cursor-not-allowed text-white font-bold text-xl shadow-xl flex items-center justify-center"
            >
              Processing...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}