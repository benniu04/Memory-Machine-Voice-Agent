import React, { useEffect, useRef, useState } from 'react';

const TranscriptDisplay = ({ transcript, isRecording }) => {
  const scrollRef = useRef(null);
  const [displayedLines, setDisplayedLines] = useState([]);
  const previousTranscriptRef = useRef([]);

  // Auto-scroll to bottom when new transcript arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Animate new transcript lines with typewriter effect
  useEffect(() => {
    if (transcript.length > previousTranscriptRef.current.length) {
      const newLines = transcript.slice(previousTranscriptRef.current.length);
      
      newLines.forEach((line, lineIndex) => {
        const globalIndex = previousTranscriptRef.current.length + lineIndex;
        const words = line.split(' ');
        let currentWordIndex = 0;
        
        const typeWriter = () => {
          if (currentWordIndex < words.length) {
            const displayedText = words.slice(0, currentWordIndex + 1).join(' ');
            setDisplayedLines(prev => {
              const updated = [...prev];
              updated[globalIndex] = displayedText;
              return updated;
            });
            currentWordIndex++;
            setTimeout(typeWriter, 50 + Math.random() * 30); // Variable typing speed
          }
        };
        
        setTimeout(() => typeWriter(), lineIndex * 200);
      });
      
      previousTranscriptRef.current = transcript;
    } else if (transcript.length === 0) {
      setDisplayedLines([]);
      previousTranscriptRef.current = [];
    }
  }, [transcript]);

  return (
    <div className="fixed top-5 left-5 w-[420px] max-h-[65vh] bg-gradient-to-br from-black/80 via-black/70 to-black/80 backdrop-blur-[20px] rounded-3xl border border-white/20 p-6 text-white font-sans shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-10 flex flex-col max-md:w-[calc(100%-40px)] max-md:max-h-[40vh] relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 animate-pulse-slow"></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/20">
          <h3 className="m-0 text-xl font-bold bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] bg-clip-text text-transparent animate-pulse-glow">
            Live Transcript
          </h3>
          {isRecording && (
            <div className="flex items-center gap-2.5 text-xs text-[#ff6b6b] font-semibold px-3 py-1.5 bg-red-500/20 rounded-full border border-red-500/30 backdrop-blur-[10px]">
              <span className="relative w-2.5 h-2.5">
                <span className="absolute inset-0 bg-[#ff6b6b] rounded-full animate-ping opacity-75"></span>
                <span className="absolute inset-0 bg-[#ff6b6b] rounded-full"></span>
              </span>
              Recording
            </div>
          )}
        </div>
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden pr-3 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30" 
          ref={scrollRef}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)'
          }}
        >
          {displayedLines.length === 0 ? (
            <div className="text-center mt-12">
              <p className="text-white/50 italic text-sm mb-2 animate-pulse-slow">
                Your words will appear here...
              </p>
              <div className="flex justify-center gap-1 mt-4">
                <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          ) : (
            displayedLines.map((line, index) => (
              <div 
                key={index}
                className="mb-4 pb-4 border-b border-white/5 last:border-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <p className="m-0 leading-relaxed text-[15px] text-white/95 font-medium">
                  {line}
                  {index === displayedLines.length - 1 && isRecording && (
                    <span className="inline-block w-2 h-4 ml-1 bg-white/80 animate-pulse"></span>
                  )}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-white/30">
                  <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                  <span>Line {index + 1}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptDisplay;

