# Project Structure

Complete overview of the Resume Screening System architecture and file organization.

## 📁 Directory Structure

```
resume-screening-system/
│
├── backend/                        # Node.js/Express Backend
│   ├── models/                     # Mongoose Models
│   │   ├── User.js                # User authentication model
│   │   ├── Resume.js              # Resume data model
│   │   └── Job.js                 # Job posting model
│   │
│   ├── routes/                     # API Routes
│   │   ├── auth.js                # Authentication endpoints
│   │   ├── resume.js              # Resume CRUD operations
│   │   ├── job.js                 # Job CRUD operations
│   │   └── analytics.js           # Analytics endpoints
│   │
│   ├── middleware/                 # Express Middleware
│   │   └── auth.js                # JWT authentication
│   │
│   ├── uploads/                    # Resume file storage
│   ├── server.js                   # Express server setup
│   ├── package.json               # Node dependencies
│   └── .env.example               # Environment variables template
│
├── ml-service/                     # Python ML/NLP Service
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   └── .gitignore
│
├── frontend/                       # React Frontend
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   │   ├── Layout.jsx        # Main layout with sidebar
│   │   │   └── ProtectedRoute.jsx # Auth guard
│   │   │
│   │   ├── pages/                 # Route pages
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Register.jsx      # Registration page
│   │   │   ├── Dashboard.jsx     # Main dashboard
│   │   │   ├── ResumeUpload.jsx  # Resume upload
│   │   │   ├── ResumeList.jsx    # Resume listing
│   │   │   ├── ResumeDetail.jsx  # Resume details
│   │   │   ├── JobList.jsx       # Job listings
│   │   │   ├── JobCreate.jsx     # Create job
│   │   │   ├── JobDetail.jsx     # Job details
│   │   │   └── Analytics.jsx     # Analytics page
│   │   │
│   │   ├── context/               # React Context
│   │   │   └── AuthContext.jsx   # Authentication state
│   │   │
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global styles
│   │
│   ├── index.html                 # HTML template
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind CSS config
│   ├── postcss.config.js         # PostCSS config
│   └── package.json              # Frontend dependencies
│
├── README.md                       # Main documentation
├── API_DOCUMENTATION.md           # API reference
├── DEPLOYMENT.md                  # Deployment guide
├── QUICK_START.md                 # Quick start guide
└── .gitignore                     # Git ignore rules
```

## 🎯 Core Components

### Backend (Node.js/Express)

**Purpose**: RESTful API server handling authentication, data management, and business logic

**Key Technologies**:
- Express.js - Web framework
- Mongoose - MongoDB ORM
- JWT - Authentication
- Multer - File uploads
- PDF-Parse - PDF text extraction
- Mammoth - DOCX text extraction

**Main Files**:
- `server.js`: Express server configuration, middleware setup, route mounting
- `models/`: Database schemas defining data structure
- `routes/`: API endpoints organized by resource
- `middleware/auth.js`: JWT verification and authorization

### ML Service (Python/FastAPI)

**Purpose**: Natural Language Processing and machine learning operations

**Key Technologies**:
- FastAPI - Modern Python web framework
- Scikit-learn - Machine learning algorithms
- NLTK - Natural language processing
- TF-IDF Vectorization - Text feature extraction
- Cosine Similarity - Matching algorithm

**Main Files**:
- `main.py`: FastAPI application with all ML endpoints

**Core Algorithms**:
1. **Text Preprocessing**: Cleaning, tokenization, stop word removal
2. **Skill Extraction**: Regex pattern matching for technical skills
3. **Experience Extraction**: Pattern matching for years of experience
4. **TF-IDF Vectorization**: Convert text to numerical features
5. **Cosine Similarity**: Measure text similarity (0-1 scale)
6. **Match Scoring**: Weighted combination of skill match and text similarity

### Frontend (React/Vite)

**Purpose**: User interface for recruiters and HR teams

**Key Technologies**:
- React 18 - UI library
- Vite - Build tool and dev server
- Tailwind CSS - Utility-first CSS
- React Router - Client-side routing
- Axios - HTTP client
- Recharts - Data visualization

**Component Hierarchy**:
```
App.jsx
├── AuthProvider (Context)
└── Router
    ├── Public Routes
    │   ├── Login
    │   └── Register
    └── Protected Routes
        └── Layout
            ├── Dashboard
            ├── ResumeUpload
            ├── ResumeList
            ├── JobList
            └── Analytics
```

## 🔄 Data Flow

### Resume Upload Flow
```
1. User uploads file (Frontend)
   ↓
2. File sent to Backend API
   ↓
3. Backend extracts text (PDF-Parse/Mammoth)
   ↓
4. Text sent to ML Service
   ↓
5. ML Service parses resume (skills, experience, education)
   ↓
6. Parsed data returned to Backend
   ↓
7. Resume saved to MongoDB
   ↓
8. Success response to Frontend
   ↓
9. UI updated with new resume
```

