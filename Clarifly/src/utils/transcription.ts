/**
 * Mock transcription service
 * In production, this would call a real speech-to-text API like:
 * - Google Cloud Speech-to-Text
 * - AWS Transcribe
 * - OpenAI Whisper
 * - Azure Speech Services
 */

const MOCK_TRANSCRIPTS = [
  'For next class, read pages 45 to 60, finish the worksheet, and bring one question about the reading.',
  'Your group presentation outline is due Monday, and each person should prepare one research source.',
  'Study the formulas from today\'s lesson and solve problems 1 through 10 before Friday.',
  'The essay must be 3000 words minimum, use at least 5 scholarly sources, and be submitted by Wednesday midnight.',
  'Complete the lab report, include charts and graphs from your experiment, and turn it in by end of week.',
];

export async function transcribeAudio(_audioBlob: Blob): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return a random mock transcript
  return MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)];
}

/**
 * In a production implementation, you would:
 * 1. Send the audioBlob to your backend
 * 2. Your backend calls a speech-to-text service
 * 3. Return the transcript string
 * 
 * Example production implementation:
 * 
 * export async function transcribeAudio(audioBlob: Blob): Promise<string> {
 *   const formData = new FormData();
 *   formData.append('audio', audioBlob);
 * 
 *   const response = await fetch('/api/transcribe', {
 *     method: 'POST',
 *     body: formData,
 *   });
 * 
 *   if (!response.ok) throw new Error('Transcription failed');
 *   const data = await response.json();
 *   return data.transcript;
 * }
 */
