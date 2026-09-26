# AI Resume Intelligence System

An AI-powered resume intelligence and candidate matching platform built for recruiters and hiring teams.

The system allows recruiters to upload single or multiple resumes, extract structured candidate information, analyze resumes with AI, create job descriptions, match candidates with jobs, rank candidates through bulk matching, save match history, and chat with resumes using a RAG-based pipeline.

---

## 🚀 Project Overview

The AI Resume Intelligence System combines:

- Resume PDF processing
- Resume parsing and structured data extraction
- AI-powered resume analysis
- Resume scoring
- Job Description processing
- Exact skill matching
- Semantic skill matching
- Experience matching
- Final candidate-job match scoring
- Bulk resume upload
- Bulk job-to-resume matching
- Candidate ranking
- Match history
- AI Resume Chat using RAG
- Admin authentication and ownership-based access
- Recruiter dashboard and candidate insights

---

## 🎯 Main Use Case

A recruiter can:

1. Register/Login
2. Upload one or multiple candidate resumes
3. Let the system extract and analyze each resume
4. Create a job description
5. Match a resume with a job
6. Match one job against all available resumes
7. Compare and rank candidates
8. Review matched and missing skills
9. View AI-generated candidate insights
10. Chat with a resume using AI
11. Save and review match history

---

# 🏗️ System Architecture

```text
                         React UI
                            ↓
                    Authentication
                            ↓
                         FastAPI
                            ↓
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
   Resume APIs          Job APIs           Chat APIs
        ↓                   ↓                   ↓
  Resume Upload        JD Processor      Resume Chat
        ↓                   ↓                   ↓
   File Storage         JD Parsing         RAG Pipeline
        ↓                   ↓                   ↓
  PDF Extraction       Required Skills     Chunking
        ↓                   ↓                   ↓
  Resume Parser        Requirements        Embeddings
        ↓                   ↓                   ↓
     NLP Engine              │              FAISS
        ↓                     │                ↓
   Skill Extraction            │             Retriever
        ↓                     │                ↓
   Structured Data             │              LLM
        └──────────────┬──────┘                ↓
                       ↓                  Chat Response
                  Embeddings
                       ↓
              ┌────────┴────────┐
              ↓                 ↓
       Exact Matching      Semantic Matching
              ↓                 ↓
              └────────┬────────┘
                       ↓
               Experience Matching
                       ↓
                 Final Match Score
                       ↓
                Analysis Engine
                       ↓
                 LLM / AI Analysis
                       ↓
              Candidate Insights
                       ↓
                ┌──────┴──────┐
                ↓             ↓
          Database         Match History
                ↓             ↓
                └──────┬──────┘
                       ↓
                React Dashboard
```

---

# 🔄 Complete Workflow

## 1. Authentication

```text
Register / Login
       ↓
JWT Authentication
       ↓
Protected Dashboard
```

Each admin's resumes, jobs and matching data are associated with that admin.

---

## 2. Resume Upload

Single or multiple PDF resumes can be uploaded.

```text
PDF Resume
    ↓
Upload API
    ↓
PDF Text Extraction
    ↓
Resume Parsing
    ↓
AI Analysis
    ↓
Resume Score
    ↓
Database
```

For multiple resumes:

```text
Multiple PDFs
     ↓
Controlled Processing
     ↓
Resume 1 → Process → Save
Resume 2 → Process → Save
Resume 3 → Process → Save
...
```

---

## 3. Resume Processing

The resume processing pipeline extracts:

- Name
- Email
- Phone
- Education
- Skills
- Experience
- Projects
- Certifications
- Resume text
- AI summary
- Strengths
- Weaknesses
- Missing skills
- Suggestions
- Resume score

---

## 4. Job Processing

Recruiters can create jobs containing:

- Job title
- Company
- Job description
- Required skills
- Required experience

```text
Job Description
      ↓
JD Processor
      ↓
Requirements
      ↓
Required Skills + Experience
```

---

# 🤖 AI Resume Analysis

The AI analysis layer evaluates the resume and generates structured insights.

```text
Resume Text
    ↓
AI Analyzer
    ↓
Structured Analysis
    ↓
Summary
Strengths
Weaknesses
Missing Skills
Suggestions
Resume Score
```

The numeric resume score is stored with the resume and displayed throughout the recruiter dashboard.

---

# 🎯 Job Matching Engine

The system supports both individual and bulk matching.

## Individual Matching

```text
1 Job + 1 Resume
       ↓
Exact Skill Match
       ↓
Semantic Skill Match
       ↓
Experience Match
       ↓
Final Match Score
       ↓
AI Match Analysis
```

