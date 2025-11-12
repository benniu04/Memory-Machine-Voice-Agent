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
  }, [DEEPGRAM_API_KEY, startRecording, handleTranscript]);

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
      <div className="visualization-container">
        <PerlinVisualization
          sentiment={sentiment}
          sentimentLabel={sentimentLabel}
          emotionIntensity={emotionIntensity}
          energyLevel={energyLevel}
        />
      </div>

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
        <div className="fixed bottom-5 left-5 bg-black/70 backdrop-blur-[10px] rounded-2xl border border-white/10 px-5 py-3 text-white font-sans shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-10 max-md:bottom-[180px]">
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
