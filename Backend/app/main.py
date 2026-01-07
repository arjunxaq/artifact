from fastapi import FastAPI

app = FastAPI(title="Artifact Contract Management API")

@app.get("/health")
def health_check():
    return {"status": "ok"}
