import { useState, useEffect, useRef } from 'react';
import { Send, Menu, Trash2, Settings } from 'lucide-react';
import { chatAPI } from './utils/api';
import ChatWindow from './components/ChatWindow';
import Sidebar from './components/Sidebar';
import VoiceControls from './components/VoiceControls';
import useVoiceAssistant from './hooks/useVoiceAssistant';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m Raaju v1.0, your AI assistant. How can I help you today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openrouter/free');
  const [models, setModels] = useState([]);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);

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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle voice command detection
  useEffect(() => {
    if (isWakeWordDetected && transcript && !loading) {
      console.log('✅ Voice command:', transcript);
      if (handleVoiceCommand.current) {
        handleVoiceCommand.current(transcript);
      }
    }
  }, [isWakeWordDetected, transcript, loading]);

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
    
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setError('');

    try {
      // Prepare messages for API
      const messagesForAPI = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call API
      const response = await chatAPI.sendMessage(messagesForAPI, selectedModel);
      
      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        content: response.message
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if voice is enabled and pass reset callback
      if (voiceEnabled) {
        speak(response.message, resetWakeWord);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get response. Please check if backend is running.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Define handleVoiceCommand function and store in ref
  handleVoiceCommand.current = async (command) => {
    if (!command.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: command };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError('');

    try {
      // Prepare messages for API
      const messagesForAPI = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call API
      const response = await chatAPI.sendMessage(messagesForAPI, selectedModel);
      
      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        content: response.message
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response and reset listening when done
      speak(response.message, resetWakeWord);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get response. Please check if backend is running.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m Raaju v1.0, your AI assistant. How can I help you today?'
      }
    ]);
    try {
      await chatAPI.clearHistory();
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        models={models}
        onClearChat={handleClearChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-700 rounded"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-blue-400">Raaju v1.0</h1>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">ONLINE</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="hidden lg:block p-2 hover:bg-slate-700 rounded"
          >
            <Settings size={24} />
          </button>
        </div>

        {/* Chat Window */}
        <ChatWindow messages={messages} messagesEndRef={messagesEndRef} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-3 mx-4 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Voice Controls */}
        <VoiceControls
          voiceEnabled={voiceEnabled}
          onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          isWakeWordDetected={isWakeWordDetected}
          isListening={isListening}
          isSpeaking={isSpeaking}
          transcript={transcript}
        />

        {/* Input Area */}
        <div className="bg-slate-800 border-t border-slate-700 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
