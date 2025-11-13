import React, { useState, useCallback, useRef } from 'react';
import PerlinVisualization from './components/PerlinVisualization';
import TranscriptDisplay from './components/TranscriptDisplay';
import KeywordsDisplay from './components/KeywordsDisplay';
import Controls from './components/Controls';
import useDeepgram from './hooks/useDeepgram';
import { processSentiment } from './services/sentimentService';
import './App.css';

function App() {
  // State management
  const [transcript, setTranscript] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Intro animation state
  const [showIntro, setShowIntro] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Sentiment state
  const [sentiment, setSentiment] = useState(0);
  const [sentimentLabel, setSentimentLabel] = useState('neutral');
  const [keywords, setKeywords] = useState([]);
  const [emotionIntensity, setEmotionIntensity] = useState(0.5);
  const [energyLevel, setEnergyLevel] = useState(0.5);

  // Refs for managing transcript
  const currentTranscriptRef = useRef('');
  const transcriptArrayRef = useRef([]);
  const processingTimeoutRef = useRef(null);

  // Get Deepgram API key from environment variable
  const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY;

  // Initialize Deepgram hook
  const { startRecording, stopRecording, isConnected, error: deepgramError } = useDeepgram(DEEPGRAM_API_KEY);

  // Intro will only hide when user clicks "Start Recording"
  // (handled in handleStart function)

  // Handle transcript updates from Deepgram
  const handleTranscript = useCallback(async (data) => {
    const { text, isFinal, speech_final } = data;

    if (isFinal) {
      // Add finalized transcript to display
      setTranscript(prev => {
        const updated = [...prev, text];
        transcriptArrayRef.current = updated; // Keep ref in sync
        return updated;
      });
      
      // Update current transcript (accumulate if multiple final transcripts)
      if (currentTranscriptRef.current) {
        currentTranscriptRef.current += ' ' + text;
      } else {
        currentTranscriptRef.current = text;
      }

      // Process sentiment when speech is final
      if (speech_final) {
        // Clear any pending processing
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }

        // Debounce processing to avoid too many API calls
        processingTimeoutRef.current = setTimeout(async () => {
          const textToProcess = currentTranscriptRef.current;
          if (!textToProcess || textToProcess.trim().length === 0) {
            return;
          }
          
          try {
            setIsProcessing(true);
            setError(null);

            const sentimentData = await processSentiment(textToProcess);
            
            // Update visualization state
            setSentiment(sentimentData.sentiment);
            setSentimentLabel(sentimentData.sentiment_label);
            setKeywords(sentimentData.keywords);
            setEmotionIntensity(sentimentData.emotion_intensity);
            setEnergyLevel(sentimentData.energy_level);
            
            // Clear the processed transcript
            currentTranscriptRef.current = '';
          } catch (err) {
            console.error('Error processing sentiment:', err);
            setError(err.message);
          } finally {
            setIsProcessing(false);
          }
        }, 500); // Wait 500ms after speech ends
      }
    }
  }, []);

  // Start recording handler
  const handleStart = useCallback(async () => {
    if (!DEEPGRAM_API_KEY) {
      setError('Deepgram API key not found. Please set DEEPGRAM_API_KEY in your .env file.');
      return;
    }

    try {
      // Hide intro on first interaction
      if (!hasInteracted) {
        setShowIntro(false);
        setHasInteracted(true);
      }

      setError(null);
      setTranscript([]);
      currentTranscriptRef.current = ''; // Reset transcript ref
      transcriptArrayRef.current = []; // Reset transcript array ref
      setSentiment(0);
      setSentimentLabel('neutral');
      setKeywords([]);
      setEmotionIntensity(0.5);
      setEnergyLevel(0.5);
      
      // Clear any pending processing
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      
      await startRecording(handleTranscript);
      setIsRecording(true);
    } catch (err) {
      setError(err.message || 'Failed to start recording');
      setIsRecording(false);
    }
  }, [DEEPGRAM_API_KEY, startRecording, handleTranscript, hasInteracted]);

  // Stop recording handler
  const handleStop = useCallback(async () => {
    stopRecording();
    setIsRecording(false);
    
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
        setIsProcessing(true);
        setError(null);

        const sentimentData = await processSentiment(textToProcess);
        
        // Update visualization state
        setSentiment(sentimentData.sentiment);
        setSentimentLabel(sentimentData.sentiment_label);
        setKeywords(sentimentData.keywords);
        setEmotionIntensity(sentimentData.emotion_intensity);
        setEnergyLevel(sentimentData.energy_level);
        
        // Clear the processed transcript
        currentTranscriptRef.current = '';
      } catch (err) {
        console.error('Error processing sentiment:', err);
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Clear any pending processing if no transcript
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
    }
  }, [stopRecording]);

  // Display combined error from Deepgram or processing
  const displayError = error || deepgramError;

  return (
    <div className="App">
      {/* Background Perlin Noise Visualization */}
      <div className={`visualization-container ${showIntro ? 'opacity-0 animate-fade-in-scale' : ''}`}>
        <PerlinVisualization
          sentiment={sentiment}
          sentimentLabel={sentimentLabel}
          emotionIntensity={emotionIntensity}
          energyLevel={energyLevel}
        />
      </div>

      {/* Intro Animation Overlay */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-fade-in">
          <div className="text-center">
            {/* Main title */}
            <h1 
              className="text-6xl font-bold text-white mb-4 overflow-hidden whitespace-nowrap border-r-4 border-white/80 m-auto inline-block"
              style={{ 
                width: 'fit-content', 
                animation: 'typewriter 2s steps(16) 0.5s forwards, blink 1s step-end 2.5s 2'
              }}
            >
              Ready to Listen
            </h1>
            
            {/* Subtitle */}
            <p 
              className="text-white/60 text-xl mt-6 mb-12 animate-fade-in"
              style={{ 
                animationDelay: '2.8s', 
                opacity: 0, 
                animationFillMode: 'forwards'
              }}
            >
              Click start when you're ready
            </p>
            
            {/* Button */}
            <button
              onClick={handleStart}
              className="px-10 py-5 text-lg font-bold rounded-[60px] cursor-pointer transition-all duration-300 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#667eea] text-white hover:scale-110 hover:shadow-[0_12px_40px_rgba(102,126,234,0.6)] animate-fade-in border-0"
              style={{ 
                animationDelay: '3s', 
                opacity: 0, 
                animationFillMode: 'forwards', 
                backgroundSize: '200% 100%' 
              }}
            >
              Start Recording
            </button>
          </div>
        </div>
      )}

      {/* UI Overlays */}
      <TranscriptDisplay transcript={transcript} isRecording={isRecording} />
      <KeywordsDisplay keywords={keywords} sentimentLabel={sentimentLabel} />
      
      {/* Controls */}
      <Controls
        isRecording={isRecording}
        onStart={handleStart}
        onStop={handleStop}
        isProcessing={isProcessing}
        error={displayError}
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
              <span className="font-mono text-white/90">{sentiment.toFixed(2)}</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-white/50">Energy</span>
              <span className="font-mono text-white/90">{energyLevel.toFixed(2)}</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="text-white/50">Intensity</span>
              <span className="font-mono text-white/90">{emotionIntensity.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
