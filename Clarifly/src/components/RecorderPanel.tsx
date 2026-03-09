'use client';

import { useState, useRef } from 'react';
import { startLiveTranscription, stopLiveTranscription } from '@/utils/transcription';
import type { RecordingState } from '@/types';

interface RecorderPanelProps {
  onRecordingComplete: (transcript: string) => void;
  disabled?: boolean;
}

export default function RecorderPanel({ onRecordingComplete, disabled = false }: RecorderPanelProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef(0);
  const [duration, setDuration] = useState(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateDuration = () => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setDuration(elapsed);
  };

  const handleStartRecording = () => {
    try {
      setError(null);
      setState('recording');
      setDuration(0);
      startTimeRef.current = Date.now();

      startLiveTranscription(() => {});

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      durationIntervalRef.current = setInterval(updateDuration, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      setState('idle');
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  const handleStopRecording = () => {
    try {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      setState('processing');
      const transcript = stopLiveTranscription();

      if (!transcript) {
        setError('No speech detected');
        setState('idle');
        return;
      }

      onRecordingComplete(transcript);
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