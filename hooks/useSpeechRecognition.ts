import { useState, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

export interface SpeechResult {
  transcript: string;
  confidence: number;
}

export interface UseSpeechRecognitionReturn {
  listening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, options?: Speech.SpeechOptions) => void;
  stopSpeaking: () => void;
}

/**
 * useSpeechRecognition
 *
 * On web: uses the browser's Web Speech API (SpeechRecognition).
 * On Android/iOS: displays a simulated listener UI.
 * For real STT on Android, integrate react-native-voice or
 * expo-speech-recognition once available for SDK 50.
 *
 * To enable real STT in Expo:
 *   npx expo install react-native-voice
 *   and follow the README for Android permissions.
 */
export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // ── WEB SPEECH API (for testing in browser / Expo Web) ──
  const startListeningWeb = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported on this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => { setListening(true); setError(null); };
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };
    recognition.onerror = (event: any) => {
      setError(event.error);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  }, []);

  const stopListeningWeb = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  // ── NATIVE (Android/iOS) — simulate with UI modal ──
  const startListeningNative = useCallback(() => {
    setListening(true);
    setTranscript('');
    setError(null);
    // The actual voice command selection happens via the
    // demo command buttons in the UI (HomeScreen).
    // For real STT: integrate react-native-voice here.
  }, []);

  const stopListeningNative = useCallback(() => {
    setListening(false);
  }, []);

  const startListening = Platform.OS === 'web' ? startListeningWeb : startListeningNative;
  const stopListening = Platform.OS === 'web' ? stopListeningWeb : stopListeningNative;

  // ── TTS ──
  const speak = useCallback((text: string, options?: Speech.SpeechOptions) => {
    Speech.speak(text, {
      rate: 0.85,
      pitch: 0.75,
      language: 'en-US',
      ...options,
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
  }, []);

  return { listening, transcript, error, startListening, stopListening, speak, stopSpeaking };
}
