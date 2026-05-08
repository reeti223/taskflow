from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import enum

class ProjectStatusEnum(str, enum.Enum):
    active = "active"
    completed = "completed"
    archived = "archived"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(Enum(ProjectStatusEnum), default=ProjectStatusEnum.active)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="owned_projects")
    members = relationship("ProjectMember", back_populates="project")
    tasks = relationship("Task", back_populates="project")

class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String, default="member")
    joined_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="memberships")
