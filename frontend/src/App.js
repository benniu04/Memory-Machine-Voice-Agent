import React, { useCallback, useRef, useEffect } from 'react';
import PerlinVisualization from './components/PerlinVisualization';
import TranscriptDisplay from './components/TranscriptDisplay';
import KeywordsDisplay from './components/KeywordsDisplay';
import Controls from './components/Controls';
import useDeepgram from './hooks/useDeepgram';
import { processSentiment } from './services/sentimentService';
import { useTranscriptionStore, useVisualizationStore, useUIStore } from './stores';
import './App.css';

function App() {
  // Zustand stores
  const { 
    isConnected,
    setRecording,
    addTranscript,
    clearTranscript 
  } = useTranscriptionStore();
  
  const {
    sentiment,
    emotionIntensity,
    energyLevel,
    updateVisualization,
    setKeywords: setStoreKeywords,
    clearKeywords
  } = useVisualizationStore();
  
  const {
    showIntro,
    hasInteracted,
    typewriterKey,
    hideIntro,
    setProcessing,
    resetTypewriter
  } = useUIStore();
  
  // Local state for sentiment label (not needed in visualization)
  const [sentimentLabel, setSentimentLabel] = React.useState('neutral');

  // Refs for managing transcript
  const currentTranscriptRef = useRef('');
  const transcriptArrayRef = useRef([]);
  const processingTimeoutRef = useRef(null);

  // Get Deepgram API key from environment variable
  const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY;

  // Initialize Deepgram hook (now only returns start/stop functions)
  const { startRecording, stopRecording } = useDeepgram(DEEPGRAM_API_KEY);

  // Loop typewriter animation every 5 seconds on intro screen
  useEffect(() => {
    if (showIntro) {
      const interval = setInterval(() => {
        resetTypewriter();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [showIntro, resetTypewriter]);

  // Handle transcript updates from Deepgram
  const handleTranscript = useCallback(async (data) => {
    const { text, isFinal } = data;

    if (isFinal) {
      // Add finalized transcript to store
      addTranscript(text);
      
      // Update ref for processing
      transcriptArrayRef.current = [...transcriptArrayRef.current, text];
      
      // Update current transcript (accumulate if multiple final transcripts)
      if (currentTranscriptRef.current) {
        currentTranscriptRef.current += ' ' + text;
      } else {
        currentTranscriptRef.current = text;
      }

      // Process sentiment for every final transcript (real-time processing)
      // Clear any pending processing
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }

      // Debounce processing to avoid too many API calls (process after 1 second of no new transcripts)
      processingTimeoutRef.current = setTimeout(async () => {
        const textToProcess = currentTranscriptRef.current;
        if (!textToProcess || textToProcess.trim().length === 0) {
          return;
        }
        
        try {
          setProcessing(true);
          // Clear old keywords before processing new content
          clearKeywords();

          const sentimentData = await processSentiment(textToProcess);
          
          // Update visualization store
          updateVisualization(
            sentimentData.energy_level,
            sentimentData.emotion_intensity,
            sentimentData.sentiment,
            sentimentData.sentiment_label
          );
          setSentimentLabel(sentimentData.sentiment_label);
          setStoreKeywords(sentimentData.keywords);
          
          // Clear the processed transcript
          currentTranscriptRef.current = '';
        } catch (err) {
          console.error('Error processing sentiment:', err);
        } finally {
        setProcessing(false);
      }
    }, 1000); // Wait 1 second after last transcript to batch process
    }
  }, [addTranscript, setProcessing, updateVisualization, setStoreKeywords, clearKeywords]);

  // Start recording handler
  const handleStart = useCallback(async () => {
    if (!DEEPGRAM_API_KEY) {
      return;
    }

    try {
      // Hide intro on first interaction
      if (!hasInteracted) {
        hideIntro();
      }

      // Reset all stores
      clearTranscript();
      clearKeywords();
      currentTranscriptRef.current = '';
      transcriptArrayRef.current = [];
      updateVisualization(0.5, 0.5, 0, 'neutral');
      setSentimentLabel('neutral');
      
      // Clear any pending processing
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      
      await startRecording(handleTranscript);
      setRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setRecording(false);
    }
  }, [DEEPGRAM_API_KEY, startRecording, handleTranscript, hasInteracted, hideIntro, clearTranscript, clearKeywords, updateVisualization, setRecording]);

  // Stop recording handler
  const handleStop = useCallback(async () => {
    stopRecording();
    setRecording(false);
    
    // Wait a moment for any final transcripts to arrive
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get text from ref first
    let textToProcess = currentTranscriptRef.current?.trim() || '';
    
    // If ref is empty, get from transcript array ref
    if (!textToProcess && transcriptArrayRef.current.length > 0) {
      textToProcess = transcriptArrayRef.current.join(' ').trim();
    }
    
    // Process any pending transcript when stopping
    if (textToProcess && textToProcess.length > 0) {
      // Clear any pending timeout
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      
      try {
        setProcessing(true);
        // Clear old keywords before processing new content
        clearKeywords();

        const sentimentData = await processSentiment(textToProcess);
        
        // Update visualization store
        updateVisualization(
          sentimentData.energy_level,
          sentimentData.emotion_intensity,
          sentimentData.sentiment,
          sentimentData.sentiment_label
        );
        setSentimentLabel(sentimentData.sentiment_label);
        setStoreKeywords(sentimentData.keywords);
        
        // Clear the processed transcript
        currentTranscriptRef.current = '';
      } catch (err) {
        console.error('Error processing sentiment:', err);
      } finally {
        setProcessing(false);
      }
    } else {
      // Clear any pending processing if no transcript
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
    }
    
    // Clear keywords and transcript after stopping recording (clean slate for next session)
    setTimeout(() => {
      clearKeywords();
      clearTranscript();
      updateVisualization(0.5, 0.5, 0, 'neutral');
      setSentimentLabel('neutral');
    }, 100);
  }, [stopRecording, setRecording, setProcessing, updateVisualization, setStoreKeywords, clearKeywords, clearTranscript]);

  return (
    <div className="App">
      {/* Background Perlin Noise Visualization */}
      <div className={`visualization-container ${showIntro ? 'opacity-0 animate-fade-in-scale' : ''}`}>
        <PerlinVisualization />
      </div>

      {/* Intro Animation Overlay */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-fade-in overflow-hidden">
          {/* Subtle animated background particles */}
          <div className="absolute inset-0 opacity-80">
            <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-purple-500/40 rounded-full blur-[80px] animate-pulse-slow"></div>
            <div className="absolute bottom-[30%] right-[15%] w-40 h-40 bg-blue-500/40 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-[60%] left-[20%] w-24 h-24 bg-indigo-500/40 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-[20%] left-[50%] w-36 h-36 bg-pink-500/30 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
          </div>

          <div className="text-center relative z-10">
            {/* Main title - resets with key change */}
            <div className="relative inline-block mb-4 px-4">
              <h1 
                key={typewriterKey}
                className="text-6xl max-md:text-5xl max-sm:text-3xl font-black overflow-hidden whitespace-nowrap inline-block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                style={{ 
                  width: 'fit-content', 
                  animation: 'typewriter 2s steps(16) forwards',
                  filter: 'drop-shadow(0 0 20px rgba(147, 197, 253, 0.3))'
                }}
              >
                Ready to Listen
                <span 
                  className="inline-block w-1 h-16 max-md:h-14 max-sm:h-10 ml-1 align-middle bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400"
                  style={{
                    animation: 'blink 1s step-end infinite',
                    filter: 'drop-shadow(0 0 8px rgba(147, 197, 253, 0.6))',
                    verticalAlign: 'baseline'
                  }}
                />
              </h1>
            </div>
            
            {/* Subtitle with gradient and animation */}
            <p 
              className="text-xl max-md:text-lg max-sm:text-base mt-8 mb-12 font-light tracking-wide bg-gradient-to-r from-blue-200/80 via-purple-200/80 to-pink-200/80 bg-clip-text text-transparent"
              style={{ 
                animation: 'fade-in 1s ease-in forwards',
                filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))'
              }}
            >
              Click start when you're ready and make sure you're in a quiet environment.
            </p>
            
            {/* Button with pulse effect */}
            <div className="relative inline-block">
              {/* Pulsing glow with matching gradient */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 rounded-[60px] blur-lg animate-pulse-slow"></div>
              
              <button
                onClick={handleStart}
                className="relative px-12 py-5 text-lg font-bold rounded-[60px] cursor-pointer transition-all duration-300 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:scale-110 hover:shadow-[0_16px_48px_rgba(147,197,253,0.4)] border-0 overflow-hidden group"
                style={{ 
                  backgroundSize: '200% 100%',
                  filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.3))'
                }}
              >
                {/* Shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10 tracking-wide">Start Recording</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UI Overlays */}
      <TranscriptDisplay />
      <KeywordsDisplay sentimentLabel={sentimentLabel} />
      
      {/* Controls */}
      <Controls
        onStart={handleStart}
        onStop={handleStop}
      />

      {/* Status indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-5 left-5 rounded-2xl border border-white/40 px-5 py-3 text-white font-sans shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] z-10 max-md:bottom-[180px]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="text-white/50">Connection</span>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-red-400'} animate-pulse`}></div>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-white/50">Sentiment</span>
              <span className="font-mono text-white/90">{(sentiment ?? 0).toFixed(2)}</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-white/50">Energy</span>
              <span className="font-mono text-white/90">{(energyLevel ?? 0.5).toFixed(2)}</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-white/50">Intensity</span>
              <span className="font-mono text-white/90">{(emotionIntensity ?? 0.5).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
