from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.project import Project, ProjectMember
from app.models.task import Task
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskOut, DashboardStats

router = APIRouter(prefix="/api", tags=["tasks"])

def check_project_access(project_id: int, user: User, db: Session):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    is_owner = project.owner_id == user.id
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id
    ).first()
    if not is_owner and not is_member and user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return project

@router.post("/projects/{project_id}/tasks", response_model=TaskOut)
def create_task(project_id: int, data: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_project_access(project_id, current_user, db)
    task = Task(
        title=data.title,
        description=data.description,
        priority=data.priority,
        project_id=project_id,
        assignee_id=data.assignee_id,
        due_date=data.due_date
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/projects/{project_id}/tasks", response_model=List[TaskOut])
def get_tasks(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_project_access(project_id, current_user, db)
    return db.query(Task).filter(Task.project_id == project_id).all()

@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    check_project_access(task.project_id, current_user, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    check_project_access(task.project_id, current_user, db)
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        projects = db.query(Project).all()
        project_ids = [p.id for p in projects]
    else:
        owned = db.query(Project).filter(Project.owner_id == current_user.id).all()
        memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
        member_ids = [m.project_id for m in memberships]
        member_projects = db.query(Project).filter(Project.id.in_(member_ids)).all()
        all_projects = {p.id: p for p in owned + member_projects}
        projects = list(all_projects.values())
        project_ids = list(all_projects.keys())

    tasks = db.query(Task).filter(Task.project_id.in_(project_ids)).all() if project_ids else []
    now = datetime.utcnow()

    return {
        "total_projects": len(projects),
        "total_tasks": len(tasks),
        "todo_tasks": sum(1 for t in tasks if t.status == "todo"),
        "in_progress_tasks": sum(1 for t in tasks if t.status == "in_progress"),
        "completed_tasks": sum(1 for t in tasks if t.status == "completed"),
        "overdue_tasks": sum(1 for t in tasks if t.due_date and t.due_date < now and t.status != "completed"),
    }

@router.get("/my-tasks", response_model=List[TaskOut])
def get_my_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Task).filter(Task.assignee_id == current_user.id).all()
