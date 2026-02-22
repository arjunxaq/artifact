from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from app.dependencies import get_current_user
from app.services.supabase_client import supabase
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from app.services.key_service import decrypt_private_key
from app.services.template_service import render_template_to_pdf
from app.services.key_service import generate_rsa_key_pair
from typing import List
import time
import os
import uuid
import hashlib
import json
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature
import tempfile


router = APIRouter()

@router.post("/contracts/link")
async def link_contracts(user=Depends(get_current_user)):

    supabase.table("contract_signees") \
        .update({"user_id": user.id}) \
        .eq("email", user.email) \
        .is_("user_id", None) \
        .execute()

    return {"message": "Contracts linked"}




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
            status,
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

#sign in contract modal
@router.post("/contracts/{signee_id}/sign")
async def sign_contract(signee_id: str, user=Depends(get_current_user)):

    # 1️⃣ Verify signee belongs to user
    signee = supabase.table("contract_signees") \
        .select("*") \
        .eq("id", signee_id) \
        .eq("user_id", user.id) \
        .single() \
        .execute()

    if not signee.data:
        raise HTTPException(status_code=403, detail="Not allowed")

    if signee.data["status"] != "pending":
        raise HTTPException(status_code=400, detail="Already processed")

    contract_id = signee.data["contract_id"]

    # 2️⃣ Fetch contract
    contract = supabase.table("contracts") \
        .select("*") \
        .eq("id", contract_id) \
        .single() \
        .execute()

    if not contract.data:
        raise HTTPException(status_code=404, detail="Contract not found")

    if contract.data["status"] == "REJECTED":
        raise HTTPException(status_code=400, detail="Contract rejected")

    pdf_hash = contract.data["pdf_hash"]

    # 3️⃣ Fetch user private key
    key_record = supabase.table("user_keys") \
        .select("*") \
        .eq("user_id", user.id) \
        .single() \
        .execute()

    if not key_record.data:
        raise HTTPException(status_code=400, detail="Keys not initialized")

    encrypted_private_key = key_record.data["encrypted_private_key"]

    private_key = decrypt_private_key(encrypted_private_key)

    # 4️⃣ Sign the hash using RSA-PSS
    signature = private_key.sign(
        pdf_hash.encode(),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    # 5️⃣ Store signature
    supabase.table("signatures").insert({
        "contract_id": contract_id,
        "signer_id": user.id,
        "signature_value": signature.hex(),
        "signed_hash": pdf_hash,
        "algorithm": "RSA-PSS-SHA256"
    }).execute()

    # 6️⃣ Update signee status
    supabase.table("contract_signees") \
        .update({
            "status": "signed",
            "signed_at": "now()"
        }) \
        .eq("id", signee_id) \
        .execute()

    # 7️⃣ Check if all signers signed
    all_signees = supabase.table("contract_signees") \
        .select("*") \
        .eq("contract_id", contract_id) \
        .execute()

    statuses = [s["status"] for s in all_signees.data]

    if all(status == "signed" for status in statuses):
        supabase.table("contracts") \
            .update({"status": "SIGNED"}) \
            .eq("id", contract_id) \
            .execute()
    else:
        supabase.table("contracts") \
            .update({"status": "PARTIALLY_SIGNED"}) \
            .eq("id", contract_id) \
            .execute()

    return {"message": "Digital signature stored"}


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

    contract_id = signee.data["contract_id"]

    # Update signee
    supabase.table("contract_signees") \
        .update({
            "status": "rejected",
            "rejected_at": "now()"
        }) \
        .eq("id", signee_id) \
        .execute()

    # Entire contract becomes rejected
    supabase.table("contracts") \
        .update({"status": "REJECTED"}) \
        .eq("id", contract_id) \
        .execute()

    return {"message": "Contract rejected"}
#create contracts




@router.post("/contracts")
async def create_contract(
    title: str = Form(...),
    emails: str = Form(...),
    template_id: str = Form(None),
    template_data: str = Form(None),
    file: UploadFile = File(None),
    user=Depends(get_current_user),
):

    owner_id = user.id

    # -----------------------------
    # TEMPLATE MODE
    # -----------------------------
    if template_id:

        template_response = supabase.table("templates") \
            .select("*") \
            .eq("id", template_id) \
            .single() \
            .execute()

        if not template_response.data:
            raise HTTPException(status_code=404, detail="Template not found")

        html_content = template_response.data["html_content"]

        context = json.loads(template_data)

        temp_pdf_path, pdf_hash = render_template_to_pdf(
            html_content,
            context
        )

        file_path = f"{owner_id}/{int(time.time())}.pdf"

        with open(temp_pdf_path, "rb") as f:
            supabase.storage.from_("contracts").upload(
                file_path,
                f.read(),
                {"content-type": "application/pdf"}
            )

        os.remove(temp_pdf_path)

    # -----------------------------
    # CUSTOM UPLOAD MODE
    # -----------------------------
    elif file:

        file_bytes = await file.read()

        pdf_hash = hashlib.sha256(file_bytes).hexdigest()

        file_path = f"{owner_id}/{int(time.time())}_{file.filename}"

        supabase.storage.from_("contracts").upload(
            file_path,
            file_bytes,
            {"content-type": "application/pdf"}
        )

    else:
        raise HTTPException(
            status_code=400,
            detail="Provide template_id or file"
        )

    # -----------------------------
    # CREATE CONTRACT RECORD
    # -----------------------------
    contract = supabase.table("contracts").insert({
        "title": title,
        "owner_id": owner_id,
        "template_id": template_id,
        "file_path": file_path,
        "pdf_hash": pdf_hash,
        "status": "PENDING"
    }).execute()

    contract_data = contract.data[0]

    # -----------------------------
    # INSERT SIGNEES
    # -----------------------------
    email_list = [e.strip() for e in emails.split(",")]

    signee_rows = [
        {
            "contract_id": contract_data["id"],
            "email": email,
            "status": "pending"
        }
        for email in email_list
    ]

    supabase.table("contract_signees").insert(signee_rows).execute()

    return contract_data


@router.post("/keys/init")
async def initialize_user_keys(user=Depends(get_current_user)):

    existing = supabase.table("user_keys") \
        .select("*") \
        .eq("user_id", user.id) \
        .execute()

    if existing.data:
        return {"message": "Keys already exist"}

    public_key, encrypted_private_key = generate_rsa_key_pair()

    supabase.table("user_keys").insert({
        "user_id": user.id,
        "public_key": public_key,
        "encrypted_private_key": encrypted_private_key
    }).execute()

    return {"message": "Keys generated"}


@router.get("/templates")
async def get_templates(user=Depends(get_current_user)):
    response = supabase.table("templates") \
        .select("id, name, html_content") \
        .execute()

    return response.data




@router.get("/contracts/{contract_id}/verify")
async def verify_contract(contract_id: str, user=Depends(get_current_user)):

    # 1️⃣ Fetch contract
    contract = supabase.table("contracts") \
        .select("*") \
        .eq("id", contract_id) \
        .single() \
        .execute()

    if not contract.data:
        raise HTTPException(status_code=404, detail="Contract not found")

    stored_hash = contract.data["pdf_hash"]
    file_path = contract.data["file_path"]

    # 2️⃣ Download PDF from Supabase storage
    file_response = supabase.storage.from_("contracts").download(file_path)

    if not file_response:
        raise HTTPException(status_code=404, detail="File not found")

    file_bytes = file_response

    # 3️⃣ Recompute SHA256
    recomputed_hash = hashlib.sha256(file_bytes).hexdigest()

    hash_valid = (recomputed_hash == stored_hash)

    # 4️⃣ Fetch signatures
    signatures = supabase.table("signatures") \
        .select("*") \
        .eq("contract_id", contract_id) \
        .execute()

    signature_results = []

    all_valid = True

    for sig in signatures.data:

        signer_id = sig["signer_id"]
        signature_value = bytes.fromhex(sig["signature_value"])
        signed_hash = sig["signed_hash"]

        # Load public key
        key_record = supabase.table("user_keys") \
            .select("public_key") \
            .eq("user_id", signer_id) \
            .single() \
            .execute()

        if not key_record.data:
            signature_results.append({
                "signer_id": signer_id,
                "valid": False,
                "reason": "Public key not found"
            })
            all_valid = False
            continue

        public_key = serialization.load_pem_public_key(
            key_record.data["public_key"].encode()
        )

        try:
            public_key.verify(
                signature_value,
                signed_hash.encode(),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )

            signature_results.append({
                "signer_id": signer_id,
                "valid": True
            })

        except InvalidSignature:
            signature_results.append({
                "signer_id": signer_id,
                "valid": False,
                "reason": "Signature mismatch"
            })
            all_valid = False

    return {
        "hash_valid": hash_valid,
        "signature_count": len(signatures.data),
        "all_signatures_valid": all_valid,
        "signatures": signature_results
    }