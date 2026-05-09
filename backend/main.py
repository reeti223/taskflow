import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import user, project, task
from app.routes import auth, projects, tasks

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Team Task Manager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)

@app.get("/health")
def health():
    return {"status": "healthy"}

BUILD_DIR = os.path.join(os.path.dirname(__file__), "../frontend/build")
STATIC_DIR = os.path.join(BUILD_DIR, "static")

if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/{full_path:path}")
async def serve_react(full_path: str):
    if full_path.startswith("api/"):
        from fastapi import HTTPException
        raise HTTPException(status_code=404)
    index_path = os.path.join(BUILD_DIR, "index.html")
    with open(index_path, "r") as f:
        content = f.read()
    return HTMLResponse(content=content)