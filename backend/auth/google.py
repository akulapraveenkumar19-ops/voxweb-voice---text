import os
import httpx
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()


def get_google_auth_url(redirect_uri: Optional[str] = None, state: str = "voxweb_auth") -> str:
    load_dotenv(override=True)
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    target_redirect = (redirect_uri or os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5173")).strip()

    if not client_id:
        return f"{target_redirect}?code=demo_google_code&state={state}"

    base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": client_id,
        "redirect_uri": target_redirect,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": state,
        "prompt": "consent",
    }
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{base_url}?{query_string}"


async def exchange_google_code(code: str, redirect_uri: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Exchange authorization code for user info via Google API."""
    load_dotenv(override=True)
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
    target_redirect = (redirect_uri or os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5173")).strip()

    if code == "demo_google_code" or not client_id:
        return {
            "sub": "google_praveen_10928374",
            "name": "Praveen Kumar",
            "email": "akulapraveenkumar19@gmail.com",
            "picture": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"
        }

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": target_redirect,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            token_res = await client.post(token_url, data=data)
            token_json = token_res.json()
            access_token = token_json.get("access_token")
            if not access_token:
                print(f"[Google OAuth] Token error response: {token_json}")
                return None

            userinfo_res = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            return userinfo_res.json()
        except Exception as e:
            print(f"[Google OAuth] Error: {e}")
            return None


async def verify_google_credential(credential: str) -> Optional[Dict[str, Any]]:
    """Verify Google ID token sent from frontend Google Sign-In SDK."""
    load_dotenv(override=True)
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()

    if not credential:
        return None

    if credential.startswith("demo_") or not client_id:
        return {
            "sub": "google_praveen_10928374",
            "name": "Praveen Kumar",
            "email": "akulapraveenkumar19@gmail.com",
            "picture": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"
        }

    tokeninfo_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            res = await client.get(tokeninfo_url)
            if res.status_code == 200:
                data = res.json()
                if client_id and data.get("aud") != client_id:
                    print(f"[Google Verify] Audience mismatch: {data.get('aud')} != {client_id}")
                    return None
                return data
            return None
        except Exception as e:
            print(f"[Google Verify] Error: {e}")
            return None
