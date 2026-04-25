import logging
import os
import re
from functools import lru_cache
from typing import Dict, List, Optional

from transformers import pipeline

from .embedding_service import generate_embedding

logger = logging.getLogger(__name__)

SKILL_LIBRARY = {
    "python", "java", "javascript", "typescript", "react", "node", "node.js", "express",
    "fastapi", "django", "flask", "sql", "postgresql", "mysql", "mongodb", "redis",
    "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "github", "git", "linux",
    "machine learning", "deep learning", "nlp", "llm", "transformers", "pandas", "numpy",
    "scikit-learn", "tensorflow", "pytorch", "rest api", "graphql", "microservices",
    "system design", "software engineering", "data analysis", "data science", "etl",
    "airflow", "spark", "kafka", "rabbitmq", "testing", "pytest", "jest", "tdd"
}

SECTION_PATTERNS = {
    "experience": [r"experience", r"work history", r"professional experience"],
    "education": [r"education", r"academic background"],
    "skills": [r"skills", r"technical skills"],
    "projects": [r"projects", r"project experience"],
    "certifications": [r"certifications", r"licenses"],
    "summary": [r"summary", r"profile", r"objective"],
    "languages": [r"languages", r"spoken languages"],
    "awards": [r"awards", r"honors"],
}


@lru_cache(maxsize=1)
def get_ner_pipeline():
    model_name = os.getenv("NER_MODEL", "dslim/bert-base-NER")
    try:
        logger.info("Loading NER model: %s", model_name)
        return pipeline("ner", model=model_name, aggregation_strategy="simple")
    except Exception as exc:
        logger.warning("NER model unavailable, using heuristic fallback: %s", exc)
        return None


@lru_cache(maxsize=1)
def get_zero_shot_pipeline():
    model_name = os.getenv("ZERO_SHOT_MODEL", "facebook/bart-large-mnli")
    try:
        logger.info("Loading zero-shot model: %s", model_name)
        return pipeline("zero-shot-classification", model=model_name)
    except Exception as exc:
        logger.warning("Zero-shot model unavailable, using heuristic fallback: %s", exc)
        return None


def normalize_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "")
    return text.strip()


