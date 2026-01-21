# 🚀 Getting Started with HiveHR Backend

## ⚡ Quick Start (3 Steps)

### Step 1: Get Your Supabase Service Role Key

1. Open https://supabase.com in your browser
2. Sign in and select your **HiveHR** project
3. Click **Settings** (⚙️ icon) → **API**
4. Scroll down and copy the **`service_role`** secret key
   - ⚠️ This key starts with `eyJ...` and is VERY long
   - ⚠️ Keep this SECRET - never share or commit to Git!

### Step 2: Configure Backend

1. Open `Backend/.env` file in your editor
2. Find this line:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
3. Replace `your_service_role_key_here` with your actual key:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Save the file

### Step 3: Start the Server

Open terminal in the `Backend` folder and run:

```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║     🐝 HiveHR Backend Server          ║
╠════════════════════════════════════════╣
║  Status: Running                       ║
║  Port: 5000                            ║
║  Environment: development              ║
║  API Docs: http://localhost:5000/api   ║
╚════════════════════════════════════════╝
```

## ✅ Test Your Backend

### Option 1: Browser
Open your browser and visit:
- http://localhost:5000/health
- http://localhost:5000/api

### Option 2: Command Line (curl)
```bash
curl http://localhost:5000/health
```

You should see:
```json
{
  "success": true,
  "message": "HiveHR Backend API is running",
  "timestamp": "2024-01-21T...",
  "environment": "development"
}
```

### Option 3: Postman
1. Open Postman
2. Click **Import**
3. Select `Backend/HiveHR_API.postman_collection.json`
4. Test the endpoints!

## 📖 What's Next?

### For Testing the Backend:
1. **Read the API docs**: http://localhost:5000/api
2. **Use Postman**: Import the collection and test endpoints
3. **Check QUICK_REFERENCE.md**: Common API calls

### For Frontend Integration:
1. **Read SETUP_GUIDE.md**: Complete frontend integration guide
2. **Create API service**: Copy the example code
3. **Update hooks**: Migrate from direct Supabase to backend API

## 📁 Important Files

| File | What It Does |
|------|--------------|
| `README.md` | Complete API documentation |
| `SETUP_GUIDE.md` | Frontend integration guide |
| `QUICK_REFERENCE.md` | Quick API reference |
| `ARCHITECTURE.md` | System architecture |
| `IMPLEMENTATION_SUMMARY.md` | What we built |
| `HiveHR_API.postman_collection.json` | Postman tests |

## 🎯 Common Tasks

### Start Development Server
```bash
cd Backend
npm run dev
```

### Start Production Server
```bash
cd Backend
npm start
```

### Stop Server
Press `Ctrl + C` in the terminal

### Change Port
Edit `Backend/.env`:
```env
PORT=3000
```

## 🔐 Security Checklist

- [ ] Added Supabase service role key to `.env`
- [ ] `.env` file is in `.gitignore`
- [ ] Never committed `.env` to Git
- [ ] Using strong JWT_SECRET in production
- [ ] HTTPS enabled in production

## 🐛 Troubleshooting

### "Port 5000 is already in use"
**Solution 1**: Change port in `.env`
```env
PORT=5001
```

**Solution 2**: Kill the process (Windows)
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "Unauthorized" or "Invalid token"
- Make sure you added the service role key to `.env`
- Restart the server after changing `.env`

### "Cannot find module"
```bash
cd Backend
npm install
```

### "CORS error"
Add your frontend URL to `.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 💡 Pro Tips

1. **Keep the server running** while developing frontend
2. **Check terminal logs** to see all API requests
3. **Use Postman** to test before integrating with frontend
4. **Read error messages** - they're descriptive!
5. **Check documentation** when stuck

## 🎓 Learning Path

1. ✅ **You are here**: Backend is running
2. 📝 **Next**: Test with Postman
3. 🔗 **Then**: Integrate with frontend
4. 🧪 **Finally**: Test complete flows

## 📞 Need Help?

1. Check the error message in terminal
2. Read the relevant documentation file
3. Search for the error online
4. Check Supabase dashboard for database issues

## 🎉 Success!

If you see the server running message, you're all set! 

Your backend is now:
- ✅ Running on http://localhost:5000
- ✅ Connected to Supabase
- ✅ Ready to handle API requests
- ✅ Secured with JWT authentication
- ✅ Validated with Joi schemas

**Happy coding! 🚀**

---

**Quick Links:**
- [API Documentation](./README.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Architecture](./ARCHITECTURE.md)
