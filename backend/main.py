import argparse
import json
import sys
import os
from typing import Dict, Any

sys.stdout.reconfigure(encoding='utf-8')
from dotenv import load_dotenv

load_dotenv()

from backend.models import StudentInput
from backend.analyzer import analyze_student_scores
from backend.prompt_builder import build_prompt
from backend.llm import generate_response

async def run_study_buddy_pipeline(input_data: Dict[str, Any]) -> str:
    """Run the entire Study Buddy AI pipeline given a raw dictionary input."""
    student = StudentInput(**input_data)
    analysis = analyze_student_scores(student)
    system_prompt = build_prompt(student, analysis)
    user_prompt = student.raw_input if student.raw_input else "Hello"
    
    llm_output = await generate_response(system_prompt, user_prompt, student.history)
    
    # Enrichment layer: only fires when user explicitly asks for resources, links, or wiki definitions
    resource_triggers = [
        "give me resources", "give resources", "some resources", "any resources",
        "links", "link for", "link to", "website", "websites",
        "what do experts", "expert definition", "define it", "what is defined",
        "wiki", "wikipedia", "according to experts", "official definition",
        "where can i learn", "where to learn", "courses", "tutorials",
        "study material", "reading material",
    ]
    user_lower = user_prompt.lower()
    should_enrich = any(trigger in user_lower for trigger in resource_triggers)
    
    if should_enrich and student.target_skill:
        from backend.enrichment import build_enrichment_markdown
        enrichment_text = build_enrichment_markdown(student.target_skill)
        llm_output += enrichment_text
        
    return llm_output

import asyncio

def main():
    parser = argparse.ArgumentParser(description="Study Buddy AI inference pipeline")
    parser.add_argument("--input", type=str, required=True, help="JSON string of student data")
    
    args = parser.parse_args()
    
    try:
        data = json.loads(args.input)
        response = asyncio.run(run_study_buddy_pipeline(data))
        print(response)
    except json.JSONDecodeError:
        print("Error: Invalid JSON input format")
        sys.exit(1)

if __name__ == "__main__":
    main()
