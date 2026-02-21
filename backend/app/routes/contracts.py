from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from app.dependencies import get_current_user
from app.services.supabase_client import supabase
from typing import List
import time

import uuid
from app.services.email_service import send_invite_email

router = APIRouter()

#create contracts
@router.post("/contracts")
async def create_contract(
    title: str = Form(...),
    emails: str = Form(...),  # comma separated
    file: UploadFile = File(...),
    user = Depends(get_current_user)
):
    owner_id = user.id

    # 1. Upload file
    file_path = f"{owner_id}/{int(time.time())}_{file.filename}"

    file_bytes = await file.read()

    supabase.storage.from_("contracts").upload(
        file_path,
        file_bytes
    )

    # 2. Insert contract
    contract = supabase.table("contracts").insert({
        "title": title,
        "owner_id": owner_id,
        "file_path": file_path
    }).execute()

    contract_data = contract.data[0]

    # 3. Insert signees
    email_list = [e.strip() for e in emails.split(",")]

    signee_rows = []

    for email in email_list:
        invite_token = str(uuid.uuid4())

        signee_rows.append({
            "contract_id": contract_data["id"],
            "email": email,
            "status": "pending",
            "invite_token": invite_token
        })

        # Send email
        send_invite_email(email, invite_token, title)

    supabase.table("contract_signees").insert(signee_rows).execute()

    return contract_data

@router.get("/contracts/{contract_id}/file")
async def get_contract_file(contract_id: str, user=Depends(get_current_user)):
    
    contract = supabase.table("contracts") \
        .select("*") \
        .eq("id", contract_id) \
        .single() \
        .execute()

    file_path = contract.data["file_path"]

    signed_url = supabase.storage.from_("contracts") \
        .create_signed_url(file_path, 60)

    return signed_url

#to fetch teh contracts that are assigned to the user
@router.get("/contracts/assigned")
async def get_assigned_contracts(user=Depends(get_current_user)):
    
    response = supabase.table("contract_signees") \
        .select("""
            id,
            status,
            contracts (
                id,
                title,
                created_at,
                owner_id
            )
        """) \
        .or_(f"user_id.eq.{user.id},email.eq.{user.email}") \
        .execute()

    return response.data



#fetch contracts
@router.get("/contracts")
async def get_my_contracts(user = Depends(get_current_user)):
    owner_id = user.id

    response = supabase.table("contracts") \
        .select("""
            id,
            title,
            created_at,
            contract_signees (
                id,
                email,
                status
            )
        """) \
        .eq("owner_id", owner_id) \
        .order("created_at", desc=True) \
        .execute()

    return response.data

#sign contract
@router.post("/sign/{token}")
async def sign_contract(token: str, user=Depends(get_current_user)):

    signee = supabase.table("contract_signees") \
        .select("*") \
        .eq("invite_token", token) \
        .single() \
        .execute()

    if not signee.data:
        raise HTTPException(status_code=404)

    supabase.table("contract_signees") \
        .update({
            "status": "signed",
            "user_id": user.id
        }) \
        .eq("invite_token", token) \
        .execute()

    return {"message": "Signed successfully"}

#reject contract
@router.post("/reject/{token}")
async def reject_contract(token: str, user=Depends(get_current_user)):

    signee = supabase.table("contract_signees") \
        .select("*") \
        .eq("invite_token", token) \
        .single() \
        .execute()

    if not signee.data:
        raise HTTPException(status_code=404)

    supabase.table("contract_signees") \
        .update({
            "status": "rejected",
            "user_id": user.id
        }) \
        .eq("invite_token", token) \
        .execute()

    return {"message": "Rejected successfully"}