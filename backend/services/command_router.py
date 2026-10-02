import re
import math
import urllib.parse
import urllib.request
import json
from datetime import datetime
from typing import Optional, Dict, Any

# Map of common fast target websites
KNOWN_SITES = {
    "youtube": "https://www.youtube.com",
    "google": "https://www.google.com",
    "whatsapp": "https://web.whatsapp.com",
    "github": "https://github.com",
    "twitter": "https://x.com",
    "x": "https://x.com",
    "reddit": "https://www.reddit.com",
    "wikipedia": "https://www.wikipedia.org",
    "gmail": "https://mail.google.com",
    "linkedin": "https://www.linkedin.com",
    "netflix": "https://www.netflix.com",
    "spotify": "https://open.spotify.com",
    "amazon": "https://www.amazon.com",
    "stackoverflow": "https://stackoverflow.com",
    "stack overflow": "https://stackoverflow.com",
    "chatgpt": "https://chatgpt.com",
    "openai": "https://openai.com",
    "facebook": "https://www.facebook.com",
    "instagram": "https://www.instagram.com",
    "leetcode": "https://leetcode.com",
    "canva": "https://www.canva.com",
    "coursera": "https://www.coursera.org",
    "discord": "https://discord.com",
    "twitch": "https://www.twitch.tv",
    "maps": "https://maps.google.com",
    "google maps": "https://maps.google.com",
    "notion": "https://www.notion.so",
    "figma": "https://www.figma.com",
}


def fetch_live_weather(city: str) -> Optional[str]:
    """Fetch live real-time weather summary for a specified city using public meteorological API."""
    try:
        clean_city = urllib.parse.quote_plus(city.strip())
        url = f"https://wttr.in/{clean_city}?format=j1"
        req = urllib.request.Request(url, headers={"User-Agent": "VoxWeb/1.0"})
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            current = data.get("current_condition", [{}])[0]
            temp_c = current.get("temp_C", "N/A")
            temp_f = current.get("temp_F", "N/A")
            desc = current.get("weatherDesc", [{}])[0].get("value", "Clear")
            humidity = current.get("humidity", "")
            return f"The current weather in {city.title()} is {desc} at {temp_c} degrees Celsius ({temp_f} degrees Fahrenheit) with {humidity}% humidity."
    except Exception as e:
        print(f"[Weather Service] Could not fetch live weather for {city}: {e}")
        return None


def safe_calculate(expr_str: str) -> Optional[str]:
    """Safely evaluate basic math expressions without executing arbitrary code."""
    cleaned = expr_str.replace("x", "*").replace("×", "*").replace("÷", "/").replace("^", "**")
    # Allow only numbers, parentheses, and arithmetic operators
    if not re.match(r'^[\d\s\+\-\*\/\.\(\)\%\*\*]+$', cleaned):
        return None
    try:
        # Only allow safe built-in math operations
        result = eval(cleaned, {"__builtins__": None, "math": math}, {})
        if isinstance(result, (int, float)):
            if isinstance(result, float) and result.is_integer():
                result = int(result)
            elif isinstance(result, float):
                result = round(result, 4)
            return f"{expr_str} equals {result}."
    except Exception:
        return None
    return None