### Job Matching Flow
```
1. User clicks "Match All Resumes"
   ↓
2. Backend retrieves all active resumes
   ↓
3. For each resume:
   - Send resume text + job description to ML Service
   - ML Service calculates match score
   - Backend saves match score to resume
   ↓
4. Backend sorts candidates by score
   ↓
5. Ranked list returned to Frontend
   ↓
6. UI displays candidates sorted by match score
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (recruiter|admin|hr),
  company: String,
  department: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Resumes Collection
```javascript
{
  _id: ObjectId,
  candidateName: String,
  email: String,
  phone: String,
  fileUrl: String,
  fileName: String,
  fileType: String (pdf|docx),
  extractedText: String,
  skills: [String],
  experience: Number,
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  jobApplications: [{
    jobId: ObjectId (ref: Job),
    matchScore: Number,
    status: String,
    appliedDate: Date,
    notes: String
  }],
  uploadedBy: ObjectId (ref: User),
  status: String (active|archived|deleted),
  createdAt: Date,
  updatedAt: Date
}
```

### Jobs Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  department: String,
  location: String,
  employmentType: String,
  experienceLevel: String,
  requiredSkills: [{
    skill: String,
    importance: String (required|preferred|nice-to-have),
    weight: Number (1-10)
  }],
  minExperience: Number,
  maxExperience: Number,
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  status: String (draft|active|paused|closed),
  postedBy: ObjectId (ref: User),
  applicantsCount: Number,
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication Flow

```
1. User submits login credentials
   ↓
2. Backend verifies credentials
   ↓
3. Backend generates JWT token
   ↓
4. Token sent to Frontend
   ↓
5. Frontend stores token in localStorage
   ↓
6. Frontend includes token in all subsequent requests
   ↓
7. Backend middleware verifies token
   ↓
8. Request proceeds if valid, rejected if invalid
```

## 📊 Matching Algorithm

**Formula**: 
```
Final Score = (Skill Match × 0.6) + (Text Similarity × 0.4)
```

**Skill Match Calculation**:
```python
matched_skills = candidate_skills ∩ required_skills
skill_score = (matched_skills / required_skills) × 100
```

**Text Similarity Calculation**:
```python
# 1. Vectorize texts using TF-IDF
resume_vector = TfidfVectorizer(resume_text)
job_vector = TfidfVectorizer(job_description)

# 2. Calculate cosine similarity
similarity = cosine_similarity(resume_vector, job_vector)

# 3. Convert to percentage
text_score = similarity × 100
```

## 🎨 UI/UX Design

### Color Scheme
- Primary: Indigo (#4F46E5)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Background: Gray (#F9FAFB)

### Key Features
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Drag-and-drop file upload
- Real-time progress indicators
- Interactive charts and graphs
- Toast notifications
- Sidebar navigation
- Protected routes

## 🔧 Configuration Files

### Backend
- `.env`: Environment variables
- `package.json`: Dependencies and scripts
- `.gitignore`: Excluded files

### ML Service
- `requirements.txt`: Python dependencies
- `.gitignore`: Excluded files

### Frontend
- `vite.config.js`: Vite build configuration
- `tailwind.config.js`: Tailwind CSS customization
- `postcss.config.js`: PostCSS plugins
- `package.json`: Dependencies and scripts
- `.gitignore`: Excluded files

## 📦 Dependencies Overview

### Backend Dependencies
```json
{
  "express": "Web framework",
  "mongoose": "MongoDB ODM",
  "jsonwebtoken": "JWT authentication",
  "bcryptjs": "Password hashing",
  "multer": "File upload handling",
  "pdf-parse": "PDF text extraction",
  "mammoth": "DOCX text extraction",
  "axios": "HTTP client",
  "cors": "Cross-origin requests",
  "helmet": "Security headers",
  "express-rate-limit": "Rate limiting"
}
```

### ML Service Dependencies
```
fastapi: Web framework
uvicorn: ASGI server
scikit-learn: ML algorithms
nltk: NLP operations
numpy: Numerical operations
pandas: Data manipulation
```

### Frontend Dependencies
```json
{
  "react": "UI library",
  "react-router-dom": "Routing",
  "axios": "HTTP client",
  "recharts": "Charts",
  "react-dropzone": "File upload",
  "react-hot-toast": "Notifications",
  "tailwindcss": "CSS framework"
}
```

## 🚀 Build & Deployment

### Development
```bash
# Backend
npm run dev

# ML Service
python main.py

# Frontend
npm run dev
```

### Production Build
```bash
# Backend
npm start

# ML Service
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend
npm run build
```

## 📈 Scalability Considerations

### Current Limitations
- Single backend instance
- File storage on server
- No caching layer
- Sequential resume processing

### Scaling Solutions
- **Load Balancing**: Nginx, AWS ELB
- **File Storage**: AWS S3, Google Cloud Storage
- **Caching**: Redis for frequently accessed data
- **Database**: MongoDB sharding, read replicas
- **Queue System**: Bull, RabbitMQ for async processing
- **Microservices**: Separate services for different functions

---

This structure is designed for:
- ✅ Easy maintenance and updates
- ✅ Clear separation of concerns
- ✅ Scalable architecture
- ✅ Professional development practices
- ✅ Corporate deployment readiness
