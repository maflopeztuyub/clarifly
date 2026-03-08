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
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Record Lecture Audio</h2>
      <p className="text-gray-600 mb-8">Click the button below to start recording. We'll convert your audio to text and generate helpful task lists.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">⚠️ {error}</p>
          <p className="text-sm text-red-700 mt-1">Make sure you allow microphone access in your browser.</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {/* Timer Display */}
        {(state === 'recording' || (state === 'ready' && duration > 0)) && (
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 font-mono mb-2">{formatTime(duration)}</div>
            {state === 'recording' && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">Recording in progress...</span>
              </div>
            )}
          </div>
        )}

        {/* Recording State Indicator */}
        <div className="flex items-center justify-center gap-3">
          <div
            className={`w-4 h-4 rounded-full ${
              state === 'recording'
                ? 'bg-red-500 animate-pulse'
                : state === 'processing'
                  ? 'bg-blue-500 animate-pulse'
                  : state === 'ready'
                    ? 'bg-green-500'
                    : 'bg-gray-300'
            }`}
          ></div>
          <span className="text-sm font-medium text-gray-700">
            {state === 'idle' && 'Ready to record'}
            {state === 'recording' && 'Recording...'}
            {state === 'processing' && 'Processing audio...'}
            {state === 'ready' && 'Ready for playback'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full max-w-sm">
          {state === 'idle' && (
            <button
              onClick={handleStartRecording}
              disabled={disabled}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg"
            >
              <span>🎤</span> Start Recording
            </button>
          )}

          {state === 'recording' && (
            <button
              onClick={handleStopRecording}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg"
            >
              <span>⏹️</span> Stop Recording
            </button>
          )}

          {state === 'ready' && (
            <button
              onClick={handleStartRecording}
              disabled={disabled}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg"
            >
              <span>🔄</span> Record Again
            </button>
          )}

          {(state === 'processing') && (
            <button
              disabled
              className="flex-1 bg-gray-400 cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-lg"
            >
              <span className="animate-spin">⏳</span> Processing...
            </button>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          {state === 'idle' && '💡 Tip: Make sure your microphone is working before you start recording.'}
          {state === 'recording' && '📝 Speak clearly and naturally. We\'ll capture everything you say.'}
          {state === 'processing' && '⚡ Converting your audio to text and generating tasks...'}
          {state === 'ready' && '✅ Your audio has been recorded and processed.'}
        </p>
      </div>
    </div>
  );
}
