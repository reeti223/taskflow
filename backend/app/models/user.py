from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    member = "member"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.member)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owned_projects = relationship("Project", back_populates="owner")
    memberships = relationship("ProjectMember", back_populates="user")
    assigned_tasks = relationship("Task", back_populates="assignee")
