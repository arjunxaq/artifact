import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

response = supabase.table("templates").select("*").execute()
with open("templates.json", "w", encoding="utf-8") as f:
    json.dump(response.data, f, indent=2)
