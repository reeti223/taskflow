import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

frontend_build = os.path.join(os.path.dirname(__file__), "../frontend/build")

if os.path.exists(frontend_build):
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_build, "static")), name="static-files")

    @app.get("/{full_path:path}")
    def serve_react(full_path: str):
        index = os.path.join(frontend_build, "index.html")
        return FileResponse(index)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))