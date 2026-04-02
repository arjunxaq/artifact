import os
from dotenv import load_dotenv
from upstash_redis import Redis

load_dotenv()

UPSTASH_URL = os.getenv("UPSTASH_REDIS_REST_URL")
UPSTASH_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN")

redis_client = None

if UPSTASH_URL and UPSTASH_TOKEN:
    redis_client = Redis(url=UPSTASH_URL, token=UPSTASH_TOKEN)
