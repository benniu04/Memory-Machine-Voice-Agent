import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * UI Store
 * Manages UI state (intro, processing, interactions)
 */
export const useUIStore = create(
  devtools(
    (set) => ({
      // State
      showIntro: true,
      hasInteracted: false,
      isProcessing: false,
      typewriterKey: 0,

      // Actions
      hideIntro: () => {
        set({ 
          showIntro: false,
          hasInteracted: true 
        });
      },

      displayIntro: () => {
        set({ showIntro: true });
      },

      setProcessing: (isProcessing) => {
        set({ isProcessing });
      },

      resetTypewriter: () => {
        set((state) => ({
          typewriterKey: state.typewriterKey + 1
        }));
      },

      // Reset UI state (but keep hasInteracted)
      reset: () => {
        set({
          showIntro: true,
          isProcessing: false,
          typewriterKey: 0
        });
      }
    }),
    { name: 'UIStore' }
  )
);

