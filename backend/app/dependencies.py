from fastapi import Depends, HTTPException, Header
from app.services.supabase_client import supabase

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing auth header")

    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
        if hasattr(user, 'user') and user.user:
            return user.user
        
        if hasattr(user, 'data') and user.data:
            return user.data
            
        print(f"DEBUG: Auth failed for token: {token[:15]}... Response: {user}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"DEBUG: Auth exception: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")