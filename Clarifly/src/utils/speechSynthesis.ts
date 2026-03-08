/**
 * Browser Speech Synthesis API utilities
 * Uses the Web Speech API to provide text-to-speech functionality
 */

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
