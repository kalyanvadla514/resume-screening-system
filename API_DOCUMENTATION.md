# API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "recruiter",
  "company": "Tech Corp",
  "department": "HR"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f5a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "recruiter"
  }
}
```

### Login
**POST** `/auth/login`

Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f5a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "recruiter"
  }
}
```

### Get Current User
**GET** `/auth/me`

Get currently authenticated user details.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f5a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "recruiter",
    "company": "Tech Corp"
  }
}
```

---

## Resume Endpoints

### Upload Resume
**POST** `/resumes/upload`

Upload and parse a resume file.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `resume` (file): PDF or DOCX file
- `candidateName` (string): Candidate's full name
- `email` (string): Candidate's email
- `phone` (string, optional): Phone number

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Resume uploaded and parsed successfully",
  "resume": {
    "id": "60d5ec49f1b2c72b8c8e4f5b",
    "candidateName": "Jane Smith",
    "email": "jane@example.com",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": 3
  }
}
```

### Get All Resumes
**GET** `/resumes`

Get list of all resumes with optional filters.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `search` (string): Search by name, email, or skills
- `skills` (string): Filter by skills (comma-separated)
- `minExperience` (number): Minimum years of experience
- `maxExperience` (number): Maximum years of experience
- `status` (string): Filter by status (active, archived, deleted)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Example:** `/resumes?search=developer&minExperience=2&page=1&limit=10`

**Response:** `200 OK`
```json
{
  "success": true,
  "resumes": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f5b",
      "candidateName": "Jane Smith",
      "email": "jane@example.com",
      "skills": ["JavaScript", "React", "Node.js"],
      "experience": 3,
      "createdAt": "2024-02-01T10:30:00.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 48
}
```

### Get Single Resume
**GET** `/resumes/:id`

Get detailed information about a specific resume.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "resume": {
    "_id": "60d5ec49f1b2c72b8c8e4f5b",
    "candidateName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1-555-123-4567",
    "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "experience": 3,
    "education": [
      {
        "degree": "B.TECH",
        "institution": "Not specified",
        "year": "Not specified"
      }
    ],
    "jobApplications": [
      {
        "jobId": {
          "_id": "60d5ec49f1b2c72b8c8e4f5c",
          "title": "Senior Frontend Developer"
        },
        "matchScore": 85,
        "status": "pending",
        "appliedDate": "2024-02-10T14:20:00.000Z"
      }
    ],
    "extractedText": "...",
    "createdAt": "2024-02-01T10:30:00.000Z"
  }
}
```

### Match Resume with Job
**POST** `/resumes/:id/match/:jobId`

Calculate match score between a resume and job.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Resume matched with job successfully",
  "matchScore": 85.5,
  "recommendation": "Highly Recommended"
}
```

---

## Job Endpoints

### Create Job
**POST** `/jobs`

Create a new job posting.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "description": "We are looking for an experienced full stack developer...",
  "department": "Engineering",
  "location": "San Francisco, CA",
  "employmentType": "full-time",
  "experienceLevel": "senior",
  "requiredSkills": [
    {
      "skill": "JavaScript",
      "importance": "required",
      "weight": 10
    },
    {
      "skill": "React",
      "importance": "required",
      "weight": 9
    },
    {
      "skill": "Node.js",
      "importance": "preferred",
      "weight": 8
    }
  ],
  "minExperience": 3,
  "maxExperience": 8,
  "salary": {
    "min": 100000,
    "max": 150000,
    "currency": "USD"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Job created successfully",
  "job": {
    "_id": "60d5ec49f1b2c72b8c8e4f5c",
    "title": "Senior Full Stack Developer",
    "department": "Engineering",
    "status": "active",
    "applicantsCount": 0
  }
}
```

### Get All Jobs
**GET** `/jobs`

Get list of all job postings.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `search` (string): Search by title or description
- `department` (string): Filter by department
- `employmentType` (string): Filter by employment type
- `experienceLevel` (string): Filter by experience level
- `status` (string): Filter by status (default: active)
- `page` (number): Page number
- `limit` (number): Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f5c",
      "title": "Senior Full Stack Developer",
      "department": "Engineering",
      "location": "San Francisco, CA",
      "applicantsCount": 12,
      "createdAt": "2024-02-01T09:00:00.000Z"
    }
  ],
  "totalPages": 3,
  "currentPage": 1,
  "total": 25
}
```

