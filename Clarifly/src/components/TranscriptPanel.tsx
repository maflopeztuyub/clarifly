'use client';

import { useState, useEffect } from 'react';
import { speakText, stopSpeaking, isSpeaking } from '@/utils/speechSynthesis';
import type { CapturedStep } from '@/types';

interface TranscriptPanelProps {
  transcript: string;
  steps: CapturedStep[];
}

export default function TranscriptPanel({ transcript, steps }: TranscriptPanelProps) {
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [browserSupportsSpeak, setBrowserSupportsSpeak] = useState(true);

  // Check browser support on mount
  useEffect(() => {
    const supported = typeof window !== 'undefined' && !!window.speechSynthesis;
    setBrowserSupportsSpeak(supported);
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (isSpeechActive) {
        stopSpeaking();
      }
    };
  }, [isSpeechActive]);

  // Stop speech when transcript changes
  useEffect(() => {
    if (isSpeechActive) {
      stopSpeaking();
      setIsSpeechActive(false);
    }
  }, [transcript]);

  const handlePlayStop = () => {
    if (isSpeechActive && isSpeaking()) {
      stopSpeaking();
      setIsSpeechActive(false);
    } else {
      speakText(transcript, () => {
        setIsSpeechActive(false);
      });
      setIsSpeechActive(true);
    }
  };

  if (!transcript) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex gap-4">
          {browserSupportsSpeak && (
            <button
              onClick={handlePlayStop}
              className={`flex-shrink-0 w-6 h-6 rounded-full font-semibold text-xs flex items-center justify-center transition-colors ${
                isSpeechActive
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
              }`}
              title={isSpeechActive ? 'Stop playback' : 'Play transcript'}
            >
              {isSpeechActive ? '■' : '▶'}
            </button>
          )}
          {!browserSupportsSpeak && <div className="flex-shrink-0 w-6 h-6" />}
          <p className="text-gray-700 leading-relaxed pt-0.5">
            {transcript}
          </p>
        </div>
      </div>

      {steps.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">To do</h2>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={step.id} className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-gray-700 leading-relaxed pt-0.5">
                  {step.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}