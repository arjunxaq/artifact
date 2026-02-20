from fastapi import Depends, HTTPException, Header
from app.services.supabase_client import supabase

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing auth header")

    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
        return user.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")