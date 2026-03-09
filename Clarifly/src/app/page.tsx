'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import RecorderPanel from '@/components/RecorderPanel';
import TranscriptPanel from '@/components/TranscriptPanel';
import SpeechControls from '@/components/SpeechControls';
import { transcribeAudio } from '@/utils/transcription';

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);

    try {
      // Simulate a slight delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Transcribe the audio
      const transcribedText = await transcribeAudio(blob);
      setTranscript(transcribedText);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('An error occurred while processing your audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setTranscript('');
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

          {/* Speech Controls */}
          {transcript && <SpeechControls transcript={transcript} />}
        </div>
      </div>
    </main>
  );
}
