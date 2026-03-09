'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import RecorderPanel from '@/components/RecorderPanel';
import TranscriptPanel from '@/components/TranscriptPanel';
import SpeechControls from '@/components/SpeechControls';

export default function Home() {
  const [transcript, setTranscript] = useState('');

  const handleRecordingComplete = (transcriptText: string) => {
    setTranscript(transcriptText);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <div className="space-y-8">
          <RecorderPanel onRecordingComplete={handleRecordingComplete} />
          <TranscriptPanel transcript={transcript} />
          {transcript && <SpeechControls transcript={transcript} />}
        </div>
      </div>
    </main>
  );
}