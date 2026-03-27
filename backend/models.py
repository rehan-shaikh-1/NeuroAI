from pydantic import BaseModel, Field
from enum import Enum
from typing import Dict, Optional, List

class ScoreTier(Enum):
    CRITICAL = "Critical"
    WEAK = "Weak"
    FAIR = "Fair"
    STRONG = "Strong"

class StudentInput(BaseModel):
    name: Optional[str] = Field(default="Student", description="Name of the student")
    scores: Dict[str, int] = Field(default_factory=dict, description="Mapping of subjects to their scores (0-100)")
    raw_input: Optional[str] = Field(default="Hello!", description="Free-text, messy input from the user describing their situation")
    education_level: Optional[str] = Field(default="Undergraduate", description="Educational context")
    target_skill: Optional[str] = Field(default="the topics you mentioned", description="The desired target skill the student wants to learn")
    history: List[Dict[str, str]] = Field(default_factory=list, description="List of previous messages for long context: [{'role': 'user'|'assistant', 'content': '...'}]")

class AnalysisResult(BaseModel):
    tier_mapping: Dict[str, ScoreTier]
    critical_areas: List[str]
    weak_points: List[str]
    strengths: List[str]
