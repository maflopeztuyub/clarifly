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
    </main>
  );
}