def process_fast_command(command: str, language: Optional[str] = "en-US") -> Optional[Dict[str, Any]]:
    """
    Evaluates whether the input command is a direct fast action (Open website,
    Search Google, YouTube Music Play, Weather, Math Calculator, Notes, Time/Date,
    Phone/WhatsApp Calling) or requires LLM intelligence.
    """
    if not command:
        return None

    raw_trimmed = command.strip()
    cleaned = raw_trimmed.lower()
    cleaned = re.sub(r'[\.\!\?]+$', '', cleaned).strip()
    is_te = bool(language and language.lower().startswith("te"))

    # A. WhatsApp Call command: "call on whatsapp +91...", "whatsapp call 9876...", "వాట్సాప్ కాల్ చేయి 9876..."
    wa_match = re.match(
        r'^(?:call\s+(?:on\s+)?whatsapp\s+(?:to\s+)?|whatsapp\s+call\s+(?:to\s+)?|వాట్సాప్\s*(?:లో)?\s*కాల్\s*చేయి\s*)([\+\d\s\-\(\)]+)$',
        raw_trimmed,
        re.IGNORECASE
    )
    if wa_match:
        raw_num = wa_match.group(1).strip()
        digits = re.sub(r'[^\d]', '', raw_num)
        if len(digits) >= 5:
            wa_url = f"https://wa.me/{digits}"
            resp_msg = f"{raw_num} కు వాట్సాప్‌లో కాల్ చేస్తున్నాను." if is_te else f"Calling {raw_num} on WhatsApp."
            return {
                "type": "action",
                "action": "call_whatsapp",
                "query": raw_num,
                "url": wa_url,
                "response": resp_msg,
                "intent": "whatsapp_call",
                "timestamp": datetime.now().isoformat()
            }

    # B. Device / Phone Call command: "call 9876...", "dial +91...", "కాల్ చేయి 9876...", "ఫోన్ చేయి 9876..."
    phone_match = re.match(
        r'^(?:call|dial|phone|make a call to|కాల్ చేయి|ఫోన్ చేయి)\s+([\+\d\s\-\(\)]+)$',
        raw_trimmed,
        re.IGNORECASE
    )
    if phone_match:
        raw_num = phone_match.group(1).strip()
        clean_num = re.sub(r'[^\d\+]', '', raw_num)
        if len(clean_num.replace('+', '')) >= 5:
            resp_msg = f"{raw_num} కు కాల్ చేస్తున్నాను." if is_te else f"Calling {raw_num} on your device."
            return {
                "type": "action",
                "action": "call_phone",
                "query": raw_num,
                "url": f"tel:{clean_num}",
                "response": resp_msg,
                "intent": "phone_call",
                "timestamp": datetime.now().isoformat()
            }

    # C. Telugu Fast Actions
    if cleaned in ["సమయం ఎంత", "టైమ్ ఎంత", "ఇప్పుడు సమయం ఎంత", "టైం ఎంత", "టైమ్ చెప్పు", "సమయం చెప్పు"]:
        now_str = datetime.now().strftime("%I:%M %p")
        return {
            "type": "action",
            "action": "tell_time",
            "response": f"ప్రస్తుత సమయం {now_str}.",
            "intent": "time_query",
            "timestamp": datetime.now().isoformat()
        }

    if cleaned in ["తేదీ ఎంత", "ఈరోజు తేదీ ఎంత", "ఈరోజు ఏ రోజు", "తేదీ చెప్పు", "ఈరోజు తేదీ చెప్పు"]:
        date_str = datetime.now().strftime("%A, %B %d, %Y")
        return {
            "type": "action",
            "action": "tell_date",
            "response": f"ఈరోజు {date_str}.",
            "intent": "date_query",
            "timestamp": datetime.now().isoformat()
        }

    te_yt_match = re.match(r'^(?:యూట్యూబ్‌లో|యూట్యూబ్ లో)\s*(.+?)\s*(?:ప్లే చేయి|పెట్టు|ఓపెన్ చేయి)$', raw_trimmed)
    if te_yt_match:
        q = te_yt_match.group(1).strip()
        encoded = urllib.parse.quote_plus(q)
        return {
            "type": "action",
            "action": "play_youtube",
            "query": q,
            "url": f"https://www.youtube.com/results?search_query={encoded}",
            "response": f"యూట్యూబ్‌లో {q} శోధిస్తున్నాను.",
            "intent": "youtube_play",
            "timestamp": datetime.now().isoformat()
        }
    if cleaned in ["యూట్యూబ్ ఓపెన్ చేయి", "యూట్యూబ్ తెరువు"]:
        return {
            "type": "action",
            "action": "open_url",
            "url": "https://www.youtube.com",
            "response": "యూట్యూబ్ ఓపెన్ చేస్తున్నాను.",
            "intent": "open_website",
            "timestamp": datetime.now().isoformat()
        }

    te_search_match = re.match(r'^(.+?)\s*(?:గురించి వెతుకు|సెర్చ్ చేయి|శోధించు)$', raw_trimmed)
    if te_search_match:
        q = te_search_match.group(1).strip()
        encoded = urllib.parse.quote_plus(q)
        return {
            "type": "action",
            "action": "search_google",
            "query": q,
            "url": f"https://www.google.com/search?q={encoded}",
            "response": f"గూగుల్‌లో {q} గురించి శోధిస్తున్నాను.",
            "intent": "web_search",
            "timestamp": datetime.now().isoformat()
        }
    if cleaned in ["గూగుల్ ఓపెన్ చేయి", "గూగుల్ తెరువు"]:
        return {
            "type": "action",
            "action": "open_url",
            "url": "https://www.google.com",
            "response": "గూగుల్ ఓపెన్ చేస్తున్నాను.",
            "intent": "open_website",
            "timestamp": datetime.now().isoformat()
        }

    # 1. Time query
    if cleaned in ["what time is it", "what is the time", "current time", "tell me the time", "time now", "check time"]:
        now_str = datetime.now().strftime("%I:%M %p")
        return {
            "type": "action",
            "action": "tell_time",
            "response": f"The current time is {now_str}.",
            "intent": "time_query",
            "timestamp": datetime.now().isoformat()
        }

    # 2. Date query
    if cleaned in ["what is the date", "what date is it", "what day is today", "current date", "today's date", "tell me the date"]:
        date_str = datetime.now().strftime("%A, %B %d, %Y")
        return {
            "type": "action",
            "action": "tell_date",
            "response": f"Today is {date_str}.",
            "intent": "date_query",
            "timestamp": datetime.now().isoformat()
        }

    # 3. YouTube Search & Play: "play <query> on youtube", "search youtube for <query>", "youtube <query>"
    yt_match = (
        re.match(r'^(?:play|listen to)\s+(.+?)(?:\s+on\s+youtube)?$', cleaned) or
        re.match(r'^(?:search\s+youtube\s+for|youtube\s+search\s+for|search\s+on\s+youtube\s+for)\s+(.+)$', cleaned) or
        re.match(r'^youtube\s+(?!open\b)(.+)$', cleaned)
    )
    if yt_match and not cleaned.startswith("open"):
        query = yt_match.group(1).strip()
        if len(query) > 1 and query not in ["music", "video", "videos"]:
            encoded = urllib.parse.quote_plus(query)
            url = f"https://www.youtube.com/results?search_query={encoded}"
            return {
                "type": "action",
                "action": "play_youtube",
                "query": query,
                "url": url,
                "response": f"Searching YouTube for {query}.",
                "intent": "youtube_play",
                "timestamp": datetime.now().isoformat()
            }

    # 4. Maps Search: "search maps for <query>", "find <query> on maps"
    maps_match = re.match(r'^(?:search\s+maps?\s+for|find\s+(.+?)\s+on\s+maps?|maps?\s+search\s+for)\s+(.+)$', cleaned)
    if maps_match:
        place = (maps_match.group(2) if maps_match.group(2) else maps_match.group(1)).strip()
        encoded = urllib.parse.quote_plus(place)
        url = f"https://maps.google.com/?q={encoded}"
        return {
            "type": "action",
            "action": "search_maps",
            "query": place,
            "url": url,
            "response": f"Searching Google Maps for {place}.",
            "intent": "maps_search",
            "timestamp": datetime.now().isoformat()
        }

    # 5. Wikipedia Search: "wikipedia <query>", "search wikipedia for <query>"
    wiki_match = re.match(r'^(?:search\s+wikipedia\s+for|wikipedia\s+search\s+for|wikipedia)\s+(.+)$', cleaned)
    if wiki_match:
        topic = wiki_match.group(1).strip()
        encoded = urllib.parse.quote_plus(topic)
        url = f"https://en.wikipedia.org/wiki/Special:Search?search={encoded}"
        return {
            "type": "action",
            "action": "search_wikipedia",
            "query": topic,
            "url": url,
            "response": f"Looking up {topic} on Wikipedia.",
            "intent": "wikipedia_search",
            "timestamp": datetime.now().isoformat()
        }

    # 6. Live Weather Lookup: "weather in <city>", "what is the weather in <city>"
    weather_match = re.match(r'^(?:what(?: is|\'s) the weather(?: like)? in|weather in|weather for|how is the weather in)\s+([a-zA-Z\s]+)$', cleaned)
    if weather_match:
        city = weather_match.group(1).strip()
        weather_text = fetch_live_weather(city)
        if weather_text:
            return {
                "type": "action",
                "action": "weather",
                "query": city,
                "response": weather_text,
                "intent": "weather_query",
                "timestamp": datetime.now().isoformat()
            }
        else:
            encoded = urllib.parse.quote_plus(f"weather in {city}")
            return {
                "type": "action",
                "action": "search_google",
                "query": f"weather in {city}",
                "url": f"https://www.google.com/search?q={encoded}",
                "response": f"Checking current weather forecast for {city.title()}.",
                "intent": "weather_query",
                "timestamp": datetime.now().isoformat()
            }

    # 7. Math & Unit Calculator: "calculate <expr>", "what is <expr>"
    calc_match = re.match(r'^(?:calculate|what is|compute)\s+([\d\s\+\-\*\/\.\(\)\%\^x×÷]+)$', cleaned)
    if calc_match:
        expr = calc_match.group(1).strip()
        calc_result = safe_calculate(expr)
        if calc_result:
            return {
                "type": "action",
                "action": "calculate",
                "response": calc_result,
                "intent": "math_calculation",
                "timestamp": datetime.now().isoformat()
            }

    # 8. Voice Note creation: "take a note: <text>", "note down <text>", "remember that <text>"
    note_match = re.match(r'^(?:take a note|add a note|create note|note down|remember that|remember to|save a note)[:\s]+(.+)$', cleaned)
    if note_match:
        note_content = note_match.group(1).strip()
        return {
            "type": "action",
            "action": "save_note",
            "query": note_content,
            "response": f"I have saved your note: \"{note_content}\".",
            "intent": "voice_note",
            "timestamp": datetime.now().isoformat()
        }

    # 9. Direct Website Open Commands: "open <site>", "launch <site>", "go to <site>"
    open_match = re.match(r'^(?:open|launch|go to|navigate to)\s+(?:the\s+)?([a-z0-9\.\s]+)$', cleaned)
    if open_match:
        target = open_match.group(1).strip()
        if target in KNOWN_SITES:
            url = KNOWN_SITES[target]
            display_name = target.title()
            return {
                "type": "action",
                "action": "open_url",
                "url": url,
                "response": f"Opening {display_name} for you.",
                "intent": "open_website",
                "timestamp": datetime.now().isoformat()
            }
        if "." in target and " " not in target:
            url = f"https://{target}" if not target.startswith("http") else target
            return {
                "type": "action",
                "action": "open_url",
                "url": url,
                "response": f"Navigating to {target}.",
                "intent": "open_website",
                "timestamp": datetime.now().isoformat()
            }

    # 10. Search Google: "search google for <query>", "search for <query>", "google <query>"
    search_google_match = re.match(r'^(?:search\s+google\s+for|google\s+for|search\s+on\s+google\s+for)\s+(.+)$', cleaned)
    if search_google_match:
        query = search_google_match.group(1).strip()
        encoded = urllib.parse.quote_plus(query)
        url = f"https://www.google.com/search?q={encoded}"
        return {
            "type": "action",
            "action": "search_google",
            "query": query,
            "url": url,
            "response": f"Searching Google for {query}.",
            "intent": "web_search",
            "timestamp": datetime.now().isoformat()
        }

    search_for_match = re.match(r'^search\s+for\s+(.+)$', cleaned)
    if search_for_match:
        query = search_for_match.group(1).strip()
        encoded = urllib.parse.quote_plus(query)
        url = f"https://www.google.com/search?q={encoded}"
        return {
            "type": "action",
            "action": "search_google",
            "query": query,
            "url": url,
            "response": f"Searching for {query}.",
            "intent": "web_search",
            "timestamp": datetime.now().isoformat()
        }

    google_match = re.match(r'^google\s+(?!search\b)(.+)$', cleaned)
    if google_match:
        query = google_match.group(1).strip()
        if len(query) > 1 and query not in ["search", "home"]:
            encoded = urllib.parse.quote_plus(query)
            url = f"https://www.google.com/search?q={encoded}"
            return {
                "type": "action",
                "action": "search_google",
                "query": query,
                "url": url,
                "response": f"Searching Google for {query}.",
                "intent": "web_search",
                "timestamp": datetime.now().isoformat()
            }

    return None
