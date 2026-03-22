# Quick Start Guide - Raaju v1.0

## 🚀 Get Started in 2 Steps

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

## 🌐 Access the Application

Open your browser and go to: **http://localhost:5173**

## 💬 Start Chatting!

1. Type your message
2. Press Enter or click Send
3. Raaju will respond with AI-generated responses
4. Switch models from the sidebar
5. Clear chat history anytime

## 📋 What's Working

✅ AI Chat with multiple models  
✅ Beautiful dark theme UI  
✅ Responsive design  
✅ Real-time responses  
✅ Model selection  
✅ Chat history clearing  

## 🔧 Troubleshooting

### Backend won't start?
- Check port 8000 isn't in use: `netstat -ano | findstr :8000`
- Verify venv is activated
- Update Python: `python --version`

### Frontend won't load?
- Check port 5173 isn't in use
- Delete node_modules: `rmdir /s node_modules`
- Reinstall: `npm install`

### No AI responses?
- Verify backend is running on port 8000
- Check .env file has API key
- Internet connection working

## 📚 Available Models

1. **Mistral 7B** - Fast, free
2. **Llama 2 70B** - Powerful, free
3. **Nous Hermes 2** - High quality

## 🎯 Next Steps

- Customize the UI colors in `tailwind.config.js`
- Add more models in `backend/config.py`
- Deploy to production with Vercel/Heroku
- Add user authentication
- Persist chat history

## 📞 Need Help?

Check the main README.md for detailed documentation!

---

**Enjoy Raaju v1.0! 🎉**
