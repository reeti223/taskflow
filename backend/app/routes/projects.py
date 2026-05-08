from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.project import Project, ProjectMember
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectOut, AddMemberRequest

router = APIRouter(prefix="/api/projects", tags=["projects"])

def check_project_access(project_id: int, user: User, db: Session, require_admin: bool = False):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    is_owner = project.owner_id == user.id
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id
    ).first()
    if not is_owner and not is_member:
        raise HTTPException(status_code=403, detail="Access denied")
    if require_admin and not is_owner and user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return project

@router.post("/", response_model=ProjectOut)
def create_project(data: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = Project(name=data.name, description=data.description, owner_id=current_user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/", response_model=List[ProjectOut])
def get_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        return db.query(Project).all()
    owned = db.query(Project).filter(Project.owner_id == current_user.id).all()
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    member_project_ids = [m.project_id for m in memberships]
    member_projects = db.query(Project).filter(Project.id.in_(member_project_ids)).all()
    all_projects = {p.id: p for p in owned + member_projects}
    return list(all_projects.values())

@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return check_project_access(project_id, current_user, db)

@router.put("/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = check_project_access(project_id, current_user, db, require_admin=True)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = check_project_access(project_id, current_user, db, require_admin=True)
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}

@router.post("/{project_id}/members")
def add_member(project_id: int, data: AddMemberRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_project_access(project_id, current_user, db, require_admin=True)
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already a member")
    member = ProjectMember(project_id=project_id, user_id=user.id, role=data.role)
    db.add(member)
    db.commit()
    return {"message": f"{user.name} added to project"}

@router.get("/{project_id}/members")
def get_members(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_project_access(project_id, current_user, db)
    project = db.query(Project).filter(Project.id == project_id).first()
    members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    result = [{"id": project.owner.id, "name": project.owner.name, "email": project.owner.email, "role": "owner"}]
    for m in members:
        result.append({"id": m.user.id, "name": m.user.name, "email": m.user.email, "role": m.role})
    return result

@router.delete("/{project_id}/members/{user_id}")
def remove_member(project_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_project_access(project_id, current_user, db, require_admin=True)
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"message": "Member removed"}
