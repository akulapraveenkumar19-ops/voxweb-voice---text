import os
import asyncio
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = (
    "You are VoxWeb, an intelligent voice website assistant. "
    "Answer clearly, naturally and concisely. "
    "Your responses will often be spoken aloud using Text-to-Speech, so do not use markdown asterisks, bullet points, "
    "or complex code blocks unless asked. "
    "Keep answers strictly within 2 to 3 concise, friendly sentences for effortless voice playback."
)

SYSTEM_PROMPT_TELUGU = (
    "You are VoxWeb, an intelligent voice website assistant. "
    "The user is speaking or asking questions in Telugu (తెలుగు). "
    "Answer warmly, naturally, accurately and concisely in pure, fluent Telugu script (తెలుగు లిపి). "
    "Your responses will be spoken aloud using Telugu Text-to-Speech, so do not use markdown asterisks, bullet points, "
    "or complex formatting. "
    "Keep answers strictly within 2 to 3 concise, friendly Telugu sentences for effortless voice playback."
)


async def generate_ai_response(
    query: str,
    context: Optional[List[Dict[str, str]]] = None,
    language: Optional[str] = "en-US"
) -> str:
    """
    Direct Real LLM Generation (OpenRouter -> OpenAI -> Google Gemini).
    Uses user-configured API keys to generate natural voice answers.
    Supports English and Telugu (te-IN) voice generations.
    """
    load_dotenv(override=True)

    is_telugu = bool(language and language.lower().startswith("te"))
    effective_system_prompt = SYSTEM_PROMPT_TELUGU if is_telugu else SYSTEM_PROMPT

    openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    openrouter_model = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini").strip()

    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()

    # 1. Primary: OpenRouter API (High reliability & multi-model support)
    if openrouter_key and not openrouter_key.startswith("sk-your"):
        try:
            from openai import AsyncOpenAI

            client = AsyncOpenAI(
                api_key=openrouter_key,
                base_url="https://openrouter.ai/api/v1",
                default_headers={
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "VoxWeb Voice Assistant",
                }
            )
            messages = [{"role": "system", "content": effective_system_prompt}]

            if context:
                for c in context[-3:]:
                    if "user" in c:
                        messages.append({"role": "user", "content": c["user"]})
                    if "assistant" in c:
                        messages.append({"role": "assistant", "content": c["assistant"]})

            messages.append({"role": "user", "content": query})

            response = await client.chat.completions.create(
                model=openrouter_model,
                messages=messages,
                max_tokens=150,
                temperature=0.6,
                timeout=15.0,
            )
            content = response.choices[0].message.content
            if content:
                clean_text = content.replace("**", "").replace("*", "").replace("#", "").strip()
                return clean_text
        except Exception as e:
            print(f"[OpenRouter API Error] {e}")
            # If OpenRouter threw an error, continue to OpenAI or Gemini fallback

    # 2. Secondary: Direct OpenAI API
    if openai_key and not openai_key.startswith("sk-your"):
        try:
            from openai import AsyncOpenAI

            client = AsyncOpenAI(api_key=openai_key)
            messages = [{"role": "system", "content": effective_system_prompt}]

            if context:
                for c in context[-3:]:
                    if "user" in c:
                        messages.append({"role": "user", "content": c["user"]})
                    if "assistant" in c:
                        messages.append({"role": "assistant", "content": c["assistant"]})

            messages.append({"role": "user", "content": query})

            response = await client.chat.completions.create(
                model=openai_model,
                messages=messages,
                max_tokens=150,
                temperature=0.6,
                timeout=15.0,
            )
            content = response.choices[0].message.content
            if content:
                clean_text = content.replace("**", "").replace("*", "").replace("#", "").strip()
                return clean_text
        except Exception as e:
            print(f"[OpenAI API Error] {e}")

    # 3. Tertiary: Google Gemini (if configured)
    if gemini_key and not gemini_key.startswith("your_"):
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=gemini_key)

            def call_gemini():
                config = types.GenerateContentConfig(
                    system_instruction=effective_system_prompt,
                    max_output_tokens=150,
                    temperature=0.6,
                )
                res = client.models.generate_content(
                    model=gemini_model,
                    contents=query,
                    config=config,
                )
                return res.text

            text = await asyncio.to_thread(call_gemini)
            if text:
                clean_text = text.replace("**", "").replace("*", "").replace("#", "").strip()
                return clean_text
        except Exception as e:
            print(f"[Gemini API Error] {e}")

    if is_telugu:
        return "నేను వోక్స్ వెబ్, మీ తెలివైన వాయిస్ అసిస్టెంట్. నేను మీకు సమాధానం ఇవ్వడానికి మరియు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను!"
    return "I am VoxWeb, your intelligent voice assistant. I am ready to help you search, explore websites, or answer questions!"
