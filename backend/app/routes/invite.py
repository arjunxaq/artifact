from fastapi import APIRouter, HTTPException, Depends
from app.dependencies import get_current_user
from app.services.supabase_client import supabase

router = APIRouter()

@router.get("/invite/{token}")
async def verify_invite(token: str):
    response = supabase.table("contract_signees") \
        .select("*, contracts(*)") \
        .eq("invite_token", token) \
        .single() \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Invalid invite")

    return response.data


