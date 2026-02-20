from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.dependencies import get_current_user
from app.services.supabase_client import supabase
from typing import List
import time

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

    signee_rows = [
        {
            "contract_id": contract_data["id"],
            "email": email
        }
        for email in email_list
    ]

    supabase.table("contract_signees").insert(signee_rows).execute()

    return contract_data

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