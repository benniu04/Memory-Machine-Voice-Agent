import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Visualization Store
 * Manages visual state for Perlin visualization (energy, emotion, sentiment)
 */
export const useVisualizationStore = create(
  devtools(
    (set) => ({
      // State
      energyLevel: 0.5,
      emotionIntensity: 0.5,
      sentiment: 0,
      keywords: [],

      // Actions
      updateVisualization: (energy, emotion, sentiment) => {
        set({
          energyLevel: energy,
          emotionIntensity: emotion,
          sentiment: sentiment
        });
      },

      setEnergyLevel: (energyLevel) => {
        set({ energyLevel });
      },

      setEmotionIntensity: (emotionIntensity) => {
        set({ emotionIntensity });
      },

      setSentiment: (sentiment) => {
        set({ sentiment });
      },

      setKeywords: (keywords) => {
        set({ keywords });
      },

      addKeywords: (newKeywords) => {
        set((state) => ({
          keywords: [...state.keywords, ...newKeywords]
        }));
      },

      clearKeywords: () => {
        set({ keywords: [] });
      },

      // Reset visualization state
      reset: () => {
        set({
          energyLevel: 0.5,
          emotionIntensity: 0.5,
          sentiment: 0,
          keywords: []
        });
      }
    }),
    { name: 'VisualizationStore' }
  )
);

