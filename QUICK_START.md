# Quick Start Guide

Get the Resume Screening System up and running in 10 minutes!

## Prerequisites Checklist

- ✅ Node.js 18+ installed
- ✅ Python 3.8+ installed  
- ✅ MongoDB running locally or MongoDB Atlas account
- ✅ Terminal/Command Prompt access

## Step-by-Step Setup

### 1. Clone and Navigate (1 minute)

```bash
cd resume-screening-system
```

### 2. Backend Setup (2 minutes)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env file with your MongoDB URI
mkdir uploads
npm run dev
```

Backend should now be running on http://localhost:5000

### 3. ML Service Setup (3 minutes)

Open a new terminal:

```bash
cd ml-service
python -m venv venv

# Activate virtual environment:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
python main.py
```

ML Service should now be running on http://localhost:8000

### 4. Frontend Setup (2 minutes)

Open another new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend should now be running on http://localhost:3000

### 5. Create Your First User (1 minute)

1. Open http://localhost:3000 in your browser
2. Click "Register here"
3. Fill in the form:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123
   - Company: Your Company (optional)
4. Click "Register"

### 6. Upload Your First Resume (1 minute)

1. Click "Upload Resume" in the sidebar
2. Drag and drop a PDF or DOCX resume
3. Enter candidate information
4. Click "Upload Resume"

## What You Can Do Now

### Create a Job Posting
1. Go to "Jobs" → "Create New Job"
2. Fill in job details and required skills
3. Submit the form

### Match Candidates
1. Go to a job detail page
2. Click "Match All Resumes"
3. View ranked candidates

### View Analytics
1. Go to "Dashboard" or "Analytics"
2. See hiring metrics and trends
3. View top skills and jobs

## Test Credentials

If you want to use pre-seeded data (after running seed script):

```
Email: admin@resumeai.com
Password: admin123
```

## Common Issues & Solutions

### MongoDB Connection Error
```bash
# Make sure MongoDB is running:
# Mac:
brew services start mongodb-community
# Linux:
sudo systemctl start mongod
# Windows: MongoDB runs as a service
```

### Port Already in Use
```bash
# Kill process on port 5000:
# Mac/Linux:
lsof -ti:5000 | xargs kill -9
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### ML Service Not Starting
```bash
# Reinstall dependencies:
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

### Frontend Build Errors
```bash
# Clear cache and reinstall:
rm -rf node_modules package-lock.json
npm install
```

## Quick API Test

Test if everything is working:

```bash
# Test backend
curl http://localhost:5000/api/health

# Test ML service
curl http://localhost:8000/health

# Test frontend (in browser)
# Visit: http://localhost:3000
```

## Next Steps

- 📖 Read the full [README.md](README.md)
- 🔧 Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- 🚀 Review [DEPLOYMENT.md](DEPLOYMENT.md)
- 💡 Customize the application for your needs

## Getting Help

- Check the documentation in the `/docs` folder
- Review error logs in the terminal
- Create an issue in the repository
- Contact the development team

## Development Tips

### Hot Reload
All services support hot reload:
- Backend: Uses `nodemon` with `npm run dev`
- Frontend: Uses Vite dev server
- ML Service: Restart manually or use `uvicorn --reload`

### Database GUI
Use MongoDB Compass to view database:
```
mongodb://localhost:27017/resume-screening
```

### API Testing
Use Postman or Thunder Client VS Code extension for API testing.

### Debugging
- Backend: Use VS Code debugger or `console.log`
- Frontend: Use React Developer Tools
- ML Service: Add print statements or use pdb

## Production Deployment

When ready for production:

1. Review [DEPLOYMENT.md](DEPLOYMENT.md)
2. Set up production database (MongoDB Atlas)
3. Deploy backend (Heroku, AWS, DigitalOcean)
4. Deploy ML service (AWS Lambda, Google Cloud Run)
5. Deploy frontend (Vercel, Netlify)
6. Configure environment variables
7. Set up monitoring and backups

---

**That's it! You're ready to start screening resumes with AI! 🎉**
