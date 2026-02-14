from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

app = FastAPI(
    title="Resume Screening ML Service",
    description="AI-powered resume parsing and matching service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ParseResumeRequest(BaseModel):
    text: str

class MatchRequest(BaseModel):
    resumeText: str
    jobDescription: str
    requiredSkills: List[str]
    candidateSkills: List[str]

class ParsedResume(BaseModel):
    skills: List[str]
    experience: int
    education: List[dict]
    certifications: List[str]
    email: Optional[str] = None
    phone: Optional[str] = None

class MatchResponse(BaseModel):
    score: float
    matchedSkills: List[str]
    missingSkills: List[str]
    analysis: str

# Skill extraction patterns
SKILL_PATTERNS = {
    'programming': [
        'Python', 'Java', 'JavaScript', 'TypeScript', 'C\\+\\+', 'C#', 'Ruby', 
        'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'Scala', 'R', 'MATLAB'
    ],
    'web': [
        'React', 'Angular', 'Vue\\.js', 'Node\\.js', 'Express', 'Django', 
        'Flask', 'Spring', 'ASP\\.NET', 'Laravel', 'HTML5', 'CSS3', 'SASS', 
        'Bootstrap', 'Tailwind', 'jQuery', 'Next\\.js', 'Nuxt\\.js'
    ],
    'mobile': [
        'React Native', 'Flutter', 'Android', 'iOS', 'Xamarin', 'Ionic', 'SwiftUI'
    ],
    'database': [
        'MongoDB', 'MySQL', 'PostgreSQL', 'SQL Server', 'Oracle', 'Redis', 
        'Cassandra', 'DynamoDB', 'Firebase', 'Elasticsearch', 'Neo4j'
    ],
    'cloud': [
        'AWS', 'Azure', 'Google Cloud', 'GCP', 'Heroku', 'DigitalOcean', 
        'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CI/CD', 'DevOps'
    ],
    'data_science': [
        'Machine Learning', 'Deep Learning', 'Neural Networks', 'NLP', 
        'Computer Vision', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn',
        'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Data Analysis', 
        'Data Visualization', 'Big Data', 'Hadoop', 'Spark'
    ],
    'other': [
        'Git', 'GitHub', 'GitLab', 'Agile', 'Scrum', 'JIRA', 'REST API', 
        'GraphQL', 'Microservices', 'Linux', 'Unix', 'Testing', 'Unit Testing',
        'Integration Testing', 'Jest', 'Mocha', 'Selenium', 'Cypress'
    ]
}

def preprocess_text(text: str) -> str:
    """Clean and preprocess text"""
    # Convert to lowercase
    text = text.lower()
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-z0-9\s\.\+#]', ' ', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_email(text: str) -> Optional[str]:
    """Extract email from text"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    matches = re.findall(email_pattern, text)
    return matches[0] if matches else None

def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text"""
    phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    matches = re.findall(phone_pattern, text)
    return matches[0] if matches else None

def extract_skills(text: str) -> List[str]:
    """Extract skills from resume text"""
    skills_found = []
    text_lower = text.lower()
    
    for category, skills in SKILL_PATTERNS.items():
        for skill in skills:
            # Create regex pattern
            pattern = r'\b' + skill.lower().replace('.', r'\.') + r'\b'
            if re.search(pattern, text_lower):
                # Add the original case version
                skills_found.append(skill.replace('\\', ''))
    
    return list(set(skills_found))

def extract_experience(text: str) -> int:
    """Extract years of experience from text"""
    # Pattern for "X years of experience"
    patterns = [
        r'(\d+)\s*(?:\+)?\s*(?:years?|yrs?)\s+(?:of\s+)?experience',
        r'experience\s*(?:of\s+)?(\d+)\s*(?:\+)?\s*(?:years?|yrs?)',
        r'(\d+)\s*(?:\+)?\s*(?:years?|yrs?)\s+in'
    ]
    
    text_lower = text.lower()
    max_years = 0
    
    for pattern in patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            years = [int(m) for m in matches]
            max_years = max(max_years, max(years))
    
    return max_years

def extract_education(text: str) -> List[dict]:
    """Extract education information"""
    education = []
    degrees = [
        'bachelor', 'master', 'phd', 'doctorate', 'diploma', 
        'associate', 'mba', 'b\\.tech', 'm\\.tech', 'b\\.sc', 
        'm\\.sc', 'b\\.e', 'm\\.e', 'b\\.a', 'm\\.a'
    ]
    
    text_lower = text.lower()
    
    for degree in degrees:
        if re.search(rf'\b{degree}\b', text_lower):
            education.append({
                'degree': degree.upper(),
                'institution': 'Not specified',
                'year': 'Not specified'
            })
    
    return education

def extract_certifications(text: str) -> List[str]:
    """Extract certifications"""
    cert_keywords = [
        'aws certified', 'azure certified', 'google cloud certified',
        'pmp', 'cissp', 'ceh', 'comptia', 'scrum master', 'prince2',
        'itil', 'six sigma', 'certified kubernetes'
    ]
    
    certifications = []
    text_lower = text.lower()
    
    for cert in cert_keywords:
        if cert in text_lower:
            certifications.append(cert.title())
    
    return certifications

def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate cosine similarity between two texts"""
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(similarity)
    except:
        return 0.0

def calculate_skill_match(candidate_skills: List[str], required_skills: List[str]) -> tuple:
    """Calculate skill matching score"""
    if not required_skills:
        return 0.0, [], required_skills
    
    candidate_lower = [s.lower() for s in candidate_skills]
    required_lower = [s.lower() for s in required_skills]
    
    matched = []
    missing = []
    
    for req_skill in required_skills:
        if req_skill.lower() in candidate_lower:
            matched.append(req_skill)
        else:
            missing.append(req_skill)
    
    match_percentage = (len(matched) / len(required_skills)) * 100
    return match_percentage, matched, missing

@app.get("/")
async def root():
    return {
        "message": "Resume Screening ML Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ml-service"
    }

@app.post("/api/parse-resume", response_model=ParsedResume)
async def parse_resume(request: ParseResumeRequest):
    """Parse resume and extract information"""
    try:
        text = request.text
        
        # Extract information
        skills = extract_skills(text)
        experience = extract_experience(text)
        education = extract_education(text)
        certifications = extract_certifications(text)
        email = extract_email(text)
        phone = extract_phone(text)
        
        return ParsedResume(
            skills=skills,
            experience=experience,
            education=education,
            certifications=certifications,
            email=email,
            phone=phone
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

@app.post("/api/match", response_model=MatchResponse)
async def match_resume_with_job(request: MatchRequest):
    """Match resume with job description and calculate score"""
    try:
        # Calculate text similarity
        text_similarity = calculate_similarity(
            preprocess_text(request.resumeText),
            preprocess_text(request.jobDescription)
        )
        
        # Calculate skill match
        skill_match_percentage, matched_skills, missing_skills = calculate_skill_match(
            request.candidateSkills,
            request.requiredSkills
        )
        
        # Combined score (60% skill match, 40% text similarity)
        final_score = (skill_match_percentage * 0.6) + (text_similarity * 100 * 0.4)
        final_score = min(100, max(0, final_score))  # Clamp between 0-100
        
        # Generate analysis
        if final_score >= 80:
            analysis = "Excellent match! Strong alignment with job requirements."
        elif final_score >= 60:
            analysis = "Good match. Candidate has most required skills."
        elif final_score >= 40:
            analysis = "Moderate match. Some skill gaps identified."
        else:
            analysis = "Low match. Significant skill gaps present."
        
        return MatchResponse(
            score=round(final_score, 2),
            matchedSkills=matched_skills,
            missingSkills=missing_skills,
            analysis=analysis
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error matching resume: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
