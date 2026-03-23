import { useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceDisplay({
  voiceEnabled,
  onToggleVoice,
  isListening,
  isWakeWordDetected,
  isSpeaking,
  userTranscript,
  responseText,
}) {
  const responseEndRef = useRef(null);
  const responseContainerRef = useRef(null);

  // Auto-scroll to show current line being spoken
  useEffect(() => {
    if (responseEndRef.current && isSpeaking) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [responseText, isSpeaking]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Status Indicator */}
      <div className="absolute top-8 right-8 flex items-center gap-3">
        <div className="flex flex-col items-end gap-2">
          {isListening && (
            <div className="text-emerald-400 text-sm font-semibold animate-pulse">
              🎤 LISTENING
            </div>
          )}
          {isWakeWordDetected && (
            <div className="text-cyan-400 text-sm font-semibold animate-pulse">
              ✓ WAKE DETECTED
            </div>
          )}
          {isSpeaking && (
            <div className="text-purple-400 text-sm font-semibold animate-pulse">
              🔊 SPEAKING
            </div>
          )}
        </div>
        <button
          onClick={onToggleVoice}
          className={`p-3 rounded-full transition-all shadow-lg ${
            voiceEnabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-400'
          }`}
        >
          {voiceEnabled ? (
            <Mic size={24} className="animate-pulse" />
          ) : (
            <MicOff size={24} />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl space-y-16">
        {/* User Input Section */}
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-blue-400 text-xs uppercase tracking-widest font-semibold">
              Your Command
            </span>
          </div>
          <div className="h-12 flex items-center justify-center">
            {userTranscript ? (
              <p className="text-blue-300 text-sm font-mono text-center px-4 py-2 bg-blue-950/30 rounded border border-blue-700/50 max-w-2xl">
                {userTranscript}
              </p>
            ) : (
              <p className="text-slate-500 text-sm italic text-center">
                {voiceEnabled ? 'Say "hello" to start...' : 'Enable voice to continue...'}
              </p>
            )}
          </div>
        </div>

        {/* Response Section */}
        <div className="space-y-6">
          <div className="text-center">
            <span className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">
              Raaju's Response
            </span>
          </div>

          <div 
            ref={responseContainerRef}
            className="h-32 flex items-center justify-center overflow-y-auto overflow-x-hidden"
          >
            <div className="w-full px-6 py-4 bg-gradient-to-r from-emerald-950/40 via-blue-950/40 to-cyan-950/40 rounded-lg border border-emerald-700/50 backdrop-blur-sm">
              {responseText ? (
                <p className="text-emerald-300 text-base leading-relaxed font-light text-center whitespace-pre-wrap">
                  {responseText}
                  {isSpeaking && <span className="animate-pulse">█</span>}
                </p>
              ) : (
                <p className="text-slate-600 text-sm italic text-center">
                  Waiting for response...
                </p>
              )}
              <div ref={responseEndRef} />
            </div>
          </div>
        </div>

        {/* Hint Text */}
        <div className="text-center pt-4">
          <p className="text-slate-500 text-xs">
            {isWakeWordDetected
              ? 'Listening for your command...'
              : voiceEnabled
              ? 'Say "hello" and speak naturally'
              : 'Enable voice to get started'}
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -z-10" />
    </div>
  );
}
