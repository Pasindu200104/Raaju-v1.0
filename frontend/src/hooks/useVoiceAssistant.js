import { useState, useRef, useCallback, useEffect } from 'react';

const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isWakeWordDetected, setIsWakeWordDetected] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const listeningTimeoutRef = useRef(null);
  const isStartedRef = useRef(false);
  const lastResultIndexRef = useRef(0);

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Changed to false to prevent hanging
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Listening started');
      isStartedRef.current = true;
      setIsListening(true);
      
      // Auto-stop after 10 seconds of silence
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      listeningTimeoutRef.current = setTimeout(() => {
        console.log('⏱️ Timeout - stopping recognition');
        recognition.stop();
      }, 10000);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      lastResultIndexRef.current = event.resultIndex;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase();

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const currentText = (finalTranscript || interimTranscript).trim();
      console.log('📝 Transcript:', currentText, '| Final:', !!finalTranscript);
      setTranscript(currentText);

      // Only check for wake word on final results
      if (finalTranscript && currentText.includes('hello')) {
        console.log('✅ Wake word "hello" detected!');
        setIsWakeWordDetected(true);
        recognition.stop();
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      console.log('🛑 Recognition ended');
      isStartedRef.current = false;
      setIsListening(false);
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
    };
  }, []);

  // Start listening for wake word
  const startWakeWordDetection = useCallback(() => {
    if (!voiceEnabled) {
      console.warn('Voice disabled');
      return;
    }
    
    if (!recognitionRef.current) {
      console.warn('Recognition not initialized');
      return;
    }
    
    // Check if already started using ref to avoid timing issues
    if (isStartedRef.current) {
      console.log('Already started or starting, skipping');
      return;
    }
    
    console.log('🎙️ Starting wake word detection');
    isStartedRef.current = true;
    setIsWakeWordDetected(false);
    setTranscript('');
    lastResultIndexRef.current = 0;
    
    try {
      recognitionRef.current.start();
      console.log('✓ Start command sent');
    } catch (err) {
      console.error('Error calling start():', err.name, err.message);
      isStartedRef.current = false;
      
      // If it's already started, just wait
      if (err.name === 'InvalidStateError') {
        console.log('Recognition already in running state, will proceed');
        setTimeout(() => {
          console.log('Retrying after delay...');
          if (!isStartedRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              isStartedRef.current = true;
            } catch (e) {
              console.error('Retry failed:', e.message);
            }
          }
        }, 1000);
      }
    }
  }, [voiceEnabled]);

  // Stop listening
  const stopListening = useCallback(() => {
    console.log('⏹️ Stopping listening');
    isStartedRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
    }
    setIsWakeWordDetected(false);
    setTranscript('');
  }, []);

  // Speak response
  const speak = useCallback((text, onSpeechEnd) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not available');
      if (onSpeechEnd) onSpeechEnd();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 0.8;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    // Get voices and select male English voice
    const voices = window.speechSynthesis.getVoices();
    console.log('🎵 Available voices:', voices.length);

    const maleVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return lang.includes('en') && 
             (name.includes('male') || name.includes('david') || 
              name.includes('mark') || name.includes('boy'));
    }) || 
    voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return lang.includes('en') && !name.includes('female');
    }) ||
    voices.find(voice => voice.lang.toLowerCase().includes('en')) ||
    voices[0];

    if (maleVoice) {
      utterance.voice = maleVoice;
      console.log('🔊 Speaking with voice:', maleVoice.name);
    }

    utterance.onstart = () => {
      console.log('▶️ Speech started');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('⏸️ Speech ended');
      setIsSpeaking(false);
      // Call the callback to reset listening after speech
      if (onSpeechEnd) {
        console.log('Calling onSpeechEnd callback...');
        setTimeout(() => {
          onSpeechEnd();
        }, 500);
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      if (onSpeechEnd) onSpeechEnd();
    };

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Reset and restart detection - directly restart without depending on callback
  const resetWakeWord = useCallback(() => {
    console.log('🔄 Resetting wake word');
    isStartedRef.current = false;
    setIsWakeWordDetected(false);
    setTranscript('');
    
    // Ensure recognition is stopped
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.log('Error stopping:', err.message);
      }
    }
    
    // Schedule restart after enough time for onend to fire
    setTimeout(() => {
      console.log('↻ Attempting to restart recognition...');
      if (recognitionRef.current && voiceEnabled && !isStartedRef.current) {
        try {
          isStartedRef.current = true;
          recognitionRef.current.start();
          console.log('✓ Recognition restarted');
        } catch (err) {
          console.error('Failed to restart:', err.message);
          isStartedRef.current = false;
          
          // Retry once more after delay
          setTimeout(() => {
            if (recognitionRef.current && voiceEnabled && !isStartedRef.current) {
              try {
                isStartedRef.current = true;
                recognitionRef.current.start();
                console.log('✓ Recognition restarted on retry');
              } catch (e) {
                console.error('Retry failed:', e.message);
                isStartedRef.current = false;
              }
            }
          }, 500);
        }
      }
    }, 1000);
  }, [voiceEnabled]);

  return {
    isListening,
    isWakeWordDetected,
    voiceEnabled,
    setVoiceEnabled,
    transcript,
    isSpeaking,
    startWakeWordDetection,
    stopListening,
    speak,
    stopSpeaking,
    resetWakeWord,
  };
};

export default useVoiceAssistant;
