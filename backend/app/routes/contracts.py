from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from app.dependencies import get_current_user
from app.services.supabase_client import supabase
from typing import List
import time

import uuid


router = APIRouter()

@router.post("/contracts/link")
async def link_contracts(user=Depends(get_current_user)):

    supabase.table("contract_signees") \
        .update({"user_id": user.id}) \
        .eq("email", user.email) \
        .is_("user_id", None) \
        .execute()

    return {"message": "Contracts linked"}


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
        signee_rows.append({
            "contract_id": contract_data["id"],
            "email": email,
            "status": "pending",
            "user_id": None
        })

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
            signed_at,
            rejected_at,
            contracts_with_creator (
                id,
                title,
                created_at,
                owner_email
            )
        """) \
        .eq("user_id", user.id) \
        .execute()

    return response.data





#fetch contracts
@router.get("/contracts")
async def get_my_contracts(user=Depends(get_current_user)):

    response = supabase.table("contracts_with_creator") \
        .select("""
            id,
            title,
            created_at,
            owner_id,
            owner_email,
            contract_signees (
                id,
                email,
                status,
                signed_at,
                rejected_at
            )
        """) \
        .eq("owner_id", user.id) \
        .order("created_at", desc=True) \
        .execute()

    return response.data


#sign in contract modal
@router.post("/contracts/{signee_id}/sign")
async def sign_contract(signee_id: str, user=Depends(get_current_user)):

    # Ensure this signee belongs to logged in user
    signee = supabase.table("contract_signees") \
        .select("*") \
        .eq("id", signee_id) \
        .eq("user_id", user.id) \
        .single() \
        .execute()

    if not signee.data:
        raise HTTPException(status_code=403, detail="Not allowed")

    supabase.table("contract_signees") \
        .update({
            "status": "signed",
            "signed_at": "now()"
        }) \
        .eq("id", signee_id) \
        .execute()

    return {"message": "Contract signed"}


#reject contract inside contract modal
@router.post("/contracts/{signee_id}/reject")
async def reject_contract(signee_id: str, user=Depends(get_current_user)):

    signee = supabase.table("contract_signees") \
        .select("*") \
        .eq("id", signee_id) \
        .eq("user_id", user.id) \
        .single() \
        .execute()

    if not signee.data:
        raise HTTPException(status_code=403, detail="Not allowed")

    supabase.table("contract_signees") \
        .update({
            "status": "rejected",
            "rejected_at": "now()"
        }) \
        .eq("id", signee_id) \
        .execute()

    return {"message": "Contract rejected"}

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