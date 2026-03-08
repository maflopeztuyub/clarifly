'use client';

import { useState } from 'react';
import { speakText, stopSpeaking, isSpeaking, pauseSpeaking, resumeSpeaking } from '@/utils/speechSynthesis';
import type { GeneratedTask } from '@/types';

interface SpeechControlsProps {
  transcript: string;
  tasks: GeneratedTask[];
}

type SpeakMode = 'none' | 'summary' | 'transcript' | 'tasks';

export default function SpeechControls({ transcript, tasks }: SpeechControlsProps) {
  const [currentMode, setCurrentMode] = useState<SpeakMode>('none');
  const [isPaused, setIsPaused] = useState(false);

  if (!transcript && tasks.length === 0) {
    return null;
  }

  const handleSpeakSummary = () => {
    if (currentMode === 'summary' && isSpeaking()) {
      stopSpeaking();
      setCurrentMode('none');
      setIsPaused(false);
      return;
    }

    const summary = `You recorded a lecture with ${tasks.length} identified tasks. ${tasks
      .map((task, idx) => {
        return `Task ${idx + 1}: ${task.rephrased}`;
      })
      .join(' ')} That's a summary of your class notes.`;

    speakText(summary, () => {
      setCurrentMode('none');
      setIsPaused(false);
    });

    setCurrentMode('summary');
    setIsPaused(false);
  };

  const handleSpeakTranscript = () => {
    if (currentMode === 'transcript' && isSpeaking()) {
      stopSpeaking();
      setCurrentMode('none');
      setIsPaused(false);
      return;
    }

    speakText(transcript, () => {
      setCurrentMode('none');
      setIsPaused(false);
    });

    setCurrentMode('transcript');
    setIsPaused(false);
  };

  const handleSpeakTasks = () => {
    if (currentMode === 'tasks' && isSpeaking()) {
      stopSpeaking();
      setCurrentMode('none');
      setIsPaused(false);
      return;
    }

    const tasksText = tasks.map((task, idx) => `Task ${idx + 1}: ${task.rephrased}`).join(' ');

    speakText(tasksText, () => {
      setCurrentMode('none');
      setIsPaused(false);
    });

    setCurrentMode('tasks');
    setIsPaused(false);
  };

  const handlePause = () => {
    if (isPaused) {
      resumeSpeaking();
      setIsPaused(false);
    } else {
      pauseSpeaking();
      setIsPaused(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Hear Your Content</h2>
      <p className="text-gray-600 mb-6">Listen to your transcript or tasks being read aloud. Great for review and multi-sensory learning.</p>

      {currentMode !== 'none' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                <span className="text-2xl">🔊</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Now reading: {currentMode === 'summary' ? 'Summary' : currentMode === 'transcript' ? 'Transcript' : 'Tasks'}</p>
                <p className="text-sm text-gray-600">{isPaused ? 'Paused' : 'Playing'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Summary Button */}
        <button
          onClick={handleSpeakSummary}
          disabled={tasks.length === 0}
          className={`p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            currentMode === 'summary'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          <span className="text-xl">{currentMode === 'summary' ? '⏹️' : '📢'}</span>
          {currentMode === 'summary' ? 'Stop Summary' : 'Read Summary'}
        </button>

        {/* Transcript Button */}
        <button
          onClick={handleSpeakTranscript}
          disabled={!transcript}
          className={`p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            currentMode === 'transcript'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          <span className="text-xl">{currentMode === 'transcript' ? '⏹️' : '📖'}</span>
          {currentMode === 'transcript' ? 'Stop Transcript' : 'Read Transcript'}
        </button>

        {/* Tasks Button */}
        <button
          onClick={handleSpeakTasks}
          disabled={tasks.length === 0}
          className={`p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            currentMode === 'tasks'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          <span className="text-xl">{currentMode === 'tasks' ? '⏹️' : '✓'}</span>
          {currentMode === 'tasks' ? 'Stop Tasks' : 'Read Tasks'}
        </button>

        {/* Pause/Resume Button */}
        {currentMode !== 'none' && (
          <button
            onClick={handlePause}
            className="p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-yellow-100 hover:bg-yellow-200 text-yellow-900"
          >
            <span className="text-xl">{isPaused ? '▶️' : '⏸️'}</span>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>

      {currentMode === 'none' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <strong>♿ Accessibility Note:</strong> These audio features are especially helpful for students who benefit from multi-sensory learning or have visual processing differences.
          </p>
        </div>
      )}
    </div>
  );
}
