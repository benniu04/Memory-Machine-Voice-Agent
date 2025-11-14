import React, { useState, useEffect, useRef } from 'react';
import { useVisualizationStore } from '../stores';

const KeywordsDisplay = ({ sentimentLabel }) => {
  // Read keywords from Zustand store
  const { keywords } = useVisualizationStore();
  const [displayedKeywords, setDisplayedKeywords] = useState([]);
  const keywordIdsRef = useRef(0);

  useEffect(() => {
    if (keywords && keywords.length > 0) {
      // Create new keyword objects with unique IDs for animation
      const newKeywords = keywords.map(keyword => ({
        id: keywordIdsRef.current++,
        text: keyword,
        timestamp: Date.now()
      }));

      // Check for duplicates before adding
      setDisplayedKeywords(prev => {
        const existingTexts = new Set(prev.map(k => k.text.toLowerCase()));
        
        // Filter out keywords that already exist
        const uniqueNewKeywords = newKeywords.filter(
          keyword => !existingTexts.has(keyword.text.toLowerCase())
        );
        
        if (uniqueNewKeywords.length === 0) return prev;
        
        // Add only unique keywords and keep last 15
        const updated = [...prev, ...uniqueNewKeywords];
        return updated.slice(-15);
      });
    } else if (keywords && keywords.length === 0) {
      // Clear displayed keywords when parent resets
      setDisplayedKeywords([]);
      keywordIdsRef.current = 0; // Reset ID counter
    }
  }, [keywords]);

  return (
    <div className="fixed top-5 right-5 w-[350px] max-h-[60vh] rounded-2xl border border-white/40 p-5 text-white font-sans shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] z-10 max-md:w-[calc(100%-40px)] max-md:top-auto max-md:bottom-[100px] max-md:right-5 max-md:max-h-[30vh] animate-slide-in-right" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', animationDelay: '0.2s' }}>
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/30">
        <h3 className="m-0 text-lg font-semibold bg-gradient-to-r from-[#f093fb] to-[#f5576c] bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))' }}>
          Key Themes
        </h3>
        {sentimentLabel && (
          <span className="text-[13px] px-3 py-1 bg-gradient-to-r from-[rgba(102,126,234,0.3)] to-[rgba(118,75,162,0.3)] rounded-xl border border-white/20 capitalize font-medium">
            {sentimentLabel}
          </span>
        )}
      </div>
      <div className="min-h-[100px]">
        {displayedKeywords.length === 0 ? (
          <p className="text-white/40 italic text-center mt-5 text-sm">
            Keywords will appear here...
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5 items-start">
            {displayedKeywords.map((keyword) => (
              <span
                key={keyword.id}
                className="inline-block px-4 py-2 bg-gradient-to-r from-[rgba(99,102,241,0.2)] to-[rgba(168,85,247,0.2)] border border-white/15 rounded-[20px] text-sm font-medium text-white transition-all duration-300 backdrop-blur-[5px] shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:border-white/30 animate-fade-in-up"
                style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)' }}
              >
                {keyword.text}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordsDisplay;

