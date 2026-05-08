from fastapi import FastAPI
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

@app.get("/")
def root():
    return {"message": "Team Task Manager API is running!"}

@app.get("/health")
def health():
    return {"status": "healthy"}
