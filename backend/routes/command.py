from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from db import db_manager
from models.schemas import CommandRequest, CommandResponse
from auth.jwt import get_current_user_optional, get_current_user
from services.command_router import process_fast_command
from services.llm_service import generate_ai_response

router = APIRouter(prefix="/api/command", tags=["Voice & Commands"])


@router.post("", response_model=CommandResponse)
async def execute_command(
    payload: CommandRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """
    Executes spoken or typed command.
    1. Fast Command Router evaluates direct actions (Website, Search, Time/Date).
    2. If not a fast command, routes to OpenAI LLM service.
    3. Saves conversation history for authenticated user.
    """
    cmd = payload.command.strip()
    if not cmd:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Command cannot be empty."
        )

    now_iso = datetime.now(timezone.utc).isoformat()

    # Step 1: Fast Command Router
    fast_result = process_fast_command(cmd, payload.language)

    if fast_result is not None:
        if fast_result.get("action") == "save_note" and current_user:
            try:
                user_id = str(current_user["_id"])
                note_content = fast_result.get("query", cmd)
                await db_manager.notes.insert_one({
                    "user_id": user_id,
                    "title": "Voice Reminder",
                    "content": note_content,
                    "completed": False,
                    "created_at": now_iso
                })
            except Exception as ne:
                print(f"[Notes DB Error] {ne}")

        response_data = {
            "type": "action",
            "action": fast_result.get("action"),
            "url": fast_result.get("url"),
            "query": fast_result.get("query"),
            "response": fast_result.get("response", ""),
            "timestamp": now_iso,
            "intent": fast_result.get("intent")
        }
    else:
        # Step 2: AI Question via LLM
        ai_text = await generate_ai_response(cmd, payload.context, payload.language)
        response_data = {
            "type": "ai",
            "action": None,
            "url": None,
            "query": None,
            "response": ai_text,
            "timestamp": now_iso,
            "intent": "ai_query"
        }

    # Step 3: Record to conversation history if user is logged in
    user_id = str(current_user["_id"]) if current_user else "anonymous"
    try:
        await db_manager.conversations.insert_one({
            "user_id": user_id,
            "message": cmd,
            "response": response_data["response"],
            "command_type": response_data["type"],
            "action": response_data.get("action"),
            "url": response_data.get("url"),
            "timestamp": now_iso
        })
    except Exception as e:
        print(f"[DB] Error storing conversation: {e}")

    return response_data


@router.get("/history")
async def get_history(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve chat history for the authenticated user."""
    user_id = str(current_user["_id"])
    cursor = db_manager.conversations.find({"user_id": user_id}).sort("timestamp", -1).limit(100)
    items = await cursor.to_list(100)

    # Format documents with string ID
    results = []
    for item in items:
        results.append({
            "id": str(item.get("_id", "")),
            "user_id": str(item.get("user_id")),
            "message": item.get("message", ""),
            "response": item.get("response", ""),
            "command_type": item.get("command_type", "ai"),
            "action": item.get("action"),
            "url": item.get("url"),
            "timestamp": item.get("timestamp", "")
        })
    return {"history": results}


@router.delete("/history")
async def clear_history(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Clear all chat history for current user."""
    user_id = str(current_user["_id"])
    res = await db_manager.conversations.delete_many({"user_id": user_id})
    return {"success": True, "deleted_count": getattr(res, "deleted_count", 0)}


@router.delete("/history/{item_id}")
async def delete_history_item(item_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Delete a specific conversation record."""
    user_id = str(current_user["_id"])
    res = await db_manager.conversations.delete_one({"_id": item_id, "user_id": user_id})
    if getattr(res, "deleted_count", 0) == 0:
        # Check ObjectId if using real mongo
        from bson import ObjectId
        try:
            res = await db_manager.conversations.delete_one({"_id": ObjectId(item_id), "user_id": user_id})
        except Exception:
            pass
    return {"success": True}