## Bulk Matching

```text
1 Job
  ↓
All Admin Resumes
  ↓
Matching Engine
  ↓
Candidate Scores
  ↓
Ranked Results
```

Example:

```text
Rohit Singh      91.4%
Priya Sharma     87.8%
Amit Kumar       82.3%
Neha Verma       76.5%
```

---

# 🧠 Matching Components

### Exact Skill Matching

Checks direct overlap between required job skills and resume skills.

### Semantic Skill Matching

Uses embeddings/semantic similarity to identify related skill concepts even when wording is different.

### Experience Matching

Compares resume experience against the job's experience requirement.

### Final Match Score

Combines the matching signals into a final candidate-job compatibility score.

---

# 💬 AI Resume Chat

The system includes an AI chat experience for individual resumes.

```text
Resume Text
     ↓
Chunking
     ↓
Embeddings
     ↓
FAISS Vector Store
     ↓
Retriever
     ↓
Relevant Resume Context
     ↓
Groq LLM
     ↓
Answer
```

A recruiter can ask questions such as:

- What are this candidate's strongest skills?
- Does the candidate have Python experience?
- What projects are mentioned?
- What skills are missing?
- Explain the candidate's experience.
- Is this resume relevant to a particular skill requirement?

---

# 🗄️ Database

The application uses SQLite with SQLAlchemy.

Main entities include:

```text
Admin
Resume
Job
JobMatch
Chat
Message
```

### Resume

Stores:

- Candidate information
- Education
- Skills
- Experience
- Projects
- Certifications
- Resume text
- AI analysis
- Resume score
- Uploaded file information

### Job

Stores:

- Job title
- Company
- Description
- Required skills
- Required experience

### JobMatch

Stores:

- Resume ID
- Job ID
- Final match score
- Exact skill score
- Semantic skill score
- Experience score
- Matched skills
- Missing skills
- AI analysis
- Created time

---

# 🔐 Authentication & Security

The system uses JWT-based authentication.

```text
Login
  ↓
JWT Token
  ↓
Authorization Header
  ↓
FastAPI Protected Routes
```

Admin ownership is enforced for:

- Resumes
- Jobs
- Match history
- Chat data

---

# 🖥️ Frontend

Built with:

- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React

### Main Pages

```text
/
├── Home
├── Login
├── Register
├── Dashboard
│
├── Resumes
│   ├── Resume List
│   ├── Upload Resume
│   ├── Resume Details
│   └── Resume Analysis
│
├── Jobs
│   ├── Job List
│   ├── Create Job
│   ├── Job Details
│   └── Edit Job
│
├── Candidates
│   └── Candidate Details
│
├── Matching
│   ├── Match Results
│   ├── Match Details
│   └── Match History
│
├── Resume Chat
│
└── Settings
```

---

# ⚙️ Backend

Built with:

- Python
- FastAPI
- SQLAlchemy
- SQLite
- JWT
- bcrypt
- PDF processing
- Groq LLM
- LangChain
- FAISS
- Sentence Transformers

---

# 🧩 Project Structure

```text
AI-Resume-Intelligence-System/
│
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   ├── database.py
│   │   │   └── models.py
│   │   │
│   │   ├── routes/
│   │   │   ├── auth_routes.py
│   │   │   ├── resume_routes.py
│   │   │   ├── job_router.py
│   │   │   └── chat_routes.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth_schema.py
│   │   │   ├── job_schema.py
│   │   │   └── chat_schema.py
│   │   │
│   │   ├── services/
│   │   │   ├── pdf_parser.py
│   │   │   ├── resume_parser.py
│   │   │   ├── ai_analyzer.py
│   │   │   ├── final_matcher.py
│   │   │   └── rag_service.py
│   │   │
│   │   ├── utils/
│   │   │   └── security.py
│   │   │
│   │   └── main.py
│   │
│   ├── uploads/
│   ├── resume_intelligence.db
│   └── .env
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── context/
│       └── App.jsx
│
└── README.md
```

---

# 🔌 Important API Endpoints

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Resume

```text
POST   /api/resumes/upload
POST   /api/resumes/upload-multiple
GET    /api/resumes/
GET    /api/resumes/{resume_id}
DELETE /api/resumes/{resume_id}
```

## Jobs

```text
POST   /api/jobs/
GET    /api/jobs/
GET    /api/jobs/{job_id}
PUT    /api/jobs/{job_id}
DELETE /api/jobs/{job_id}
```

## Matching

