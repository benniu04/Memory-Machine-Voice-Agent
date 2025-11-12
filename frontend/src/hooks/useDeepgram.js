import { useState, useRef, useCallback } from 'react';
import { createClient } from '@deepgram/sdk';

const useDeepgram = (apiKey) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const deepgramRef = useRef(null);
  const connectionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = useCallback(async (onTranscript) => {
    try {
      setError(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Verify stream is active
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        setError('No microphone detected');
        return;
      }

      // Verify API key
      if (!apiKey || apiKey.trim() === '') {
        setError('Deepgram API key is required');
        return;
      }

      // Initialize Deepgram client
      if (!deepgramRef.current) {
        try {
          deepgramRef.current = createClient(apiKey);
        } catch (err) {
          console.error('Error creating Deepgram client:', err);
          setError('Failed to initialize Deepgram client');
          return;
        }
      }

      // Create Deepgram connection
      let connection;
      try {
        connection = deepgramRef.current.listen.live({
          model: 'nova-2',
          language: 'en-US',
          smart_format: true,
          interim_results: true,
          punctuate: true,
          utterance_end_ms: 1000,
          endpointing: 300,
          multichannel: false,
        });
      } catch (err) {
        console.error('Error creating Deepgram connection:', err);
        setError('Failed to create Deepgram connection');
        return;
      }

      connectionRef.current = connection;

      // Set up event listeners BEFORE opening connection
      // Listen for Results events (Deepgram SDK v3 uses 'Results' not 'transcript')
      connection.on('Results', (data) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        
        if (transcript && transcript.trim().length > 0) {
          onTranscript({
            text: transcript,
            isFinal: data.is_final,
            speech_final: data.speech_final,
          });
        }
      });
      
      // Also listen for 'transcript' in case SDK uses both
      connection.on('transcript', (data) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        if (transcript && transcript.trim().length > 0) {
          onTranscript({
            text: transcript,
            isFinal: data.is_final,
            speech_final: data.speech_final,
          });
        }
      });

      connection.on('open', () => {
        setIsConnected(true);

        // Create MediaRecorder to capture audio
        let mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Use browser default
          }
        }
        
        const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data && event.data.size > 0) {
            const readyState = connection.getReadyState();
            
            if (readyState === 1) { // OPEN
              try {
                // Convert Blob to ArrayBuffer for Deepgram
                const arrayBuffer = await event.data.arrayBuffer();
                connection.send(arrayBuffer);
              } catch (err) {
                console.error('Error sending audio chunk:', err);
              }
            }
          }
        };

        mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
        };

        // Start recording with timeslice (sends data every 250ms)
        try {
          mediaRecorder.start(250);
        } catch (err) {
          console.error('Error starting MediaRecorder:', err);
          setError('Failed to start audio recording');
        }
      });

      connection.on('error', (err) => {
        console.error('Deepgram error:', err);
        setError('Transcription error occurred: ' + (err.message || 'Unknown error'));
      });

      connection.on('close', (event) => {
        if (event && event.code && event.code !== 1000) {
          if (event.code === 1008) {
            setError('Deepgram API key may be invalid or expired');
          }
        }
        setIsConnected(false);
      });

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err.message || 'Failed to start recording');
      setIsConnected(false);
    }
  }, [apiKey]);

  const stopRecording = useCallback(() => {
    try {
      // Stop media recorder first
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      // Send finalize message to Deepgram to get final transcripts
      if (connectionRef.current) {
        try {
          connectionRef.current.finish();
        } catch (err) {
          console.error('Error sending finalize:', err);
        }
      }

      // Wait a moment for final transcripts
      setTimeout(() => {
        // Stop audio stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Close Deepgram connection
        if (connectionRef.current) {
          connectionRef.current = null;
        }

        setIsConnected(false);
      }, 500); // Wait 500ms for final transcripts
      
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Failed to stop recording properly');
    }
  }, []);

  return {
    startRecording,
    stopRecording,
    isConnected,
    error,
  };
};

export default useDeepgram;

