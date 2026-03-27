import urllib.parse
import requests

def get_wikipedia_summary(target_skill: str) -> str:
    """Fetch a quick definition from Wikipedia to enrich the context natively without API keys."""
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(target_skill)}"
    try:
        # Require a user-agent to comply with Wikimedia API policy securely
        headers = {'User-Agent': 'StudyBuddyAssistant/1.0'}
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get("extract", "")
    except Exception as e:
        print(f"[Enrichment Warning] Wikipedia fetch failed: {e}")
    return ""

def generate_learning_links(target_skill: str) -> list[str]:
    """Generate reliable, clickable search URLs for learning resources."""
    query = urllib.parse.quote(f"best resources to learn {target_skill} for beginners")
    yt_query = urllib.parse.quote(f"{target_skill} full course beginner")
    
    return [
        f"🌐 Google Best Resources: https://www.google.com/search?q={query}",
        f"📺 YouTube Full Course Searches: https://www.youtube.com/results?search_query={yt_query}"
    ]

def generate_visual_ideas(target_skill: str) -> list[str]:
    """Generate clickable Google Images search links for visual aids."""
    query = urllib.parse.quote(f"{target_skill} conceptual map OR workflow diagram OR cheat sheet")
    
    return [
        f"🖼 Visual Roadmaps & Cheat Sheets: https://www.google.com/search?tbm=isch&q={query}"
    ]

def build_enrichment_markdown(target_skill: str) -> str:
    """Combine all enrichments into an easy markdown block."""
    links = generate_learning_links(target_skill)
    visuals = generate_visual_ideas(target_skill)
    wiki_summary = get_wikipedia_summary(target_skill)
    
    output = "\n\n---\n\n"
    if wiki_summary:
        output += f"### 📚 Quick Wiki Primer\n_{wiki_summary}_\n\n"
        
    output += "### 🔗 Auto-Generated Study Links\n"
    for link in links:
        output += f"- {link}\n"
    
    output += "\n### 🖼 Visual Concepts\n"
    for v in visuals:
        output += f"- {v}\n"
        
    return output
