'use client';

/**
 * Web Speech API transcription service
 * Uses the browser's built-in speech recognition (no API keys required)
 */

let recognition: SpeechRecognition | null = null;
let finalTranscript = '';
let interimTranscript = '';
let isListening = false;
let shouldStop = false;
let onUpdateCallback: ((text: string) => void) | null = null;

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
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    // Update the callback with combined transcript
    if (onUpdateCallback) {
      onUpdateCallback(finalTranscript + interimTranscript);
    }
  };

  // Handle errors
  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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
 * Start live transcription and continuously call onUpdate with the running transcript
 * @param onUpdate Callback function that receives the transcript text as it's recognized
 */
export function startLiveTranscription(onUpdate: (text: string) => void): void {
  try {
    finalTranscript = '';
    interimTranscript = '';
    shouldStop = false;
    onUpdateCallback = onUpdate;

    const rec = initializeRecognition();
    
    if (isListening) {
      rec.stop();
    }

    rec.start();
    isListening = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start transcription';
    throw new Error(message);
  }
}

/**
 * Stop live transcription and return the final accumulated transcript
 * @returns The final transcript text that was recognized
 */
export function stopLiveTranscription(): string {
  shouldStop = true;
  onUpdateCallback = null;

  if (recognition && isListening) {
    try {
      recognition.stop();
    } catch (err) {
      // Already stopped or error, ignore
    }
  }

  isListening = false;
  const result = finalTranscript.trim();
  finalTranscript = '';
  interimTranscript = '';

  return result;
}
