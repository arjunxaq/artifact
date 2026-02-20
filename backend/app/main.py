from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import contracts
from app.routes import invite

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contracts.router, prefix="/api")
app.include_router(invite.router,prefix="/api")