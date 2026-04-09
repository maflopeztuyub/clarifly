'use client';

/**
 * Web Speech API transcription service with rolling buffer
 * Maintains continuous passive listening with access to recent 60 seconds of speech
 */

interface TranscriptChunk {
  text: string;
  timestamp: number;
}

// Custom Web Speech API type declarations
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

const BUFFER_DURATION = 60000; // 60 seconds
const SILENCE_THRESHOLD = 2000; // 2 seconds

function initializeRecognition(): BrowserSpeechRecognition {
  if (recognition) return recognition;

  const SpeechRecognitionConstructor =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) {
    throw new Error('Web Speech API is not supported in this browser');
  }

  recognition = new SpeechRecognitionConstructor();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
    interimTranscript = '';
    const now = Date.now();

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        if (lastChunkEndTime > 0 && now - lastChunkEndTime > SILENCE_THRESHOLD) {
          transcriptBuffer.push({
            text: transcript.trim(),
            timestamp: now,
          });
        } else if (transcriptBuffer.length === 0) {
          transcriptBuffer.push({
            text: transcript.trim(),
            timestamp: now,
          });
        } else {
          const lastChunk = transcriptBuffer[transcriptBuffer.length - 1];
          lastChunk.text = `${lastChunk.text} ${transcript.trim()}`.trim();
        }

        lastChunkEndTime = now;
      } else {
        interimTranscript += transcript;
      }
    }

    pruneOldChunks();
  };

  recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
    if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
      console.error('Speech recognition error:', event.error);
    }
  };

  recognition.onend = () => {
    isListening = false;

    if (!shouldStop && recognition) {
      try {
        recognition.start();
        isListening = true;
      } catch {
        // Ignore restart errors
      }
    }
  };

  return recognition;
}

function pruneOldChunks(): void {
  const cutoffTime = Date.now() - BUFFER_DURATION;
  transcriptBuffer = transcriptBuffer.filter(
    (chunk) => chunk.timestamp > cutoffTime
  );
}

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
    const message =
      error instanceof Error ? error.message : 'Failed to start listening';
    throw new Error(message);
  }
}

export function stopContinuousListening(): void {
  shouldStop = true;

  if (recognition && isListening) {
    try {
      recognition.stop();
    } catch {
      // Ignore stop errors
    }
  }

  isListening = false;
}

export function getRecentTranscript(seconds: number = 60): string {
  const cutoffTime = Date.now() - seconds * 1000;
  const recentChunks = transcriptBuffer.filter(
    (chunk) => chunk.timestamp > cutoffTime
  );

  return recentChunks.map((chunk) => chunk.text).join(' ').trim();
}