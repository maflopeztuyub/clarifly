'use client';

/**
 * Web Speech API transcription service with rolling buffer
 * Maintains continuous passive listening with access to recent 60 seconds of speech
 */

interface TranscriptChunk {
  text: string;
  timestamp: number;
}

// Custom Web Speech API type declarations to avoid conflicts
interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface BrowserSpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface BrowserSpeechRecognitionResult {
  [index: number]: BrowserSpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface BrowserSpeechRecognitionResultList {
  [index: number]: BrowserSpeechRecognitionResult;
  length: number;
}

interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: BrowserSpeechRecognitionResultList;
}

interface BrowserSpeechRecognitionErrorEvent {
  error: string;
}

// Declare window properties for browser Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

let recognition: BrowserSpeechRecognition | null = null;
let isListening = false;
let shouldStop = false;
let transcriptBuffer: TranscriptChunk[] = [];
let interimTranscript = '';
let lastChunkEndTime = 0;
const BUFFER_DURATION = 60000; // 60 seconds in milliseconds
const SILENCE_THRESHOLD = 2000; // Consider it a new chunk if gap > 2 seconds

// Initialize speech recognition with browser-specific APIs
function initializeRecognition(): SpeechRecognition {
  if (recognition) return recognition;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    throw new Error('Web Speech API is not supported in this browser');
  }

  recognition = new SpeechRecognition();
  
  // Configuration
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  // Handle results
  recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
    interimTranscript = '';
    const now = Date.now();

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        // Check if there's been a long silence since last chunk
        if (lastChunkEndTime > 0 && now - lastChunkEndTime > SILENCE_THRESHOLD) {
          // Create a new separate chunk
          transcriptBuffer.push({
            text: transcript.trim(),
            timestamp: now,
          });
        } else if (transcriptBuffer.length === 0) {
          // First chunk
          transcriptBuffer.push({
            text: transcript.trim(),
            timestamp: now,
          });
        } else {
          // Append to the last chunk with a space
          const lastChunk = transcriptBuffer[transcriptBuffer.length - 1];
          lastChunk.text = (lastChunk.text + ' ' + transcript.trim()).trim();
        }
        lastChunkEndTime = now;
      } else {
        interimTranscript += transcript;
      }
    }

    // Prune old entries to maintain the buffer window
    pruneOldChunks();
  };

  // Handle errors
  recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
    // Some errors are not critical (e.g., 'no-speech'), so we don't throw
    if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
      console.error('Speech recognition error:', event.error);
    }
  };

  // Auto-restart if listening stops due to silence
  recognition.onend = () => {
    isListening = false;
    
    // If we haven't been explicitly stopped, restart listening
    if (!shouldStop && recognition) {
      try {
        recognition.start();
        isListening = true;
      } catch (err) {
        // Already started or other error, ignore
      }
    }
  };

  return recognition;
}

/**
 * Remove entries older than the buffer window
 */
function pruneOldChunks(): void {
  const cutoffTime = Date.now() - BUFFER_DURATION;
  transcriptBuffer = transcriptBuffer.filter(chunk => chunk.timestamp > cutoffTime);
}

/**
 * Start continuous passive listening in the background
 */
export function startContinuousListening(): void {
  try {
    shouldStop = false;
    transcriptBuffer = [];
    lastChunkEndTime = 0;
    interimTranscript = '';

    const rec = initializeRecognition();
    
    if (isListening) {
      rec.stop();
    }

    rec.start();
    isListening = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start listening';
    throw new Error(message);
  }
}

/**
 * Stop continuous listening
 */
export function stopContinuousListening(): void {
  shouldStop = true;

  if (recognition && isListening) {
    try {
      recognition.stop();
    } catch (err) {
      // Already stopped or error, ignore
    }
  }

  isListening = false;
}

/**
 * Get the recent transcript from the rolling buffer
 * @param seconds How many seconds back to retrieve (default 60)
 * @returns Concatenated transcript from the buffer window
 */
export function getRecentTranscript(seconds: number = 60): string {
  const cutoffTime = Date.now() - (seconds * 1000);
  const recentChunks = transcriptBuffer.filter(chunk => chunk.timestamp > cutoffTime);
  return recentChunks.map(chunk => chunk.text).join(' ').trim();
}
