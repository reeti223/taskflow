from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import enum

class TaskStatusEnum(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    completed = "completed"

class TaskPriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TaskStatusEnum), default=TaskStatusEnum.todo)
    priority = Column(Enum(TaskPriorityEnum), default=TaskPriorityEnum.medium)
    project_id = Column(Integer, ForeignKey("projects.id"))
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks")
