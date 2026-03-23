import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export default function VoiceControls({
  voiceEnabled,
  onToggleVoice,
  isWakeWordDetected,
  isListening,
  isSpeaking,
  transcript,
}) {
  return (
    <div className="bg-slate-700/50 border-t border-slate-600 p-4 space-y-3">
      {/* Voice Toggle Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleVoice}
          className={`p-3 rounded-lg transition flex items-center gap-2 ${
            voiceEnabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-400'
          }`}
        >
          {voiceEnabled ? (
            <>
              <Mic size={20} />
              <span className="text-sm font-medium">Voice Enabled</span>
            </>
          ) : (
            <>
              <MicOff size={20} />
              <span className="text-sm font-medium">Voice Disabled</span>
            </>
          )}
        </button>
      </div>

      {/* Wake Word Status */}
      {voiceEnabled && (
        <div className="text-xs space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isListening ? 'bg-green-500 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="text-slate-300">
              {isListening
                ? 'Listening for "Hello"...'
                : 'Say "Hello" to start'}
            </span>
          </div>

          {/* Wake Word Detected */}
          {isWakeWordDetected && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-yellow-400">Wake word detected! Listening for command...</span>
            </div>
          )}

          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-purple-400 animate-pulse" />
              <span className="text-purple-400">Raaju is speaking...</span>
            </div>
          )}

          {/* Current Transcript */}
          {transcript && (
            <div className="bg-slate-800 px-3 py-2 rounded text-slate-200 border border-slate-600">
              <div className="text-xs text-slate-400 mb-1">Heard:</div>
              <div className="text-sm italic">{transcript}</div>
            </div>
          )}
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-slate-400 leading-relaxed">
        {voiceEnabled
          ? '🎤 Voice control active. Say "Hello" to wake up the assistant.'
          : '🔇 Voice control is off. Toggle to enable voice commands.'}
      </p>
    </div>
  );
}
