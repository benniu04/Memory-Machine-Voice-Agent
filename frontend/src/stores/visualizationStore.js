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
      sentimentLabel: 'neutral',
      keywords: [],

      // Actions
      updateVisualization: (energy, emotion, sentiment, label) => {
        set({
          energyLevel: energy,
          emotionIntensity: emotion,
          sentiment: sentiment,
          sentimentLabel: label || 'neutral'
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

      setSentimentLabel: (sentimentLabel) => {
        set({ sentimentLabel });
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
          sentimentLabel: 'neutral',
          keywords: []
        });
      }
    }),
    { name: 'VisualizationStore' }
  )
);

