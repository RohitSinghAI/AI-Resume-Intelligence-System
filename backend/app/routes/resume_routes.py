import os
import shutil
import json
from uuid import uuid4

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from ..database.database import get_db
from ..database.models import Resume, JobMatch

from ..services.pdf_parser import extract_text_from_pdf
from ..services.resume_parser import parse_resume

from ..services.ai_analyzer import (
    analyze_resume_with_ai,
    analyze_resume_intelligence
)

from ..utils.security import get_current_admin


router = APIRouter(
    prefix="/api/resumes",
    tags=["Resumes"]
)


UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB per resume
MAX_BULK_FILES = 20


# ==================================================
# UPLOAD RESUME
# ==================================================

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):

    # ==================================================
    # 1. CHECK PDF
    # ==================================================

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # ==================================================
    # 2. SAVE PDF
    # ==================================================

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    # ==================================================
    # 3. EXTRACT TEXT
    # ==================================================

    resume_text = extract_text_from_pdf(
        file_path
    )

    if not resume_text:
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF"
        )

    # ==================================================
    # 4. BASIC PARSER
    # ==================================================

    basic_data = parse_resume(
        resume_text
    )

    # ==================================================
    # 5. GEMINI RESUME PARSER
    # ==================================================

    try:

        ai_data = analyze_resume_with_ai(
            resume_text
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}"
        )

    # ==================================================
    # 6. GEMINI RESUME INTELLIGENCE
    # ==================================================

    try:

        ai_analysis = analyze_resume_intelligence(
            resume_text
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "AI intelligence analysis failed: "
                f"{str(e)}"
            )
        )

    # ==================================================
    # 7. SAVE EVERYTHING INTO SQLITE
    # ==================================================

    resume = Resume(

        # ==================================================
        # ADMIN OWNERSHIP
        # ==================================================

        admin_id=int(current_admin["sub"]),

        # ==================================================
        # PERSONAL INFORMATION
        # ==================================================

        name=(
            ai_data.get("name")
            or basic_data.get("name")
        ),

        email=(
            ai_data.get("email")
            or basic_data.get("email")
        ),

        phone=(
            ai_data.get("phone")
            or basic_data.get("phone")
        ),

        # ==================================================
        # RESUME INFORMATION
        # ==================================================

        education=json.dumps(
            ai_data.get("education")
            or basic_data.get("education")
            or []
        ),

        skills=json.dumps(
            ai_data.get("skills")
            or basic_data.get("skills")
            or []
        ),

        experience=json.dumps(
            ai_data.get("experience")
            or basic_data.get("experience")
            or []
        ),

        projects=json.dumps(
            ai_data.get("projects")
            or basic_data.get("projects")
            or []
        ),

        certifications=json.dumps(
            ai_data.get("certifications")
            or []
        ),

        # ==================================================
        # AI RESUME INTELLIGENCE
        # ==================================================

        resume_score=ai_analysis.get(
            "resume_score"
        ),

        ai_summary=ai_analysis.get(
            "summary"
        ),

        ai_strengths=json.dumps(
            ai_analysis.get(
                "strengths",
                []
            )
        ),

        ai_weaknesses=json.dumps(
            ai_analysis.get(
                "weaknesses",
                []
            )
        ),

        ai_missing_skills=json.dumps(
            ai_analysis.get(
                "missing_skills",
                []
            )
        ),

        ai_suggestions=json.dumps(
            ai_analysis.get(
                "suggestions",
                []
            )
        ),

        # ==================================================
        # ORIGINAL RESUME
        # ==================================================

        resume_text=resume_text,

        file_name=file.filename,

        file_path=file_path
    )

    # ==================================================
    # 8. SAVE TO DATABASE
    # ==================================================

    db.add(resume)

    db.commit()

    db.refresh(resume)

    # ==================================================
    # 9. RESPONSE
    # ==================================================

    return {

        "message": (
            "Resume uploaded and analyzed successfully"
        ),

        "resume_id": resume.id,

        "admin_id": resume.admin_id,

        "parsed_data": ai_data,

        "ai_analysis": ai_analysis
    }


# ==================================================
# UPLOAD MULTIPLE RESUMES
# IMPORTANT:
# Processes files sequentially to avoid firing many
# AI requests at once.
# ==================================================

