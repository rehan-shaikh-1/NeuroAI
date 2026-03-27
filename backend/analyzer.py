from typing import Dict, List, Tuple
from backend.models import StudentInput, ScoreTier, AnalysisResult

def map_score_to_tier(score: int) -> ScoreTier:
    """Map a numerical score to a predefined score tier."""
    if score < 40:
        return ScoreTier.CRITICAL
    elif score < 60:
        return ScoreTier.WEAK
    elif score < 80:
        return ScoreTier.FAIR
    else:
        return ScoreTier.STRONG

def analyze_student_scores(student: StudentInput) -> AnalysisResult:
    """Analyze all submitted student scores and separate them into insights."""
    tier_mapping = {}
    critical = []
    weak = []
    strong = []

    for subject, score in student.scores.items():
        tier = map_score_to_tier(score)
        tier_mapping[subject] = tier
        if tier == ScoreTier.CRITICAL:
            critical.append(subject)
        elif tier == ScoreTier.WEAK:
            weak.append(subject)
        elif tier == ScoreTier.STRONG:
            strong.append(subject)

    return AnalysisResult(
        tier_mapping=tier_mapping,
        critical_areas=critical,
        weak_points=weak,
        strengths=strong
    )
