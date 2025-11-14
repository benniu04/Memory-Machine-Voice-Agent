import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Transcription Store
 * Manages real-time transcription state, recording status, and Deepgram connection
 */
export const useTranscriptionStore = create(
  devtools(
    (set, get) => ({
      // State
      transcript: [],
      isRecording: false,
      isConnected: false,
      error: null,

      // Actions
      addTranscript: (text) => {
        set((state) => ({
          transcript: [...state.transcript, text]
        }));
      },

      clearTranscript: () => {
        set({ transcript: [] });
      },

      setRecording: (isRecording) => {
        set({ isRecording });
      },

      setConnected: (isConnected) => {
        set({ isConnected });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Reset all transcription state
      reset: () => {
        set({
          transcript: [],
          isRecording: false,
          isConnected: false,
          error: null
        });
      }
    }),
    { name: 'TranscriptionStore' }
  )
);

