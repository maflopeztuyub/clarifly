/**
 * Browser Speech Synthesis API utilities
 * Uses the Web Speech API to provide text-to-speech functionality
 */

// Minimal Web Speech API type declarations for TypeScript compatibility
interface SpeechSynthesisUtterance extends EventTarget {
  text: string;
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
  addEventListener(type: string, listener: EventListener): void;
}

interface SpeechSynthesisUtteranceConstructor {
  new (text?: string): SpeechSynthesisUtterance;
}

interface SpeechSynthesisVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

interface SpeechSynthesis extends EventTarget {
  speaking: boolean;
  paused: boolean;
  cancel(): void;
  pause(): void;
  resume(): void;
  speak(utterance: SpeechSynthesisUtterance): void;
  getVoices(): SpeechSynthesisVoice[];
}

declare global {
  interface Window {
    speechSynthesis: SpeechSynthesis;
    SpeechSynthesisUtterance: SpeechSynthesisUtteranceConstructor;
  }
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(text: string, onEnd?: () => void): void {
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create a new utterance
  currentUtterance = new SpeechSynthesisUtterance(text);

  // Configure utterance properties
  currentUtterance.rate = 1;
  currentUtterance.pitch = 1;
  currentUtterance.volume = 1;

  // Add event listeners
  if (onEnd) {
    currentUtterance.addEventListener('end', onEnd);
  }

  // Speak the text
  window.speechSynthesis.speak(currentUtterance);
}

export function stopSpeaking(): void {
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return window.speechSynthesis.speaking;
}

export function pauseSpeaking(): void {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis.getVoices();
}

export function setVoice(voiceUri: string): void {
  if (currentUtterance) {
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.voiceURI === voiceUri);
    if (selectedVoice) {
      currentUtterance.voice = selectedVoice;
    }
  }
}
