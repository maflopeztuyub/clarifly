'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import RecorderPanel from '@/components/RecorderPanel';
import TranscriptPanel from '@/components/TranscriptPanel';
import type { CapturedStep } from '@/types';

export default function Home() {
  const [capturedTranscript, setCapturedTranscript] = useState('');
  const [steps, setSteps] = useState<CapturedStep[]>([]);

  const handleCapture = (transcript: string, capturedSteps: CapturedStep[]) => {
    setCapturedTranscript(transcript);
    setSteps(capturedSteps);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <RecorderPanel onCapture={handleCapture} />
        {capturedTranscript && <TranscriptPanel transcript={capturedTranscript} steps={steps} />}
      </div>
    </main>
  );
}