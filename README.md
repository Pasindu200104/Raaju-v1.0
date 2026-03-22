# Raaju v1.0 - AI Chat Application

A modern AI chat application powered by OpenRouter, combining Python FastAPI backend with React Vite frontend styled with Tailwind CSS.

## Features

✨ **Modern AI Chat Interface** - Clean, responsive design similar to Claude
🚀 **Fast & Efficient** - Built with Vite for instant frontend development
🔄 **Multiple AI Models** - Switch between different free AI models
💬 **Real-time Chat** - Instant responses from OpenRouter API
📱 **Mobile Responsive** - Works perfectly on desktop and mobile
🎨 **Beautiful UI** - Tailwind CSS with dark theme
🔐 **Secure API** - Secure communication with OpenRouter

## Tech Stack

**Backend:**
- Python 3.8+
- FastAPI
- Uvicorn
- Requests

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Lucide Icons
- Axios

## Prerequisites

- Python 3.8 or higher
- Node.js 16+ and npm
- OpenRouter API Key (provided)

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python main.py
```

Backend runs on: `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Usage

1. Open `http://localhost:5173` in your browser
2. Type your message in the input field
3. Click **Send** or press Enter
4. Raaju AI will respond instantly
5. Switch models using the sidebar
6. Clear chat history anytime

## Available AI Models

1. **Mistral 7B Instruct** (Free) - Fast, recommended
2. **Llama 2 70B Chat** (Free) - More powerful
3. **Nous Hermes 2 Mixtral** - High quality

## Project Structure

```
Raaju-v1.0/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── requirements.txt      # Dependencies
│   ├── .env                  # API key (configured)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── utils/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

## API Endpoints

- **POST** `/api/chat` - Send message and get AI response
- **GET** `/api/models` - Get available models
- **GET** `/health` - Health check
- **POST** `/api/clear-history` - Clear chat history

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check if port 8000 is in use |
| Frontend won't load | Delete node_modules, run npm install |
| No AI response | Check API key in .env |
| CORS errors | Ensure backend is running |

## Production Build

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

## Environment Variables

Backend `.env`:
```
OPENROUTER_API_KEY=your_key_here
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:5173
```

## Features to Explore

- Switch between different AI models
- Get instant responses from powerful LLMs
- Beautiful dark theme UI
- Responsive design for mobile
- Clear chat history
- Multiple conversation support

## License

Open source - feel free to use and modify

## Support

- Check OpenRouter docs: https://openrouter.ai
- FastAPI docs: https://fastapi.tiangolo.com
- React docs: https://react.dev

---

**Raaju v1.0** - Your AI Chat Companion  
Powered by OpenRouter AI 🚀
