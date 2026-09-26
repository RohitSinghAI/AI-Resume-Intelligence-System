import os
import json
import re
from typing import Any

from dotenv import load_dotenv
from groq import Groq


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# GROQ CONFIGURATION
# =========================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY not found in .env"
    )


# Current Groq production model
MODEL = "openai/gpt-oss-120b"


# =========================================================
# GROQ CLIENT
# =========================================================

client = Groq(
    api_key=GROQ_API_KEY
)


# =========================================================
# HELPER FUNCTION
# =========================================================

def _call_groq(
    system_prompt: str,
    user_prompt: str,
    json_schema: dict[str, Any],
) -> dict[str, Any]:

    try:

        response = client.chat.completions.create(

            model=MODEL,

            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],

            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "resume_analysis",
                    "strict": True,
                    "schema": json_schema,
                },
            },

            temperature=0.1,

            max_completion_tokens=4000,
        )

        content = response.choices[0].message.content

        if not content:
            raise ValueError(
                "Groq returned empty response"
            )

        return json.loads(content)

    except Exception as e:

        print("=" * 70)
        print("GROQ API ERROR")
        print("=" * 70)
        print(str(e))
        print("=" * 70)

        raise


# =========================================================
# RESUME PARSER
# =========================================================

def analyze_resume_with_ai(
    resume_text: str
):

    system_prompt = """
You are an AI Resume Parser.

Your task is to extract structured information
from the provided resume.

Important rules:

1. Return ONLY valid JSON.
2. Do not return Markdown.
3. Do not return explanations.
4. Do not invent information.
5. If information is missing, use null or an empty array.
6. Preserve information exactly when possible.
7. Extract only information actually present in the resume.
"""

    user_prompt = f"""
Analyze the following resume.

Extract:

1. name
2. email
3. phone
4. education
5. skills
6. experience
7. projects
8. certifications

Education fields:

- degree
- field
- institution
- year

Experience fields:

- company
- role
- location
- duration
- responsibilities

Project fields:

- name
- technologies
- description

Resume:

{resume_text}
"""

    schema = {

        "type": "object",

        "additionalProperties": False,

        "properties": {

            "name": {
                "type": ["string", "null"]
            },

            "email": {
                "type": ["string", "null"]
            },

            "phone": {
                "type": ["string", "null"]
            },

            "education": {

                "type": "array",

                "items": {

                    "type": "object",

                    "additionalProperties": False,

                    "properties": {

                        "degree": {
                            "type": ["string", "null"]
                        },

                        "field": {
                            "type": ["string", "null"]
                        },

                        "institution": {
                            "type": ["string", "null"]
                        },

                        "year": {
                            "type": ["string", "null"]
                        },
                    },

                    "required": [
                        "degree",
                        "field",
                        "institution",
                        "year",
                    ],
                },
            },

            "skills": {

                "type": "array",

                "items": {
                    "type": "string"
                },
            },

            "experience": {

                "type": "array",

                "items": {

                    "type": "object",

                    "additionalProperties": False,

                    "properties": {

                        "company": {
                            "type": ["string", "null"]
                        },

                        "role": {
                            "type": ["string", "null"]
                        },

                        "location": {
                            "type": ["string", "null"]
                        },

                        "duration": {
                            "type": ["string", "null"]
                        },

                        "responsibilities": {

                            "type": "array",

                            "items": {
                                "type": "string"
                            },
                        },
                    },

                    "required": [
                        "company",
                        "role",
                        "location",
                        "duration",
                        "responsibilities",
                    ],
                },
            },

            "projects": {

                "type": "array",

                "items": {

                    "type": "object",

                    "additionalProperties": False,

                    "properties": {

                        "name": {
                            "type": ["string", "null"]
                        },

                        "technologies": {

                            "type": "array",

                            "items": {
                                "type": "string"
                            },
                        },

                        "description": {
                            "type": ["string", "null"]
                        },
                    },

                    "required": [
                        "name",
                        "technologies",
                        "description",
                    ],
                },
            },

            "certifications": {

                "type": "array",

                "items": {
                    "type": "string"
                },
            },
        },

        "required": [
            "name",
            "email",
            "phone",
            "education",
            "skills",
            "experience",
            "projects",
            "certifications",
        ],
    }

    return _call_groq(
        system_prompt,
        user_prompt,
        schema,
    )


# =========================================================
# DETERMINISTIC RESUME SCORE
# =========================================================

def _safe_list(value):
    if isinstance(value, list):
        return value
    if isinstance(value, tuple):
        return list(value)
    if value in (None, "", {}):
        return []
    return [value]


def _count_nonempty(values):
    count = 0
    for item in _safe_list(values):
        if isinstance(item, dict):
            if any(v not in (None, "", [], {}) for v in item.values()):
                count += 1
        elif str(item).strip():
            count += 1
    return count


def _safe_list(value):
    if isinstance(value, list):
        return value
    if isinstance(value, tuple):
        return list(value)
    if value in (None, "", {}):
        return []
    return [value]


