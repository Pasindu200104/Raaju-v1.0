import { useState, useEffect, useRef } from 'react';
import { chatAPI } from './utils/api';
import VoiceVisualizer from './components/VoiceVisualizer';
import VoiceDisplay from './components/VoiceDisplay';
import useVoiceAssistant from './hooks/useVoiceAssistant';
import './App.css';

function App() {
  const [selectedModel, setSelectedModel] = useState('openrouter/free');
  const [error, setError] = useState('');
  const [responseText, setResponseText] = useState('');
  const [models, setModels] = useState([]);
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);
  const speechSyncRef = useRef(0);

  // Voice assistant hook
  const {
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
  } = useVoiceAssistant();

  // Handle voice command (auto-send) - defined before useEffect that uses it
  const handleVoiceCommand = useRef(null);

  // Fetch available models and initialize voice once
  useEffect(() => {
    // Fetch models
    const fetchModels = async () => {
      try {
        const data = await chatAPI.getModels();
        setModels(data.models);
      } catch (err) {
        console.error('Failed to fetch models:', err);
      }
    };
    fetchModels();
    
    // Initialize voice detection once on first mount
    if (!initializedRef.current && voiceEnabled) {
      console.log('🚀 Initializing voice detection on mount');
      initializedRef.current = true;
      // Use setTimeout to ensure state is ready
      setTimeout(() => {
        startWakeWordDetection();
      }, 500);
    }
  }, []);

  // Handle voice command detection
  useEffect(() => {
    if (isWakeWordDetected && transcript && !isSpeaking) {
      console.log('✅ Voice command:', transcript);
      if (handleVoiceCommand.current) {
        handleVoiceCommand.current(transcript);
      }
    }
  }, [isWakeWordDetected, transcript, isSpeaking]);

  // Handle voice toggle
  useEffect(() => {
    if (voiceEnabled && initializedRef.current) {
      console.log('🔊 Voice toggled ON');
      setTimeout(() => {
        if (voiceEnabled) {
          startWakeWordDetection();
        }
      }, 100);
    } else if (!voiceEnabled) {
      console.log('🔇 Voice toggled OFF');
      stopListening();
    }
  }, [voiceEnabled]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
  };

  // Define handleVoiceCommand function and store in ref
  handleVoiceCommand.current = async (command) => {
    if (!command.trim()) return;

    console.log('Processing voice command:', command);
    setResponseText('');
    setError('');

    try {
      // Call API with conversation format
      const response = await chatAPI.sendMessage(
        [{ role: 'user', content: command }],
        selectedModel
      );
      
      const fullResponse = response.message;
      console.log('Got response:', fullResponse);
      
      // Show the full response and speak it
      setResponseText(fullResponse);
      speak(fullResponse, resetWakeWord);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to get response. Please check if backend is running.';
      setError(errorMsg);
      console.error('Error:', err);
      // Reset after error
      setTimeout(() => {
        resetWakeWord();
      }, 1000);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      {/* Waveform Visualizer */}
      <div className="absolute inset-0 flex items-start pt-8 justify-center pointer-events-none z-0">
        <VoiceVisualizer isListening={isListening} isSpeaking={isSpeaking} />
      </div>

      {/* Voice Display UI */}
      <VoiceDisplay
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        isListening={isListening}
        isWakeWordDetected={isWakeWordDetected}
        isSpeaking={isSpeaking}
        userTranscript={isWakeWordDetected ? transcript : ''}
        responseText={responseText}
      />
    </div>
  );
}

export default App;
