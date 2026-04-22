"""
SBERT Similarity Service
Compares a CV text against a Job Offer text and returns a semantic similarity score.
Run with: python sbert_service.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)
CORS(app)

# Load once at startup — "all-MiniLM-L6-v2" is fast, accurate, and small (~80MB)
print("Loading SBERT model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("Model loaded.")


def build_cv_text(cv: dict) -> str:
    """Flatten the CV document into a single descriptive string for embedding."""
    parts = []

    personal = cv.get("personal", {})
    if personal.get("professionalTitle"):
        parts.append(f"Title: {personal['professionalTitle']}")

    content = cv.get("content", {})

    if content.get("professionalSummary"):
        parts.append(f"Summary: {content['professionalSummary']}")

    if content.get("skills"):
        parts.append(f"Skills: {content['skills']}")

    if content.get("experience"):
        parts.append(f"Experience: {content['experience']}")

    if content.get("education"):
        parts.append(f"Education: {content['education']}")

    # Structured experience items
    for exp in content.get("experienceItems", []):
        exp_parts = [exp.get("title", ""), exp.get("company", ""), exp.get("description", ""), exp.get("stack", "")]
        parts.append("Experience: " + " | ".join(p for p in exp_parts if p))

    # Structured education items
    for edu in content.get("educationItems", []):
        edu_parts = [edu.get("degree", ""), edu.get("institution", ""), edu.get("specialty", ""), edu.get("pfeTitle", "")]
        parts.append("Education: " + " | ".join(p for p in edu_parts if p))

    # Projects
    for proj in content.get("projects", []):
        proj_parts = [proj.get("name", ""), proj.get("description", ""), proj.get("technologies", ""), proj.get("role", "")]
        parts.append("Project: " + " | ".join(p for p in proj_parts if p))

    # Languages
    for lang in content.get("languages", []):
        if lang.get("name"):
            parts.append(f"Language: {lang['name']} {lang.get('level', '')}")

    # Certifications
    for cert in content.get("certifications", []):
        if cert.get("name"):
            parts.append(f"Certification: {cert['name']} {cert.get('organization', '')}")

    # Qualities
    if content.get("qualities"):
        parts.append("Qualities: " + ", ".join(content["qualities"]))

    # Extracted categories from RoBERTa (if available)
    extraction = cv.get("extraction", {})
    categories = extraction.get("categories", {})
    if categories.get("skills"):
        parts.append("Extracted Skills: " + ", ".join(categories["skills"]))
    if categories.get("experiences"):
        parts.append("Extracted Experience: " + ", ".join(categories["experiences"]))
    if categories.get("education"):
        parts.append("Extracted Education: " + ", ".join(categories["education"]))
    if categories.get("titles"):
        parts.append("Extracted Titles: " + ", ".join(categories["titles"]))

    return "\n".join(filter(None, parts))


def build_job_offer_text(job: dict) -> str:
    """Flatten the JobOffer document into a string for embedding."""
    parts = []

    if job.get("title"):
        parts.append(f"Position: {job['title']}")
    if job.get("description"):
        parts.append(f"Description: {job['description']}")
    if job.get("technicalSkills"):
        parts.append(f"Technical Skills Required: {job['technicalSkills']}")
    if job.get("experienceRequired"):
        parts.append(f"Experience Required: {job['experienceRequired']}")
    if job.get("languagesRequired"):
        parts.append(f"Languages Required: {job['languagesRequired']}")
    if job.get("contractType"):
        parts.append(f"Contract: {job['contractType']}")
    if job.get("workMode"):
        parts.append(f"Work Mode: {job['workMode']}")

    return "\n".join(filter(None, parts))


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "all-MiniLM-L6-v2"})


@app.route("/score", methods=["POST"])
def score():
    """
    Expects JSON body:
    {
      "cv": { ...CV document from MongoDB... },
      "jobOffer": { ...JobOffer document from MongoDB... }
    }

    Returns:
    {
      "score": 0.82,
      "scorePercent": 82,
      "cvText": "...",
      "jobText": "..."
    }
    """
    data = request.get_json()
    if not data or "cv" not in data or "jobOffer" not in data:
        return jsonify({"error": "Request must include 'cv' and 'jobOffer' fields"}), 400

    cv_text = build_cv_text(data["cv"])
    job_text = build_job_offer_text(data["jobOffer"])

    if not cv_text.strip():
        return jsonify({"error": "CV has no extractable text content"}), 422
    if not job_text.strip():
        return jsonify({"error": "Job offer has no extractable text content"}), 422

    # Encode both texts and compute cosine similarity
    embeddings = model.encode([cv_text, job_text], convert_to_tensor=True)
    similarity = util.cos_sim(embeddings[0], embeddings[1]).item()

    # Clamp to [0, 1]
    similarity = max(0.0, min(1.0, similarity))
    score_percent = round(similarity * 100)

    return jsonify({
        "score": round(similarity, 4),
        "scorePercent": score_percent,
        "cvText": cv_text,
        "jobText": job_text,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
