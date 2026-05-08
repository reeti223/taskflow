from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class RoleEnum(str, Enum):
    admin = "admin"
    member = "member"

class ProjectStatusEnum(str, Enum):
    active = "active"
    completed = "completed"
    archived = "archived"

class TaskStatusEnum(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    completed = "completed"

class TaskPriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

# Auth
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.member

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Projects
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatusEnum] = None

class MemberOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    class Config:
        from_attributes = True

class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str
    owner_id: int
    created_at: datetime
    owner: UserOut
    class Config:
        from_attributes = True

class AddMemberRequest(BaseModel):
    email: str
    role: str = "member"

# Tasks
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriorityEnum = TaskPriorityEnum.medium
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatusEnum] = None
    priority: Optional[TaskPriorityEnum] = None
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None

class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: str
    project_id: int
    assignee_id: Optional[int]
    assignee: Optional[UserOut]
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Dashboard
class DashboardStats(BaseModel):
    total_projects: int
    total_tasks: int
    todo_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    overdue_tasks: int
