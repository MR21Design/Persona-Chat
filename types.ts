
export type Emotion = 'NEUTRAL' | 'HAPPY' | 'ANGRY' | 'FRUSTRATED' | 'CONFUSED' | 'EXCITED' | 'BORED' | 'IMPATIENT';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  emotion?: Emotion;
  timestamp: number;
}

export interface Persona {
  name: string;
  role: string;
  traits: string;
  scope: string;
  isInitialized: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  persona: Persona;
  messages: Message[];
  currentEmotion: Emotion;
  emotionHistory: { emotion: Emotion; timestamp: number }[];
}