@router.post("/upload-multiple")
async def upload_multiple_resumes(
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    if not files:
        raise HTTPException(
            status_code=400,
            detail="At least one PDF resume is required"
        )

    if len(files) > MAX_BULK_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_BULK_FILES} resumes can be uploaded at once"
        )

    admin_id = int(current_admin["sub"])

    successful = []
    failed = []

    # Process one resume at a time. This keeps AI requests controlled.
    for file in files:
        original_name = file.filename or "resume.pdf"
        saved_path = None

        try:
            # ------------------------------------------
            # 1. CHECK PDF
            # ------------------------------------------

            if not original_name.lower().endswith(".pdf"):
                raise ValueError("Only PDF files are allowed")

            # ------------------------------------------
            # 2. READ + CHECK SIZE
            # ------------------------------------------

            content = await file.read()

            if not content:
                raise ValueError("The uploaded file is empty")

            if len(content) > MAX_FILE_SIZE:
                raise ValueError("File size must be less than 10 MB")

            # ------------------------------------------
            # 3. SAVE WITH UNIQUE NAME
            # ------------------------------------------

            safe_name = os.path.basename(original_name)
            unique_name = f"{uuid4().hex}_{safe_name}"

            saved_path = os.path.join(
                UPLOAD_DIR,
                unique_name
            )

            with open(saved_path, "wb") as buffer:
                buffer.write(content)

            # ------------------------------------------
            # 4. EXTRACT TEXT
            # ------------------------------------------

            resume_text = extract_text_from_pdf(
                saved_path
            )

            if not resume_text:
                raise ValueError(
                    "Could not extract text from PDF"
                )

            # ------------------------------------------
            # 5. BASIC PARSER
            # ------------------------------------------

            basic_data = parse_resume(
                resume_text
            )

            # ------------------------------------------
            # 6. AI RESUME PARSER
            # ------------------------------------------

            ai_data = analyze_resume_with_ai(
                resume_text
            )

            # ------------------------------------------
            # 7. AI RESUME INTELLIGENCE
            # ------------------------------------------

            ai_analysis = analyze_resume_intelligence(
                resume_text
            )

            # ------------------------------------------
            # 8. CREATE DATABASE RECORD
            # ------------------------------------------

            resume = Resume(
                admin_id=admin_id,

                name=(
                    ai_data.get("name")
                    or basic_data.get("name")
                ),

                email=(
                    ai_data.get("email")
                    or basic_data.get("email")
                ),

                phone=(
                    ai_data.get("phone")
                    or basic_data.get("phone")
                ),

                education=json.dumps(
                    ai_data.get("education")
                    or basic_data.get("education")
                    or []
                ),

                skills=json.dumps(
                    ai_data.get("skills")
                    or basic_data.get("skills")
                    or []
                ),

                experience=json.dumps(
                    ai_data.get("experience")
                    or basic_data.get("experience")
                    or []
                ),

                projects=json.dumps(
                    ai_data.get("projects")
                    or basic_data.get("projects")
                    or []
                ),

                certifications=json.dumps(
                    ai_data.get("certifications")
                    or []
                ),

                resume_score=ai_analysis.get(
                    "resume_score"
                ),

                ai_summary=ai_analysis.get(
                    "summary"
                ),

                ai_strengths=json.dumps(
                    ai_analysis.get(
                        "strengths",
                        []
                    )
                ),

                ai_weaknesses=json.dumps(
                    ai_analysis.get(
                        "weaknesses",
                        []
                    )
                ),

                ai_missing_skills=json.dumps(
                    ai_analysis.get(
                        "missing_skills",
                        []
                    )
                ),

                ai_suggestions=json.dumps(
                    ai_analysis.get(
                        "suggestions",
                        []
                    )
                ),

                resume_text=resume_text,

                file_name=original_name,

                file_path=saved_path
            )

            db.add(resume)
            db.commit()
            db.refresh(resume)

            successful.append({
                "file_name": original_name,
                "status": "success",
                "resume_id": resume.id,
                "candidate_name": resume.name
            })

        except Exception as e:
            db.rollback()

            # Remove only the file created for this failed upload.
            if saved_path and os.path.exists(saved_path):
                try:
                    os.remove(saved_path)
                except OSError:
                    pass

            failed.append({
                "file_name": original_name,
                "status": "failed",
                "error": str(e)
            })

    return {
        "message": "Bulk resume processing completed",
        "total_files": len(files),
        "successful_uploads": len(successful),
        "failed_uploads": len(failed),
        "successful": successful,
        "failed": failed
    }