```text
GET  /api/jobs/match/{job_id}/{resume_id}
POST /api/jobs/match-all/{job_id}
POST /api/jobs/match/save/{job_id}/{resume_id}
GET  /api/jobs/match/history/{resume_id}
GET  /api/jobs/match/count
```

## Resume Chat

```text
POST /api/chat/resume/{resume_id}
GET  /api/chat/chats
GET  /api/chat/chats/{chat_id}
```

---

# 🛠️ Installation

## Backend

Go to the backend directory:

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend

Go to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔐 Environment Variables

Create `.env` inside the backend.

Example:

```env
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

Never commit real API keys or secrets to GitHub.

---

# 📊 Dashboard

The recruiter dashboard provides:

- Total resumes
- Active jobs
- Total candidates
- Match count
- Average resume score
- Resume AI analysis coverage
- Job configuration coverage
- Latest resume
- Latest job
- Match history
- Quick actions
- Recent resumes
- Recent jobs
- Matching overview

---

# 📄 Multiple Resume Upload

The platform supports uploading multiple resumes in one batch.

Current flow:

```text
Select Multiple PDFs
       ↓
Validation
       ↓
Maximum 20 files
       ↓
Maximum 10 MB per file
       ↓
Upload Batch
       ↓
Sequential Server Processing
       ↓
AI Analysis
       ↓
Database
       ↓
Success / Failed Summary
```

This controlled processing approach avoids sending every resume request simultaneously.

---

# 📈 Candidate Ranking

After bulk matching:

```text
Job
 ↓
All Resumes
 ↓
Match Engine
 ↓
Final Scores
 ↓
Sorted Candidates
```

Recruiters can review candidates based on:

- Final match score
- Exact skill score
- Semantic skill score
- Experience score
- Matched skills
- Missing skills
- AI analysis

---

# 🧪 Example Workflow

```text
1. Login
      ↓
2. Upload 10 resumes
      ↓
3. AI analyzes resumes
      ↓
4. Create "Data Scientist" job
      ↓
5. Match all resumes
      ↓
6. Candidate ranking generated
      ↓
7. Open candidate profile
      ↓
8. Review match analysis
      ↓
9. Chat with candidate resume
      ↓
10. Save important matches
      ↓
11. Review Match History
```

---

# 🌟 Key Features

| Feature | Status |
|---|---|
| Admin Registration/Login | ✅ |
| JWT Authentication | ✅ |
| Resume PDF Upload | ✅ |
| Multiple Resume Upload | ✅ |
| Resume Text Extraction | ✅ |
| Resume Parsing | ✅ |
| AI Resume Analysis | ✅ |
| Resume Scoring | ✅ |
| Job Creation | ✅ |
| Job Editing | ✅ |
| Exact Skill Matching | ✅ |
| Semantic Matching | ✅ |
| Experience Matching | ✅ |
| Single Resume Matching | ✅ |
| Bulk Resume Matching | ✅ |
| Candidate Ranking | ✅ |
| Match History | ✅ |
| AI Resume Chat | ✅ |
| RAG Pipeline | ✅ |
| FAISS Retrieval | ✅ |
| Recruiter Dashboard | ✅ |
| Admin Ownership | ✅ |

---

# 🔮 Future Enhancements

Possible future improvements:

- Duplicate resume detection
- Background job queue
- Redis/Celery processing
- Progress tracking for large batches
- Recruiter candidate shortlist
- Bulk save of selected matches
- Email notifications
- Cloud file storage
- PostgreSQL production database
- Advanced analytics
- Resume comparison
- Job recommendation
- Interview question generation

---

# 👨‍💻 Technology Stack

### Frontend

```text
React
Vite
Tailwind CSS
React Router
Axios
Lucide React
```

### Backend

```text
Python
FastAPI
SQLAlchemy
SQLite
JWT
bcrypt
```

### AI / ML

```text
Groq LLM
LangChain
Sentence Transformers
Embeddings
FAISS
NLP
Semantic Similarity
```

---

# 🎓 Project Highlights

This project demonstrates practical implementation of:

- Full-stack development
- REST APIs
- Authentication
- Database design
- PDF processing
- NLP
- Embeddings
- Vector search
- RAG
- LLM integration
- Semantic matching
- Candidate ranking
- AI-powered recruitment workflows

---

# 📌 Project Goal

The goal of the AI Resume Intelligence System is to reduce manual resume screening effort by combining structured resume analysis, job matching, semantic search, LLM-based insights, and recruiter-friendly dashboards in one platform.

---

## 📜 License

This project is intended for learning, portfolio, and demonstration purposes.
