import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

rental_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.5; margin: 40px; color: #222; }
        .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 26px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        .section { margin-bottom: 25px; page-break-inside: avoid; }
        .section h2 { font-size: 16px; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #444; }
        .content { margin-left: 10px; }
        .field { margin-bottom: 8px; }
        .field strong { min-width: 150px; display: inline-block; }
        .signature-section { margin-top: 60px; display: flex; justify-content: space-between; }
        .sig-block { width: 45%; border-top: 1px solid #222; padding-top: 10px; }
        .sig-block p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Comprehensive Rental Agreement</h1>
        <p>Executed on <strong>{{ agreement_date }}</strong></p>
    </div>

    <div class="section">
        <h2>1. The Parties</h2>
        <div class="content">
            <p>This agreement is entered into by and between:</p>
            <div class="field"><strong>Landlord:</strong> {{ landlord_name }}, residing at {{ landlord_address }}</div>
            <div class="field"><strong>Tenant:</strong> {{ tenant_name }}, residing at prior address: {{ tenant_prior_address }}</div>
        </div>
    </div>

    <div class="section">
        <h2>2. The Premises</h2>
        <div class="content">
            <p>The Landlord agrees to lease the premises located at:</p>
            <p><strong>{{ property_address }}</strong></p>
            <p>Description: {{ property_description }}</p>
        </div>
    </div>

    <div class="section">
        <h2>3. Term of Lease</h2>
        <div class="content">
            <div class="field"><strong>Lease Term:</strong> {{ lease_term_months }} months</div>
            <div class="field"><strong>Start Date:</strong> {{ lease_start_date }}</div>
            <div class="field"><strong>End Date:</strong> {{ lease_end_date }}</div>
            <p>Any holdover after this term will result in a month-to-month tenancy under the same conditions unless notified otherwise.</p>
        </div>
    </div>

    <div class="section">
        <h2>4. Financial Terms</h2>
        <div class="content">
            <div class="field"><strong>Monthly Rent:</strong> ${{ monthly_rent }}</div>
            <div class="field"><strong>Rent Due Date:</strong> On the {{ rent_due_day }} of each month</div>
            <div class="field"><strong>Late Fee:</strong> ${{ late_fee_amount }} applied after {{ late_grace_period_days }} days</div>
            <div class="field"><strong>Security Deposit:</strong> ${{ security_deposit }}</div>
            <p>The security deposit will be held by the Landlord and returned within {{ deposit_return_days }} days of the end of the tenancy, minus any deductions for damages.</p>
        </div>
    </div>

    <div class="section">
        <h2>5. Utilities & Maintenance</h2>
        <div class="content">
            <div class="field"><strong>Tenant's Responsibilities:</strong> {{ tenant_utilities }}</div>
            <div class="field"><strong>Landlord's Responsibilities:</strong> {{ landlord_utilities }}</div>
            <p><strong>Maintenance rules:</strong> {{ maintenance_terms }}</p>
        </div>
    </div>

    <div class="section">
        <h2>6. Additional Terms & Conditions</h2>
        <div class="content">
            <p>{{ additional_terms }}</p>
            <p>The tenant agrees not to use the premises for any unlawful purposes and to respect the neighbors' right to quiet enjoyment.</p>
        </div>
    </div>

    <div class="signature-section">
        <div class="sig-block">
            <p>{{ landlord_name }} (Landlord)</p>
            <br/><br/>
            <p>Signature: ______________________</p>
            <p>Date: ______________________</p>
        </div>
        <div class="sig-block">
            <p>{{ tenant_name }} (Tenant)</p>
            <br/><br/>
            <p>Signature: ______________________</p>
            <p>Date: ______________________</p>
        </div>
    </div>
</body>
</html>
"""

# Check if it already exists to update it or insert new one
res = supabase.table("templates").select("id").eq("name", "Comprehensive Rental Agreement").execute()

if res.data:
    supabase.table("templates").update({"html_content": rental_html}).eq("id", res.data[0]["id"]).execute()
    print("Updated existing template.")
else:
    supabase.table("templates").insert({"name": "Comprehensive Rental Agreement", "html_content": rental_html}).execute()
    print("Inserted new template.")
