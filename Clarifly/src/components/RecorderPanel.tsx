'use client';

import { useState, useEffect } from 'react';
import { startContinuousListening, stopContinuousListening, getRecentTranscript } from '@/utils/transcription';
import { generateSimpleSteps, cleanTranscript } from '@/utils/taskGeneration';
import type { CapturedStep } from '@/types';

interface RecorderPanelProps {
  onCapture: (transcript: string, steps: CapturedStep[]) => void;
  disabled?: boolean;
}

export default function RecorderPanel({ onCapture, disabled = false }: RecorderPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    try {
      setError(null);
      startContinuousListening();
      setIsListening(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start listening';
      setError(errorMessage);
      setIsListening(false);
    }

    return () => {
      stopContinuousListening();
    };
  }, []);

  const handleCapture = () => {
    try {
      setError(null);
      const recentTranscript = getRecentTranscript(60);

      if (!recentTranscript || recentTranscript.length < 5) {
        setError('No speech detected. Please speak something first.');
        return;
      }

      const cleanedTranscript = cleanTranscript(recentTranscript);
      const steps = generateSimpleSteps(recentTranscript);
      onCapture(cleanedTranscript, steps);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center bg-white pt-16">
      <div className="flex flex-col items-center gap-6">

        <button
          onClick={handleCapture}
          disabled={disabled || !isListening}
          className="w-[200px] h-[200px] rounded-full bg-[#5170ff] hover:bg-[#4058d9] disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg transition-all duration-200 flex items-center justify-center"
        >
          <img
            src="/logo.png"
            alt="Clarifly"
            className="w-[140px] h-[140px] object-contain"
          />
        </button>

        {isListening && (
          <div className="text-center text-sm text-gray-500">
            Listening...
          </div>
        )}

        {error && (
          <div className="text-center text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}