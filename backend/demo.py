import os
import sys
import json

# Ensure stdout supports emojis on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure root directory is discoverable so 'backend' can be imported as a package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.main import run_study_buddy_pipeline

def run_demo():
    sample_input = {
      "name": "Ashish",
      "education_level": "High School",
      "scores": {
        "math": 78,
        "physics": 65,
        "english": 88
      },
      "raw_input": "I don't really know where to start but I heard it's cool.",
      "target_skill": "Machine Learning"
    }

    print("Running Study Buddy AI with sample input:")
    print(json.dumps(sample_input, indent=2))
    print(f"\nChecking HF_TOKEN (HuggingFace Inference API token): {'Set' if 'HF_TOKEN' in os.environ else 'Not Set'}\n")

    if "HF_TOKEN" not in os.environ:
        print("[WARNING] HF_TOKEN is not defined in the environment.")
        print("Please define it before running, or expect an authorization error when reaching the LLM layer.\n")

    response = run_study_buddy_pipeline(sample_input)
    print("\n=== FINAL GENERATED RESPONSE ===\n")
    print(response)

if __name__ == "__main__":
    run_demo()