def extract_email(text: str) -> Optional[str]:
    match = re.search(r"[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    patterns = [
        r"(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}",
        r"\+?\d{10,15}"
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    return None


def extract_links(text: str) -> Dict[str, Optional[str]]:
    linkedin = re.search(r"https?://(?:www\.)?linkedin\.com/[\w\-./?=&%]+", text, re.IGNORECASE)
    github = re.search(r"https?://(?:www\.)?github\.com/[\w\-./?=&%]+", text, re.IGNORECASE)
    portfolio = re.search(r"https?://(?!.*(linkedin|github))[\w\-./?=&%]+", text, re.IGNORECASE)
    return {
        "linkedin": linkedin.group(0) if linkedin else None,
        "github": github.group(0) if github else None,
        "portfolio": portfolio.group(0) if portfolio else None,
    }


def extract_name(text: str, candidate_name: Optional[str] = None) -> Optional[str]:
    if candidate_name:
        return candidate_name.strip()

    ner = get_ner_pipeline()
    if ner:
        try:
            entities = ner(text[:2000])
            persons = [e["word"].replace("##", "") for e in entities if e.get("entity_group") == "PER"]
            if persons:
                return persons[0]
        except Exception as exc:
            logger.warning("NER name extraction failed: %s", exc)

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if lines:
        first_line = lines[0]
        if 2 <= len(first_line.split()) <= 4 and len(first_line) < 60:
            return first_line
    return None


def extract_summary(text: str) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", normalize_text(text))
    return " ".join(sentences[:3])[:500]


def extract_skills(text: str) -> List[str]:
    lower_text = text.lower()
    found = set()
    for skill in SKILL_LIBRARY:
        if skill in lower_text:
            found.add(skill)
    return sorted(found)


def extract_section_score(text: str, section_key: str) -> bool:
    patterns = SECTION_PATTERNS.get(section_key, [])
    lower_text = text.lower()
    return any(re.search(rf"\b{pattern}\b", lower_text) for pattern in patterns)


def extract_education(text: str) -> List[str]:
    matches = re.findall(
        r"(?:bachelor|master|b\.sc|m\.sc|mba|phd|associate|diploma|degree)[^.\n]*",
        text,
        re.IGNORECASE,
    )
    return [m.strip() for m in matches[:5]]


def extract_certifications(text: str) -> List[str]:
    matches = re.findall(
        r"(?:aws certified|google certified|microsoft certified|pmp|cissp|cka|ckad|scrum master)[^.\n]*",
        text,
        re.IGNORECASE,
    )
    return [m.strip() for m in matches[:5]]


def extract_languages(text: str) -> List[str]:
    known = [
        "english", "hindi", "spanish", "french", "german", "arabic", "portuguese", "japanese",
        "korean", "chinese", "italian", "russian"
    ]
    lower = text.lower()
    return [lang.title() for lang in known if re.search(rf"\b{re.escape(lang)}\b", lower)]


def estimate_years_experience(text: str) -> float:
    matches = re.findall(r"(\d+(?:\.\d+)?)\+?\s*(?:years|yrs|yr)\b", text, re.IGNORECASE)
    years = [float(m) for m in matches]
    return round(max(years), 1) if years else 0.0


def extract_experience_snippets(text: str) -> List[str]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    experience_lines = []
    capturing = False
    for line in lines:
        lower = line.lower()
        if any(keyword in lower for keyword in ["experience", "employment", "work history", "professional experience"]):
            capturing = True
            continue
        if capturing and any(keyword in lower for keyword in ["education", "skills", "projects", "certifications"]):
            break
        if capturing:
            experience_lines.append(line)
    return experience_lines[:10]


def estimate_resume_score(text: str, skills: List[str], target_skills: Optional[List[str]] = None) -> Dict[str, object]:
    score = 0
    breakdown = {}

    basics = {
        "email": bool(extract_email(text)),
        "phone": bool(extract_phone(text)),
        "summary": extract_section_score(text, "summary"),
        "experience": extract_section_score(text, "experience"),
        "education": extract_section_score(text, "education"),
        "skills": extract_section_score(text, "skills"),
        "projects": extract_section_score(text, "projects"),
    }

    for key, present in basics.items():
        points = 8 if present else 0
        breakdown[key] = points
        score += points

    skill_points = min(len(skills) * 2, 24)
    breakdown["skills_count"] = skill_points
    score += skill_points

    years = estimate_years_experience(text)
    exp_points = min(int(years * 3), 18)
    breakdown["years_experience"] = exp_points
    score += exp_points

    if target_skills:
        matched = len(set(s.lower() for s in skills) & set(s.lower() for s in target_skills))
        target_points = min(matched * 3, 18)
        breakdown["target_match"] = target_points
        score += target_points
    else:
        breakdown["target_match"] = 0

    score = min(score, 100)
    return {
        "overall": score,
        "breakdown": breakdown,
        "grade": "A" if score >= 85 else "B" if score >= 70 else "C" if score >= 55 else "D",
        "recommendation": "Strong candidate" if score >= 80 else "Improve resume quality and keyword coverage"
    }


def analyze_resume_text(resume_text: str, candidate_name: Optional[str] = None, target_skills: Optional[List[str]] = None, job_title: Optional[str] = None) -> Dict[str, object]:
    text = normalize_text(resume_text)
    skills = extract_skills(text)
    links = extract_links(text)
    email = extract_email(text)
    phone = extract_phone(text)
    years_experience = estimate_years_experience(text)
    embedding = generate_embedding(text[:3000])

    ner = get_ner_pipeline()
    organizations = []
    locations = []
    if ner:
                try:
                        entities = ner(text[:3000])
                        organizations = list({e["word"].replace("##", "") for e in entities if e.get("entity_group") == "ORG"})[:10]
                        locations = list({e["word"].replace("##", "") for e in entities if e.get("entity_group") == "LOC"})[:10]
                except Exception as exc:
                        logger.warning("NER extraction failed: %s", exc)

    score = estimate_resume_score(text, skills, target_skills)

    structured = {
        "candidate_name": extract_name(text, candidate_name),
        "candidate_email": email,
        "candidate_phone": phone,
        "linkedin_url": links["linkedin"],
        "github_url": links["github"],
        "portfolio_url": links["portfolio"],
        "location_mentions": locations,
        "organization_mentions": organizations,
        "summary": extract_summary(text),
        "skills": skills,
        "skill_count": len(skills),
        "years_experience": years_experience,
        "experience_snippets": extract_experience_snippets(text),
        "education": extract_education(text),
        "certifications": extract_certifications(text),
        "languages": extract_languages(text),
        "job_title": job_title,
        "target_skills": target_skills or [],
        "has_summary": extract_section_score(text, "summary"),
        "has_experience": extract_section_score(text, "experience"),
        "has_education": extract_section_score(text, "education"),
        "has_projects": extract_section_score(text, "projects"),
        "has_certifications": extract_section_score(text, "certifications"),
        "resume_length": len(text),
        "word_count": len(text.split()),
        "embedding_dimension": len(embedding),
        "resume_score": score,
        "content_density": round(min(len(skills) / max(len(text.split()) / 100, 1), 10), 2)
    }

    # Keep response deterministic and useful even without remote models
    structured["strengths"] = _compute_strengths(structured)
    structured["improvement_suggestions"] = _compute_suggestions(structured)

    return structured


def _compute_strengths(data: Dict[str, object]) -> List[str]:
    strengths = []
    if data.get("candidate_email"):
        strengths.append("Clear contact information")
    if data.get("skills"):
        strengths.append(f"Skills identified: {data.get('skill_count', 0)}")
    if data.get("has_experience"):
        strengths.append("Experience section detected")
    if data.get("has_education"):
        strengths.append("Education section detected")
    if data.get("resume_score", {}).get("overall", 0) >= 70:
        strengths.append("Strong resume structure")
    return strengths or ["Resume parsed successfully"]


def _compute_suggestions(data: Dict[str, object]) -> List[str]:
    suggestions = []
    if not data.get("candidate_phone"):
        suggestions.append("Add a phone number")
    if not data.get("linkedin_url"):
        suggestions.append("Add a LinkedIn profile")
    if not data.get("github_url") and any(skill in {"python", "javascript", "typescript", "react", "node", "fastapi"} for skill in (data.get("skills") or [])):
        suggestions.append("Add a GitHub portfolio link")
    if not data.get("has_summary"):
        suggestions.append("Add a professional summary")
    if not data.get("has_projects"):
        suggestions.append("Add a projects section")
    if data.get("resume_score", {}).get("overall", 0) < 70:
        suggestions.append("Increase keyword coverage for your target role")
    return suggestions[:6] or ["Keep the resume concise and targeted"]