### Get Job Candidates
**GET** `/jobs/:id/candidates`

Get ranked list of candidates for a specific job.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "jobTitle": "Senior Full Stack Developer",
  "totalCandidates": 15,
  "candidates": [
    {
      "resumeId": "60d5ec49f1b2c72b8c8e4f5b",
      "candidateName": "Jane Smith",
      "email": "jane@example.com",
      "skills": ["JavaScript", "React", "Node.js"],
      "experience": 5,
      "matchScore": 92,
      "status": "pending",
      "appliedDate": "2024-02-10T14:20:00.000Z"
    }
  ]
}
```

### Batch Match All Resumes
**POST** `/jobs/:id/match-all`

Match all active resumes with a specific job.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Batch matching completed",
  "matched": 45,
  "failed": 2,
  "total": 47
}
```

---

## Analytics Endpoints

### Dashboard Analytics
**GET** `/analytics/dashboard`

Get comprehensive dashboard statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalResumes": 150,
      "totalJobs": 25,
      "totalApplications": 320,
      "avgMatchScore": 68
    },
    "resumesByStatus": [
      { "_id": "pending", "count": 180 },
      { "_id": "shortlisted", "count": 85 },
      { "_id": "rejected", "count": 55 }
    ],
    "topSkills": [
      { "_id": "JavaScript", "count": 95 },
      { "_id": "Python", "count": 72 }
    ],
    "topJobs": [
      {
        "_id": "60d5ec49f1b2c72b8c8e4f5c",
        "title": "Senior Developer",
        "applicantsCount": 45
      }
    ]
  }
}
```

---

## ML Service Endpoints

Base URL: `http://localhost:8000`

### Parse Resume
**POST** `/api/parse-resume`

Extract information from resume text.

**Request Body:**
```json
{
  "text": "John Doe\nSoftware Engineer with 5 years experience..."
}
```

**Response:** `200 OK`
```json
{
  "skills": ["Python", "JavaScript", "React"],
  "experience": 5,
  "education": [
    {
      "degree": "BACHELOR",
      "institution": "Not specified",
      "year": "Not specified"
    }
  ],
  "certifications": ["AWS Certified"],
  "email": "john@example.com",
  "phone": "+1-555-123-4567"
}
```

### Match Resume with Job
**POST** `/api/match`

Calculate match score between resume and job.

**Request Body:**
```json
{
  "resumeText": "Experienced software engineer...",
  "jobDescription": "We are looking for a senior developer...",
  "requiredSkills": ["JavaScript", "React", "Node.js"],
  "candidateSkills": ["JavaScript", "React", "Python"]
}
```

**Response:** `200 OK`
```json
{
  "score": 75.5,
  "matchedSkills": ["JavaScript", "React"],
  "missingSkills": ["Node.js"],
  "analysis": "Good match. Candidate has most required skills."
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details..."
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Total allowed requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "totalPages": 10,
  "currentPage": 1,
  "total": 95
}
```

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store JWT tokens securely** (httpOnly cookies recommended)
3. **Implement token refresh** for better UX
4. **Handle errors gracefully** on client side
5. **Validate input** before sending requests
6. **Use appropriate HTTP methods** (GET, POST, PUT, DELETE)
7. **Include proper headers** (Content-Type, Authorization)
8. **Log API responses** for debugging

---

For more information, contact the development team or refer to the main README.md