# ==================================================
# GET ALL RESUMES
# ==================================================

@router.get("/")
def get_resumes(
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):

    admin_id = int(current_admin["sub"])

    resumes = db.query(Resume).filter(
        Resume.admin_id == admin_id
    ).all()

    result = []

    for resume in resumes:

        result.append({

            "id": resume.id,

            "admin_id": resume.admin_id,

            "name": resume.name,

            "email": resume.email,

            "phone": resume.phone,

            # ==================================================
            # RESUME DATA
            # ==================================================

            "education": (
                json.loads(resume.education)
                if resume.education
                else []
            ),

            "skills": (
                json.loads(resume.skills)
                if resume.skills
                else []
            ),

            "experience": (
                json.loads(resume.experience)
                if resume.experience
                else []
            ),

            "projects": (
                json.loads(resume.projects)
                if resume.projects
                else []
            ),

            "certifications": (
                json.loads(resume.certifications)
                if resume.certifications
                else []
            ),

            # ==================================================
            # AI INTELLIGENCE
            # ==================================================

            "ai_analysis": {

                "resume_score": resume.resume_score,

                "summary": resume.ai_summary,

                "strengths": (
                    json.loads(resume.ai_strengths)
                    if resume.ai_strengths
                    else []
                ),

                "weaknesses": (
                    json.loads(resume.ai_weaknesses)
                    if resume.ai_weaknesses
                    else []
                ),

                "missing_skills": (
                    json.loads(
                        resume.ai_missing_skills
                    )
                    if resume.ai_missing_skills
                    else []
                ),

                "suggestions": (
                    json.loads(
                        resume.ai_suggestions
                    )
                    if resume.ai_suggestions
                    else []
                )
            },

            # ==================================================
            # FILE
            # ==================================================

            "file_name": resume.file_name,

            "file_path": resume.file_path,

            "created_at": resume.created_at
        })

    return result


# ==================================================
# GET SINGLE RESUME
# ==================================================

@router.get("/{resume_id}")
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):

    admin_id = int(current_admin["sub"])

    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.admin_id == admin_id
    ).first()

    if not resume:

        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    return {

        "id": resume.id,

        "admin_id": resume.admin_id,

        "name": resume.name,

        "email": resume.email,

        "phone": resume.phone,

        # ==================================================
        # RESUME DATA
        # ==================================================

        "education": (
            json.loads(resume.education)
            if resume.education
            else []
        ),

        "skills": (
            json.loads(resume.skills)
            if resume.skills
            else []
        ),

        "experience": (
            json.loads(resume.experience)
            if resume.experience
            else []
        ),

        "projects": (
            json.loads(resume.projects)
            if resume.projects
            else []
        ),

        "certifications": (
            json.loads(resume.certifications)
            if resume.certifications
            else []
        ),

        # ==================================================
        # AI INTELLIGENCE
        # ==================================================

        "ai_analysis": {

            "resume_score": resume.resume_score,

            "summary": resume.ai_summary,

            "strengths": (
                json.loads(resume.ai_strengths)
                if resume.ai_strengths
                else []
            ),

            "weaknesses": (
                json.loads(resume.ai_weaknesses)
                if resume.ai_weaknesses
                else []
            ),

            "missing_skills": (
                json.loads(
                    resume.ai_missing_skills
                )
                if resume.ai_missing_skills
                else []
            ),

            "suggestions": (
                json.loads(
                    resume.ai_suggestions
                )
                if resume.ai_suggestions
                else []
            )
        },

        # ==================================================
        # ORIGINAL RESUME
        # ==================================================

        "resume_text": resume.resume_text,

        "file_name": resume.file_name,

        "file_path": resume.file_path,

        "created_at": resume.created_at
    }


# ==================================================
# DELETE RESUME
# ==================================================

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):

    admin_id = int(current_admin["sub"])

    # ==================================================
    # FIND RESUME
    # ==================================================

    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.admin_id == admin_id
    ).first()

    if not resume:

        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    # ==================================================
    # DELETE RELATED JOB MATCHES
    # ==================================================

    db.query(JobMatch).filter(
        JobMatch.resume_id == resume_id
    ).delete(
        synchronize_session=False
    )

    # ==================================================
    # DELETE RESUME
    # ==================================================

    db.delete(resume)

    db.commit()

    return {

        "message": "Resume deleted successfully",

        "resume_id": resume_id
    }