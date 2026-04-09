'use client';

import type { CapturedStep } from '@/types';

interface TranscriptPanelProps {
  transcript: string;
  steps: CapturedStep[];
}

export default function TranscriptPanel({ transcript, steps }: TranscriptPanelProps) {
  if (!transcript) {
    return null;
  }

  return (
    <div className="mt-12 space-y-8">
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">What was said</h2>
        <p className="text-gray-700 leading-relaxed">
          {transcript}
        </p>
      </div>

      {steps.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Steps</h2>
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