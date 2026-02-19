# 🎯 ResumeAI - AI-Powered Resume Screening System

A complete full-stack application for automating resume screening using NLP and machine learning. Built for corporate recruiters, HR teams, and hiring managers.

## ✨ Features

### Core Functionality
- **Resume Upload & Parsing**: Upload PDF/DOCX resumes with automatic text extraction
- **AI-Powered Analysis**: Extract skills, experience, education using NLP
- **Smart Matching**: Match candidates with jobs using ML algorithms
- **Candidate Ranking**: Rank applicants based on skill similarity scores
- **Recruiter Dashboard**: Comprehensive analytics and insights
- **JWT Authentication**: Secure user authentication for HR teams
- **Real-time Analytics**: Track hiring metrics and trends

### Technical Highlights
- Full-stack architecture (React + Node.js + Python)
- RESTful API design
- MongoDB database with optimized indexes
- TF-IDF and cosine similarity for text matching
- Scikit-learn for ML operations
- Responsive UI with Tailwind CSS
- File upload with drag-and-drop
- Real-time progress tracking

## 🏗️ Architecture

```
resume-screening-system/
├── backend/              # Node.js/Express API
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & validation
│   └── uploads/         # Resume storage
├── ml-service/          # Python ML/NLP service
│   └── main.py         # FastAPI service
├── frontend/            # React application
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Route pages
│       └── context/     # Global state
└── database/            # MongoDB setup
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **File Processing**: Multer, PDF-Parse, Mammoth
- **Security**: Helmet, CORS, Rate Limiting

### ML Service
- **Language**: Python 3.8+
- **Framework**: FastAPI
- **ML Libraries**: Scikit-learn, NLTK
- **NLP**: TF-IDF, Cosine Similarity
- **Text Processing**: Regular expressions, tokenization

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **UI Components**: Heroicons, React Dropzone

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **Python** 3.8 or higher ([Download](https://www.python.org/))
- **MongoDB** 6.0 or higher ([Download](https://www.mongodb.com/))
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd resume-screening-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# If you see EBADENGINE or deprecated warnings: the install still succeeds. Those come from 
# old transitive dependencies (e.g. from pdf-parse). You can ignore them to run the app.
# To fix some security issues, run: npm audit fix

# better to remove previous npm and fresh start it with
# Remove project dependencies and lock file
# If it runs perfectly better skip till next "npm install"(line : 112)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Clear npm cache (optional but thorough)
npm cache clean --force

# Reinstall from scratch
npm install



# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Set MongoDB URI, JWT secret, etc.

# Create uploads directory
mkdir uploads

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

**If `npm install` shows warnings:** You may see `EBADENGINE` or "deprecated" messages for packages like `hawk`, `request`, or `hoek`. These come from old transitive dependencies (e.g. used by `pdf-parse`). **The install still succeeds** and the app will run. To fix some of the reported security issues, run `npm audit fix` (use `npm audit fix --force` only if you accept possible breaking changes).

### 3. ML Service Setup

```bash
cd ml-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# Start the service
python main.py
```

The ML service will run on `http://localhost:8000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 5. Database Setup

Make sure MongoDB is running:

```bash
# Start MongoDB service
# On macOS:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# On Windows:
# MongoDB runs as a service automatically after installation
```

The application will create the database and collections automatically.

## 🔑 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume-screening
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
ML_SERVICE_URL=http://localhost:8000
MAX_FILE_SIZE=5242880
```

### ML Service

No environment variables required for basic setup.

## 📱 Usage Guide

### For Recruiters

1. **Register/Login**: Create an account or login with credentials
2. **Upload Resumes**: 
   - Navigate to "Upload Resume"
   - Drag & drop or select PDF/DOCX files
   - Enter candidate information
   - System automatically parses skills and experience
3. **Create Jobs**:
   - Define job requirements
   - Specify required skills with importance weights
   - Set experience requirements
4. **Match Candidates**:
   - View job details
   - System automatically matches and ranks candidates
   - Review match scores and recommendations
5. **Analytics**:
   - View dashboard for hiring metrics
   - Track top skills in database
   - Monitor application trends

### For Developers

#### API Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

**Resumes**
- `POST /api/resumes/upload` - Upload resume
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id` - Get single resume
- `POST /api/resumes/:id/match/:jobId` - Match resume with job

**Jobs**
- `POST /api/jobs` - Create job
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `GET /api/jobs/:id/candidates` - Get ranked candidates

**Analytics**
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/skills` - Skill analytics
- `GET /api/analytics/trends` - Hiring trends

**ML Service**
- `POST /api/parse-resume` - Parse resume text
- `POST /api/match` - Match resume with job

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### ML Service Tests
```bash
cd ml-service
pytest
```

## 🚢 Deployment

### Docker Deployment (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/resume-screening
    depends_on:
      - mongodb

  ml-service:
    build: ./ml-service
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

Run with:
```bash
docker-compose up -d
```

### Production Deployment

1. **Backend**: Deploy to Heroku, AWS EC2, or DigitalOcean
2. **Database**: Use MongoDB Atlas (free tier available)
3. **ML Service**: Deploy to AWS Lambda or Google Cloud Run
4. **Frontend**: Deploy to Vercel, Netlify, or AWS S3

## 🎓 Project Structure Explained

### Models
- **User**: Stores recruiter/HR user information
- **Resume**: Stores candidate data and parsed information
- **Job**: Stores job postings with requirements

### Algorithms
- **TF-IDF Vectorization**: Converts text to numerical features
- **Cosine Similarity**: Measures text similarity (0-1 scale)
- **Skill Matching**: Weighted matching based on skill importance
- **Combined Score**: 60% skill match + 40% text similarity

## 📊 Sample Data

Create a test user:
```bash
POST /api/auth/register
{
  "name": "Test Recruiter",
  "email": "test@company.com",
  "password": "password123",
  "company": "Tech Corp",
  "role": "recruiter"
}
```

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Ensure MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

**ML Service Not Starting**
```bash
# Install missing dependencies
pip install -r requirements.txt --upgrade
```

**Frontend Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS Errors**
- Ensure backend CORS is configured for frontend URL
- Check FRONTEND_URL in backend .env

## 📈 Performance Optimization

- **Database Indexing**: Implemented on frequently queried fields
- **Caching**: Add Redis for frequently accessed data
- **File Storage**: Consider AWS S3 for production
- **API Rate Limiting**: Configured to prevent abuse
- **Code Splitting**: React lazy loading for better performance

## 🔐 Security Best Practices

- JWT tokens with expiration
- Password hashing with bcrypt
- Input validation and sanitization
- File type and size validation
- Helmet.js for security headers
- Rate limiting on API endpoints
- CORS configuration
- Environment variable protection

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Scikit-learn for ML algorithms
- MongoDB for database
- React team for amazing framework
- FastAPI for Python web framework

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Email: support@resumeai.com

## 🗺️ Roadmap

- [ ] Add video interview scheduling
- [ ] Email notification system
- [ ] Advanced analytics with ML insights
- [ ] Integration with LinkedIn
- [ ] Mobile application
- [ ] Multi-language support
- [ ] Automated interview question generation

---

**Built with ❤️ for modern recruitment**
