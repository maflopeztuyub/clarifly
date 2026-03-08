export type RecordingState = 'idle' | 'recording' | 'processing' | 'ready';

export type PriorityLevel = 'low' | 'medium' | 'high';

export type ClarityLevel = 'clear' | 'somewhat unclear' | 'unclear';

export interface GeneratedTask {
  id: string;
  original: string;
  rephrased: string;
  priority: PriorityLevel;
  clarity: ClarityLevel;
  fulfillmentAssessment: string;
  suggestedNextStep: string;
  confidence: number;
}

export interface RecordingResult {
  audioBlob: Blob;
  duration: number;
  transcript: string;
  tasks: GeneratedTask[];
}

export interface SpeechState {
  isSpeaking: boolean;
  currentText?: string;
}
