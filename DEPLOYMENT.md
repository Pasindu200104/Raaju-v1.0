# Raaju v1.0 - Deployment Guide

## Deployment Architecture

```
Frontend (React + Vite)     Backend (FastAPI)
    ↓                           ↓
  Vercel               →    Railway/Render/Heroku
vercel.com              railway.app/render.com
```

## Option 1: Frontend on Vercel + Backend on Railway (RECOMMENDED)

### Deploy Frontend on Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Select your "Raaju-v1.0" repository
5. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - **Output Directory**: `dist`
6. Add Environment Variable (optional):
   - `VITE_API_URL=https://your-railway-url.up.railway.app` (add after backend deployed)
7. Click "Deploy" ✅

### Deploy Backend on Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose "Raaju-v1.0"
5. Configure:
   - **Root Directory**: Set to `backend` in Railway settings
   - **Python Version**: 3.11
6. Add Environment Variables:
   ```
   OPENROUTER_API_KEY=sk-or-v1-xxxxx
   BACKEND_PORT=8000
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
7. Railway will auto-deploy and give you a URL like:
   ```
   https://raaju-v1-0-production.up.railway.app
   ```

### Link Frontend to Backend

After Railway deploys, update Vercel:

1. Go to Vercel Project Settings
2. Add Environment Variable:
   ```
   VITE_API_URL=https://raaju-v1-0-production.up.railway.app
   ```
3. Redeploy the frontend

## Option 2: Alternative Backend Hosting

Instead of Railway, you can use:

**Render** (render.com)
- Free tier available
- Similar setup to Railway

**Heroku** (heroku.com)
- May require paid tier after free tier shutdown
- Same `Procfile` works

**PythonAnywhere** (pythonanywhere.com)
- Dedicated Python hosting

## Local Testing After Deployment

Update frontend `.env.local`:
```
VITE_API_URL=https://your-deployed-backend-url.com
```

Then run:
```bash
cd frontend
npm run dev
```

## Deployment Checklist

- [ ] Backend deployed (Railway/Render/Heroku)
- [ ] Backend URL obtained
- [ ] Frontend `.env.production` updated with backend URL
- [ ] Frontend deployed (Vercel)
- [ ] CORS configured for frontend domain
- [ ] Test chat functionality in production
- [ ] Check browser console for errors
- [ ] Monitor API response times

## Troubleshooting Deployment

### Frontend won't load
- Check Vercel build logs
- Ensure `npm run build` works locally
- Verify Node.js version (18+)

### Backend returns 500 errors
- Check Railway logs
- Verify `OPENROUTER_API_KEY` is set
- Ensure all environment variables are configured

### CORS errors in production
- Backend already configured to allow all origins
- If issues persist, update `main.py` CORS settings

### API calls fail
- Verify `VITE_API_URL` is correct in frontend
- Check that backend URL is accessible
- Test with `curl https://backend-url/health`

## File Structure for Deployment

```
Raaju-v1.0/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── requirements.txt
│   ├── .env (don't commit - use Railway env vars)
│   ├── Procfile          ✅ For Railway/Heroku
│   ├── runtime.txt       ✅ Python version
│   └── .gitignore
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.production   ✅ Production backend URL
│   ├── vercel.json       ✅ Vercel config
│   └── .gitignore
```

## Cost Estimates

- **Vercel Frontend**: Free tier
- **Railway Backend**: Free tier (up to 500 hours/month)
- **Total**: Free! ✅

## Performance Tips

1. Keep backend close to frontend (same region)
2. Enable caching in frontend
3. Use production builds (`npm run build`)
4. Monitor API response times
5. Set up alerts for errors

## Next Steps

1. Commit and push changes to GitHub
2. Deploy backend first (Railway)
3. Get backend URL
4. Deploy frontend (Vercel)
5. Update environment variables
6. Test in production

---

**Ready to deploy? Start with Railway backend, then Vercel frontend! 🚀**