def _call_resume_quality_score(
    resume_text: str,
    parsed_resume: dict[str, Any],
) -> dict[str, Any]:
    """Ask the LLM for evidence-based component scores.

    The application computes the final resume score from these components,
    so the model never controls the final 0-100 number directly.
    """

    system_prompt = """
You are an expert ATS resume evaluator.

Score the resume using evidence that actually appears in the resume.
Do not invent skills, experience, achievements, certifications, or education.
Do not use a single overall score. Score each component separately.

Important calibration rules:
- Use the full scoring ranges; do not default every resume to common scores such as 60, 68, 70, or 80.
- Different resumes should receive different component scores when their evidence differs.
- A fresher should NOT be treated as a bad candidate simply because they lack full-time employment.
  Relevant internships, substantial projects, practical training, and demonstrated work can earn credit.
- Reward concrete technical depth, relevant project detail, measurable outcomes, and clear evidence.
- Do not reward repeated keywords by themselves.
- Only give high scores when the resume contains strong evidence for that component.

Return only JSON matching the schema.
"""

    user_prompt = f"""
Evaluate this resume.

SCORING RUBRIC

1. profile_completeness: 0-10
- name, professional email, phone/contact details.
- full points only when the basic profile is complete.

2. skills: 0-20
- number of relevant skills, specificity, technical depth, and evidence of practical use.
- do not give high points just because many keywords are listed.

3. experience: 0-20
- quality and relevance of jobs, internships, freelance work, training, responsibilities, and duration.
- freshers can earn meaningful points from internships and strong practical work.

4. projects: 0-20
- quality, relevance, technologies used, description, complexity, ownership, and outcomes.
- project count alone is not enough.

5. education: 0-10
- degree, field, institution, and year/details.
- strong relevant education should score higher than incomplete or unclear education.

6. certifications: 0-5
- meaningful certifications relevant to the candidate profile.

7. achievements_impact: 0-5
- quantified outcomes, achievements, awards, competition results, publications, or measurable business/technical impact.

8. ats_readability: 0-10
- presence of standard sections, clear structure, consistent information, readable content, and useful section organization.
- score from extracted text and structured data; do not invent visual formatting that cannot be verified.

PARSED RESUME DATA:
{json.dumps(parsed_resume, ensure_ascii=False, indent=2)}

RESUME TEXT:
{resume_text}
"""

    schema = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "profile_completeness": {"type": "integer", "minimum": 0, "maximum": 10},
            "skills": {"type": "integer", "minimum": 0, "maximum": 20},
            "experience": {"type": "integer", "minimum": 0, "maximum": 20},
            "projects": {"type": "integer", "minimum": 0, "maximum": 20},
            "education": {"type": "integer", "minimum": 0, "maximum": 10},
            "certifications": {"type": "integer", "minimum": 0, "maximum": 5},
            "achievements_impact": {"type": "integer", "minimum": 0, "maximum": 5},
            "ats_readability": {"type": "integer", "minimum": 0, "maximum": 10},
        },
        "required": [
            "profile_completeness",
            "skills",
            "experience",
            "projects",
            "education",
            "certifications",
            "achievements_impact",
            "ats_readability",
        ],
    }

    return _call_groq(system_prompt, user_prompt, schema)


def calculate_resume_score(
    parsed_resume: dict[str, Any],
    resume_text: str,
) -> tuple[int, dict[str, int]]:
    """Calculate a final ATS-style score from component scores."""

    breakdown = _call_resume_quality_score(
        resume_text=resume_text,
        parsed_resume=parsed_resume or {},
    )

    clean = {
        key: max(0, int(value or 0))
        for key, value in breakdown.items()
    }

    total = sum(clean.values())
    total = max(0, min(100, total))

    return total, clean


# =========================================================
# RESUME INTELLIGENCE ANALYSIS
# =========================================================

def analyze_resume_intelligence(
    resume_text: str,
    parsed_resume: dict[str, Any] | None = None,
):
    """Generate qualitative AI insights plus a calibrated ATS-style score."""

    # Backward compatible: if the router does not pass parsed data yet,
    # generate it here once so scoring still uses structured resume content.
    if not parsed_resume:
        parsed_resume = analyze_resume_with_ai(resume_text)

    system_prompt = """
You are an expert AI Resume Analyzer.

Analyze the resume objectively using only evidence present in the resume.
Do not invent experience, skills, qualifications, achievements, or certifications.
Do not calculate or return a numeric resume score; the application calculates it separately.

Return concise, practical qualitative insights only.
"""

    user_prompt = f"""
Analyze the following resume.

PARSED RESUME DATA:
{json.dumps(parsed_resume or {}, ensure_ascii=False, indent=2)}

RESUME TEXT:
{resume_text}

Return:
- summary
- strengths
- weaknesses
- missing_skills
- suggestions
"""

    schema = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "summary": {"type": "string"},
            "strengths": {"type": "array", "items": {"type": "string"}},
            "weaknesses": {"type": "array", "items": {"type": "string"}},
            "missing_skills": {"type": "array", "items": {"type": "string"}},
            "suggestions": {"type": "array", "items": {"type": "string"}},
        },
        "required": [
            "summary",
            "strengths",
            "weaknesses",
            "missing_skills",
            "suggestions",
        ],
    }

    ai_analysis = _call_groq(
        system_prompt,
        user_prompt,
        schema,
    )

    score, breakdown = calculate_resume_score(
        parsed_resume=parsed_resume or {},
        resume_text=resume_text,
    )

    return {
        "resume_score": score,
        "summary": ai_analysis.get("summary", ""),
        "strengths": ai_analysis.get("strengths", []),
        "weaknesses": ai_analysis.get("weaknesses", []),
        "missing_skills": ai_analysis.get("missing_skills", []),
        "suggestions": ai_analysis.get("suggestions", []),
        "score_breakdown": breakdown,
    }


