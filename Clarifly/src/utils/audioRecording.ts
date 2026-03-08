/**
 * Web Audio API utilities for recording audio from the microphone
 * Uses the MediaRecorder API for browser-based audio recording
 */

export interface RecorderState {
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  isRecording: boolean;
  startTime: number;
}

const recorderState: RecorderState = {
  mediaRecorder: null,
  audioChunks: [],
  isRecording: false,
  startTime: 0,
};

export async function startRecording(): Promise<void> {
  try {
    // Request access to the user's microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Create a MediaRecorder instance
    const mediaRecorder = new MediaRecorder(stream);

    // Store audio chunks in an array
    const audioChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // Update recorder state
    recorderState.mediaRecorder = mediaRecorder;
    recorderState.audioChunks = audioChunks;
    recorderState.isRecording = true;
    recorderState.startTime = Date.now();

    // Start recording
    mediaRecorder.start();
  } catch (error) {
    console.error('Error accessing microphone:', error);
    throw new Error('Microphone access denied. Please check your browser permissions.');
  }
}

export async function stopRecording(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { mediaRecorder } = recorderState;

    if (!mediaRecorder || !recorderState.isRecording) {
      reject(new Error('No active recording'));
      return;
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(recorderState.audioChunks, { type: 'audio/wav' });

      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());

      // Reset state
      recorderState.mediaRecorder = null;
      recorderState.audioChunks = [];
      recorderState.isRecording = false;

      resolve(audioBlob);
    };

    mediaRecorder.stop();
  });
}

export function getRecordingDuration(): number {
  if (!recorderState.isRecording) {
    return 0;
  }
  return Math.floor((Date.now() - recorderState.startTime) / 1000);
}

export function isRecording(): boolean {
  return recorderState.isRecording;
}

export function cancelRecording(): void {
  const { mediaRecorder } = recorderState;

  if (mediaRecorder && recorderState.isRecording) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());

    recorderState.mediaRecorder = null;
    recorderState.audioChunks = [];
    recorderState.isRecording = false;
  }
}
