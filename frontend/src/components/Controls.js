import React, { useState, useRef } from 'react';

const Controls = ({ isRecording, onStart, onStop, isProcessing, error }) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const createRipple = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size: 0,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Animate ripple
    const animate = () => {
      setRipples(prev => prev.map(r => 
        r.id === newRipple.id ? { ...r, size: r.size + 20 } : r
      ));
      
      if (newRipple.size < 200) {
        requestAnimationFrame(animate);
      } else {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }
    };
    animate();
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-5 z-20 max-md:bottom-5">
      {error && (
        <div className="bg-gradient-to-r from-red-500/95 to-red-600/95 backdrop-blur-[15px] text-white px-7 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-[0_8px_24px_rgba(239,68,68,0.5)] animate-slide-up border border-red-400/30">
          <span className="text-xl animate-pulse">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      <div className="relative">
        {!isRecording ? (
          <button
            ref={buttonRef}
            className="relative flex items-center gap-3 px-10 py-5 text-base font-bold border-0 rounded-[60px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-sans shadow-[0_8px_32px_rgba(102,126,234,0.4)] backdrop-blur-[15px] bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#667eea] bg-size-200 bg-pos-0 text-white hover:not(:disabled):-translate-y-1 hover:not(:disabled):shadow-[0_12px_40px_rgba(102,126,234,0.6)] hover:not(:disabled):bg-pos-100 active:not(:disabled):translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed max-md:px-8 max-md:py-4 max-md:text-sm overflow-hidden group"
            onClick={(e) => {
              createRipple(e);
              onStart();
            }}
            disabled={isProcessing}
            style={{
              backgroundSize: '200% 100%',
            }}
          >
            {/* Ripple effects */}
            {ripples.map(ripple => (
              <span
                key={ripple.id}
                className="absolute rounded-full bg-white/30 pointer-events-none"
                style={{
                  left: ripple.x - ripple.size / 2,
                  top: ripple.y - ripple.size / 2,
                  width: ripple.size,
                  height: ripple.size,
                  opacity: Math.max(0, 1 - ripple.size / 200),
                }}
              />
            ))}
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <svg className="relative z-10 w-7 h-7 max-md:w-6 max-md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
            <span className="relative z-10">Start Recording</span>
          </button>
        ) : (
          <button
            ref={buttonRef}
            className="relative flex items-center gap-3 px-10 py-5 text-base font-bold border-0 rounded-[60px] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-sans shadow-[0_8px_32px_rgba(245,87,108,0.5)] backdrop-blur-[15px] bg-gradient-to-r from-[#f093fb] via-[#f5576c] to-[#f093fb] bg-size-200 bg-pos-0 text-white animate-pulse-glow hover:scale-110 hover:shadow-[0_12px_40px_rgba(245,87,108,0.7)] hover:bg-pos-100 max-md:px-8 max-md:py-4 max-md:text-sm overflow-hidden group"
            onClick={(e) => {
              createRipple(e);
              onStop();
            }}
            style={{
              backgroundSize: '200% 100%',
            }}
          >
            {/* Ripple effects */}
            {ripples.map(ripple => (
              <span
                key={ripple.id}
                className="absolute rounded-full bg-white/40 pointer-events-none"
                style={{
                  left: ripple.x - ripple.size / 2,
                  top: ripple.y - ripple.size / 2,
                  width: ripple.size,
                  height: ripple.size,
                  opacity: Math.max(0, 1 - ripple.size / 200),
                }}
              />
            ))}
            
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-[60px] border-2 border-white/50 animate-ping opacity-20"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <svg className="relative z-10 w-7 h-7 max-md:w-6 max-md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />
            </svg>
            <span className="relative z-10">Stop Recording</span>
          </button>
        )}
      </div>

      {isProcessing && (
        <div className="flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-black/80 to-black/70 backdrop-blur-[15px] rounded-3xl text-white text-sm font-semibold border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Processing audio...
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-black/80 to-black/70 backdrop-blur-[15px] rounded-[25px] border border-white/20 text-white text-[13px] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
        <div className="relative">
          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isRecording ? 'bg-[#10b981] shadow-[0_0_20px_rgba(16,185,129,1)] scale-110' : 'bg-white/40 scale-100'}`}></div>
          {isRecording && (
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#10b981] animate-ping opacity-75"></div>
          )}
        </div>
        <span className="uppercase tracking-wider text-xs font-bold">
          {isRecording ? 'Live' : 'Ready'}
        </span>
      </div>
    </div>
  );
};

export default Controls;

