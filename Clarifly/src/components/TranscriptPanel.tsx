'use client';

interface TranscriptPanelProps {
  transcript: string;
  isProcessing?: boolean;
}

export default function TranscriptPanel({ transcript, isProcessing = false }: TranscriptPanelProps) {
  if (!transcript && !isProcessing) {
    return null;
  }

  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      alert('Transcript copied to clipboard!');
    } catch {
      console.error('Failed to copy transcript');
    }
  };

  const handleDownloadTranscript = () => {
    const element = document.createElement('a');
    const file = new Blob([transcript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Transcript</h2>
        <div className="flex gap-2">
          {transcript && (
            <>
              <button
                onClick={handleCopyTranscript}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                title="Copy transcript to clipboard"
              >
                📋 Copy
              </button>
              <button
                onClick={handleDownloadTranscript}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                title="Download transcript as text file"
              >
                ⬇️ Download
              </button>
            </>
          )}
        </div>
      </div>

      {isProcessing && !transcript && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin text-4xl mb-4">⏳</div>
            </div>
            <p className="text-gray-600 font-medium">Processing your audio...</p>
            <p className="text-sm text-gray-500 mt-2">This usually takes a few seconds.</p>
          </div>
        </div>
      )}

      {transcript && !isProcessing && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">{transcript}</p>
        </div>
      )}
    </div>
  );
}
