'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import RecorderPanel from '@/components/RecorderPanel';
import TranscriptPanel from '@/components/TranscriptPanel';
import TaskListPanel from '@/components/TaskListPanel';
import SpeechControls from '@/components/SpeechControls';
import { transcribeAudio } from '@/utils/transcription';
import { generateTasksFromTranscript } from '@/utils/taskGeneration';
import type { GeneratedTask } from '@/types';

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);

    try {
      // Simulate a slight delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Transcribe the audio
      const transcribedText = await transcribeAudio(blob);
      setTranscript(transcribedText);

      // Generate tasks from transcript
      const generatedTasks = generateTasksFromTranscript(transcribedText);
      setTasks(generatedTasks);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('An error occurred while processing your audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setTranscript('');
    setTasks([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Record. Understand. Succeed.
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Clarifly transforms your lectures into clear, actionable task lists. Designed for students who benefit from clearer instructions and multi-sensory learning.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">🎤 Audio Recording</span>
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">✓ Task Generation</span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">🔊 Text-to-Speech</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <div className="space-y-8">
          {/* Recording Panel */}
          <RecorderPanel onRecordingComplete={handleRecordingComplete} disabled={isProcessing} />

          {/* Transcript Panel */}
          <TranscriptPanel transcript={transcript} isProcessing={isProcessing} />

          {/* Task List Panel */}
          <TaskListPanel tasks={tasks} isProcessing={isProcessing} />

          {/* Speech Controls */}
          {(transcript || tasks.length > 0) && <SpeechControls transcript={transcript} tasks={tasks} />}

          {/* Reset Button */}
          {(transcript || tasks.length > 0) && (
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-all"
              >
                🔄 Start New Recording
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-gray-900">Clarifly</h3>
              <p className="text-sm text-gray-600">Making classroom content clearer for all students</p>
            </div>
            <div className="text-sm text-gray-500">
              <p>♿ Designed with accessibility in mind for SPED students and all learners</p>
              <p>🎯 MVP v0.1.0 • Built with Next.js, TypeScript & Tailwind CSS</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
