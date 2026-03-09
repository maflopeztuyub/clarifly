'use client';

interface TranscriptPanelProps {
  transcript: string;
}

export default function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  if (!transcript) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Transcript</h2>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
          {transcript}
        </p>
      </div>
    </div>
  );
}