# =========================================================
# AI JOB MATCH EXPLANATION
# =========================================================

def analyze_job_match_with_ai(

    job_title: str,

    job_description: str,

    required_skills: list[str],

    resume_skills: list[str],

    matched_skills: list[str],

    missing_skills: list[str],

    final_match_score: float,

    exact_skill_score: float,

    semantic_skill_score: float,

    experience_score: float,

):

    system_prompt = """
You are an expert AI Job Matching Analyst.

Analyze how well a candidate's resume matches
a particular job.

Important rules:

1. Return ONLY valid JSON.
2. Do not use Markdown.
3. Do not invent candidate skills.
4. Do not invent candidate experience.
5. Do not change the provided scores.
6. Do not recalculate the scores.
7. Strengths must use only demonstrated matching skills.
8. Skill gaps should focus on missing required skills.
9. Experience analysis should explain the provided experience score.
10. Suggestions must be practical.
11. Keep the response concise.
"""

    user_prompt = f"""
Analyze the candidate's resume match against the job.

JOB TITLE:

{job_title}


JOB DESCRIPTION:

{job_description}


REQUIRED SKILLS:

{required_skills}


CANDIDATE SKILLS:

{resume_skills}


MATCHED SKILLS:

{matched_skills}


MISSING SKILLS:

{missing_skills}


FINAL MATCH SCORE:

{final_match_score}


EXACT SKILL SCORE:

{exact_skill_score}


SEMANTIC SKILL SCORE:

{semantic_skill_score}


EXPERIENCE SCORE:

{experience_score}
"""

    schema = {

        "type": "object",

        "additionalProperties": False,

        "properties": {

            "match_summary": {

                "type": "string"
            },

            "strengths": {

                "type": "array",

                "items": {
                    "type": "string"
                },
            },

            "skill_gaps": {

                "type": "array",

                "items": {
                    "type": "string"
                },
            },

            "experience_analysis": {

                "type": "string"
            },

            "improvement_suggestions": {

                "type": "array",

                "items": {
                    "type": "string"
                },
            },
        },

        "required": [
            "match_summary",
            "strengths",
            "skill_gaps",
            "experience_analysis",
            "improvement_suggestions",
        ],
    }

    try:

        return _call_groq(
            system_prompt,
            user_prompt,
            schema,
        )

    except Exception as e:

        print(
            f"Groq AI analysis unavailable: {e}"
        )

        # =================================================
        # FALLBACK RESPONSE
        # =================================================

        if final_match_score >= 80:

            match_level = "Strong"

        elif final_match_score >= 60:

            match_level = "Moderate"

        else:

            match_level = "Low"


        # =================================================
        # EXPERIENCE ANALYSIS
        # =================================================

        if experience_score >= 100:

            experience_analysis = (
                "The candidate meets the required "
                "experience level."
            )

        elif experience_score >= 50:

            experience_analysis = (
                "The candidate partially matches "
                "the required experience level."
            )

        else:

            experience_analysis = (
                "The available resume information "
                "does not sufficiently match "
                "the required experience."
            )


        # =================================================
        # SUGGESTIONS
        # =================================================

        suggestions = []


        if missing_skills:

            suggestions.append(
                "Develop or strengthen: "
                + ", ".join(missing_skills)
            )


        if experience_score < 100:

            suggestions.append(
                "Highlight relevant experience "
                "more clearly in the resume."
            )


        if not suggestions:

            suggestions.append(
                "Continue strengthening relevant "
                "skills and project experience."
            )


        # =================================================
        # FALLBACK RESPONSE
        # =================================================

        return {

            "match_summary": (
                f"{match_level} match based on "
                f"the calculated skill and "
                f"experience scores."
            ),

            "strengths": [

                "Matched skills: "
                + ", ".join(matched_skills),

                f"Exact skill match score: "
                f"{exact_skill_score}%",

                f"Semantic skill match score: "
                f"{semantic_skill_score}%",
            ],

            "skill_gaps": missing_skills,

            "experience_analysis":
                experience_analysis,

            "improvement_suggestions":
                suggestions,
        }