import { X, Trash2 } from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  selectedModel,
  onModelChange,
  models,
  onClearChat
}) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative w-64 h-screen bg-slate-800 border-r border-slate-700 p-4 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-slate-700 rounded"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-lg font-bold text-blue-400 mb-6 mt-10 lg:mt-0">Raaju v1.0</h2>

        {/* Model Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            AI Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Model: {models.find(m => m.id === selectedModel)?.type || 'Free'}
          </p>
        </div>

        {/* Model Info */}
        <div className="bg-slate-700/50 rounded p-3 mb-6">
          <p className="text-xs text-slate-300">
            <strong>Current Model:</strong>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {models.find(m => m.id === selectedModel)?.description || 'Select a model'}
          </p>
        </div>

        {/* Clear Chat Button */}
        <button
          onClick={() => {
            onClearChat();
            onClose();
          }}
          className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 rounded px-4 py-2 flex items-center justify-center gap-2 transition"
        >
          <Trash2 size={18} />
          Clear Chat
        </button>

        {/* Footer Info */}
        <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-400">
          <p>Raaju v1.0</p>
          <p>Powered by OpenRouter</p>
          <p className="mt-2">Using free & efficient models</p>
        </div>
      </div>
    </>
  );
}
