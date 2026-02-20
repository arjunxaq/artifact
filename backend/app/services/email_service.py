import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL")


def send_invite_email(email: str, invite_token: str, contract_title: str):
    invite_link = f"{FRONTEND_URL}/invite/{invite_token}"

    resend.Emails.send({
        "from": "contracts@yourdomain.com",
        "to": email,
        "subject": f"You’ve been invited to sign: {contract_title}",
        "html": f"""
        <h2>Contract Signing Invitation</h2>
        <p>You have been invited to sign <b>{contract_title}</b>.</p>
        <p>Click below to review and sign:</p>
        <a href="{invite_link}">{invite_link}</a>
        """
    })