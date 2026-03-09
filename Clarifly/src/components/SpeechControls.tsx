'use client';

import { useState } from 'react';
import { speakText, stopSpeaking, isSpeaking } from '@/utils/speechSynthesis';

interface SpeechControlsProps {
  transcript: string;
}

export default function SpeechControls({ transcript }: SpeechControlsProps) {
  const [isReading, setIsReading] = useState(false);

  if (!transcript) {
    return null;
  }

  const handleSpeakTranscript = () => {
    if (isReading && isSpeaking()) {
      stopSpeaking();
      setIsReading(false);
      return;
    }

    speakText(transcript, () => {
      setIsReading(false);
    });

    setIsReading(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <button
        onClick={handleSpeakTranscript}
        className={`w-full p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
          isReading
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
        }`}
      >
        {isReading ? 'Stop' : 'Hear'}
      </button>
    </div>
  );
}