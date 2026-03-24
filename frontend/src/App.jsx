import { useState, useEffect, useRef } from 'react';
import { chatAPI } from './utils/api';
import './App.css';

function App() {
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'System initialized. Voice engine online.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(42);
  const [sessions, setSessions] = useState(1247);
  const [transcript, setTranscript] = useState('');
  const [speaking, setSpeaking] = useState(false);
  
  const logRef = useRef(null);
  const waveformRef = useRef(null);
  const freqBarsRef = useRef(null);
  const orbRef = useRef(null);
  const micBtnRef = useRef(null);
  const aiStatusRef = useRef(null);
  const micLabelRef = useRef(null);
  const bars = useRef([]);
  const animationInterval = useRef(null);
  const recognitionRef = useRef(null);
  const listeningTimeoutRef = useRef(null);
  const isStartedRef = useRef(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Listening started');
      isStartedRef.current = true;
      if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = setTimeout(() => {
        console.log('⏱️ Timeout - stopping recognition');
        recognition.stop();
      }, 15000);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const currentText = (finalTranscript || interimTranscript).trim();
      setTranscript(currentText);
      setInputText(currentText);

      // Auto-send on final result
      if (finalTranscript.trim()) {
        recognition.stop();
        setListening(false);
        setTimeout(() => {
          sendMessage(finalTranscript.trim());
        }, 500);
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      if (event.error === 'network') {
        addLog('Voice recognition error - network issue. Try again.', 'ai');
      }
    };

    recognition.onend = () => {
      console.log('🛑 Recognition ended');
      isStartedRef.current = false;
      if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    };
  }, []);

  // Cleanup speech on page unload
  useEffect(() => {
    const stopSpeechOnUnload = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };

    window.addEventListener('beforeunload', stopSpeechOnUnload);
    window.addEventListener('unload', stopSpeechOnUnload);
    window.addEventListener('pagehide', stopSpeechOnUnload);

    return () => {
      window.removeEventListener('beforeunload', stopSpeechOnUnload);
      window.removeEventListener('unload', stopSpeechOnUnload);
      window.removeEventListener('pagehide', stopSpeechOnUnload);
      // Cancel speech on unmount
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize waveform and frequency bars
  useEffect(() => {
    if (waveformRef.current && waveformRef.current.children.length === 0) {
      const BAR_COUNT = 40;
      for (let i = 0; i < BAR_COUNT; i++) {
        const b = document.createElement('div');
        b.className = 'bar';
        b.style.setProperty('--h', Math.floor(Math.random() * 36 + 8) + 'px');
        waveformRef.current.appendChild(b);
        bars.current.push(b);
      }
    }

    if (freqBarsRef.current && freqBarsRef.current.children.length === 0) {
      const FREQ_COUNT = 24;
      for (let i = 0; i < FREQ_COUNT; i++) {
        const b = document.createElement('div');
        b.className = 'freq-bar';
        const h = Math.max(4, Math.floor(Math.sin((i / FREQ_COUNT) * Math.PI) * 36 + Math.random() * 8));
        b.style.height = h + 'px';
        const hue = i < FREQ_COUNT / 2 ? `hsl(${160 + i * 3},100%,55%)` : `hsl(${200 + i * 2},100%,60%)`;
        b.style.background = hue;
        freqBarsRef.current.appendChild(b);
      }
    }
  }, []);

  // Animate frequency bars
  useEffect(() => {
    const animateFreq = () => {
      if (freqBarsRef.current) {
        const children = freqBarsRef.current.children;
        for (let i = 0; i < children.length; i++) {
          const base = listening || speaking ? Math.random() * 34 + 6 : Math.max(4, Math.floor(Math.sin(Date.now() / 600 + i / 3) * 14 + 16));
          children[i].style.height = base + 'px';
        }
      }
    };

    animationInterval.current = setInterval(animateFreq, listening || speaking ? 80 : 200);
    return () => clearInterval(animationInterval.current);
  }, [listening, speaking]);

  // Update stats every 3 seconds
  useEffect(() => {
    const statsInterval = setInterval(() => {
      setSessions((s) => s + Math.floor(Math.random() * 3));
      setLatency(Math.floor(Math.random() * 20 + 34));
    }, 3000);
    return () => clearInterval(statsInterval);
  }, []);

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!recognitionRef.current || isStartedRef.current) return;

    setListening(true);
    setTranscript('');
    setInputText('');
    isStartedRef.current = true;

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      isStartedRef.current = false;
      setListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    setListening(false);
    isStartedRef.current = false;
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  // Sanitize text for speech - remove special chars, emojis, symbols
  const sanitizeForSpeech = (text) => {
    if (!text) return '';
    
    // Remove emojis and special unicode characters
    let cleaned = text
      .replace(/[\p{Emoji_Presentation}\p{Emoji}\p{Emoji_Component}]/gu, '')
      .replace(/[\p{So}]/gu, '') // Remove symbols
      .replace(/[#*_~`^[\]{}|\\]/g, '') // Remove markdown-like characters
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/\[\[.*?\]\]/g, '') // Remove wiki-style brackets
      .replace(/\{.*?\}/g, '') // Remove curly braces content
      .replace(/\|\|/g, '') // Remove pipes
      .replace(/→|←|↑|↓|►|◄|◆|■|●|○|✓|✗|✔|✘/g, '') // Remove arrows and symbols
      .replace(/\s{2,}/g, ' ') // Remove extra spaces
      .trim();
    
    return cleaned;
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not available');
      return;
    }

    // Sanitize text before speaking
    const cleanText = sanitizeForSpeech(text);
    if (!cleanText) return;

    window.speechSynthesis.cancel();
    setSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const maleVoice = 
      voices.find(v => v.name.toLowerCase().includes('male')) ||
      voices.find(v => !v.name.toLowerCase().includes('female')) ||
      voices[0];

    if (maleVoice) utterance.voice = maleVoice;

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const scrollLogToBottom = () => {
    if (logRef.current) {
      setTimeout(() => {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }, 0);
    }
  };

  const addLog = (text, type) => {
    setMessages((prev) => [...prev, { type, text }]);
    scrollLogToBottom();
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    addLog(text, 'user');
    setInputText('');
    setLoading(true);
    setTranscript('');

    try {
      const startTime = Date.now();
      const response = await chatAPI.sendMessage(
        [{ role: 'user', content: text }],
        'openrouter/free'
      );
      const responseTime = Date.now() - startTime;
      setLatency(responseTime);

      addLog(response.message, 'ai');
      speak(response.message);
    } catch (err) {
      const errorMsg = 'Error: Failed to get response. Please try again.';
      addLog(errorMsg, 'ai');
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendClick = () => {
    sendMessage(inputText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  useEffect(() => {
    scrollLogToBottom();
  }, [messages]);

  return (
    <>
      <div className="grid-bg"></div>
      <div className="scanline"></div>
      <div className="shell">
      {/* Header */}
      <header className="header">
        <div className="logo">
          RAAJU v1.0
          <span>AI VOICE INTERFACE</span>
        </div>
        <div className="status-bar">
          <div className="dot online"></div>
          <span className="status-label">ONLINE</span>
          <div className="dot warn" style={{ marginLeft: '0.5rem' }}></div>
          <span className="status-label">GPU 76%</span>
          <div className="dot off" style={{ marginLeft: '0.5rem' }}></div>
          <span className="status-label">NODE-3</span>
        </div>
      </header>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Latency</div>
          <div className="stat-value">{latency}ms</div>
          <div className="stat-sub">Realtime voice</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Accuracy</div>
          <div className="stat-value">98.7<span style={{ fontSize: '0.9rem' }}>%</span></div>
          <div className="stat-sub">ASR engine</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sessions</div>
          <div className="stat-value">{sessions.toLocaleString()}</div>
          <div className="stat-sub">Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Uptime</div>
          <div className="stat-value">99.9<span style={{ fontSize: '0.9rem' }}>%</span></div>
          <div className="stat-sub">Last 30 days</div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="main-panel">
        {/* Voice Center */}
        <div className="voice-center">
          <div className="ai-status-text" ref={aiStatusRef}>
              {listening ? '▶ LISTENING — SPEAK YOUR COMMAND' : speaking ? '◆ SPEAKING — RESPONSE AUDIO' : '■ STANDBY — AWAITING VOICE INPUT'}
            </div>

            <div className="orb-wrap">
              <div className="orb-ring r1"></div>
              <div className="orb-ring r2"></div>
              <div className="orb-ring r3"></div>
              <div
                className={`orb ${listening || speaking ? 'listening' : ''}`}
                ref={orbRef}
                title="Click to toggle voice"
                onClick={toggleListening}
              ></div>
            </div>

            <div className={`waveform ${listening || speaking ? 'active' : ''}`} ref={waveformRef}></div>
            <div className="mic-label" ref={micLabelRef}>
              {listening ? 'VOICE CAPTURE ACTIVE — SPEAK NOW' : speaking ? 'AI IS RESPONDING...' : 'CLICK ORB OR BUTTON TO ACTIVATE'}
            </div>

            {/* Display transcript if speaking or listening */}
            {(transcript || inputText) && (
              <div style={{ 
                marginTop: '0.8rem', 
                fontSize: '0.75rem', 
                color: listening ? '#00f5c8' : '#4a7a99',
                textAlign: 'center',
                maxWidth: '100%',
                wordWrap: 'break-word'
              }}>
                {listening ? '🎤 Heard: ' : '📝 '}
                {transcript || inputText}
              </div>
            )}

            {/* Text input row */}
            <div className="text-input-row">
              <input
                className="text-input"
                type="text"
                placeholder="Type a command or speak..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="send-btn" onClick={handleSendClick} disabled={loading || speaking}>
                {loading ? 'SENDING...' : 'SEND ▶'}
              </button>
            </div>

            <button 
              className={`mic-btn ${listening || speaking ? 'active' : ''}`} 
              ref={micBtnRef} 
              onClick={speaking ? stopSpeaking : toggleListening}
              style={{ opacity: speaking ? 0.6 : 1 }}
            >
              {listening ? '■ DEACTIVATE VOICE' : speaking ? '□ STOP SPEAKING' : '⬤ ACTIVATE VOICE'}
            </button>
          </div>

          {/* Side Panel */}
          <div className="side-panel">
            {/* Command Log */}
            <div className="panel-box">
              <div className="panel-title">Command Log</div>
              <div className="log" ref={logRef}>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`log-entry ${msg.type}`}>
                    {msg.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Modules */}
            <div className="panel-box">
              <div className="panel-title">Modules</div>
              <div className="modules">
                <div className="module-item enabled">
                  <span className="mod-dot"></span>
                  <span className="mod-name">NLP Core</span>
                  <span className="mod-status">ON</span>
                </div>
                <div className="module-item enabled">
                  <span className="mod-dot"></span>
                  <span className="mod-name">Voice API</span>
                  <span className="mod-status">ON</span>
                </div>
                <div className="module-item enabled">
                  <span className="mod-dot"></span>
                  <span className="mod-name">Speech Recognition</span>
                  <span className="mod-status">{listening ? 'ACTIVE' : 'ON'}</span>
                </div>
                <div className="module-item enabled">
                  <span className="mod-dot"></span>
                  <span className="mod-name">Response</span>
                  <span className="mod-status">ON</span>
                </div>
                <div className="module-item enabled">
                  <span className="mod-dot"></span>
                  <span className="mod-name">Memory</span>
                  <span className="mod-status">ON</span>
                </div>
                <div className="module-item enabled">
                  <span className="mod-dot"></span>
                  <span className="mod-name">Text-to-Speech</span>
                  <span className="mod-status">{speaking ? 'ACTIVE' : 'ON'}</span>
                </div>
              </div>
            </div>

            {/* Freq Meter */}
            <div className="panel-box">
              <div className="panel-title">Frequency Spectrum</div>
              <div className="freq-bars" ref={freqBarsRef}></div>
            </div>
          </div>
        </div>

        <footer className="footer">
          <div className="footer-info">
            SESSION ID: AU-2026-0324-7X91 &nbsp;|&nbsp; ENC: AES-256 &nbsp;|&nbsp; VOICE PKT: 0
          </div>
          <div className="footer-tag">RAAJU v1.0</div>
        </footer>
      </div>
    </>
  );
}

export default App;
