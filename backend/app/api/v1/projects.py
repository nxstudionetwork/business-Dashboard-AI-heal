from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app.database.session import get_db
from app.models.project import Project, ProjectMilestone
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectMilestoneCreate, ProjectMilestoneResponse
from app.api.v1.base_crud import create_crud_router, get_current_user


def create_milestones(db: Session, project: Project, data: ProjectCreate, user_id: str):
    if data.milestones:
        for m in data.milestones:
            milestone = ProjectMilestone(
                project_id=project.id,
                title=m.title,
                description=m.description,
                due_date=m.due_date,
                status=m.status,
            )
            db.add(milestone)


router = create_crud_router(
    model=Project,
    schema_create=ProjectCreate,
    schema_update=ProjectUpdate,
    schema_response=ProjectResponse,
    id_prefix="PRO",
    number_field="project_number",
    nested_creator=create_milestones,
)


@router.get("/{project_id}/milestones", response_model=List[ProjectMilestoneResponse])
async def list_milestones(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id, Project.is_active == True).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project_id).all()


@router.post("/{project_id}/milestones", response_model=ProjectMilestoneResponse, status_code=status.HTTP_201_CREATED)
async def create_milestone(
    project_id: str,
    data: ProjectMilestoneCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id, Project.is_active == True).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    milestone = ProjectMilestone(project_id=project_id, **data.model_dump())
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone


@router.put("/{project_id}/milestones/{milestone_id}", response_model=ProjectMilestoneResponse)
async def update_milestone(
    project_id: str,
    milestone_id: str,
    data: ProjectMilestoneCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    milestone = db.query(ProjectMilestone).filter(
        ProjectMilestone.id == milestone_id, ProjectMilestone.project_id == project_id
    ).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(milestone, key, value)
    db.commit()
    db.refresh(milestone)
    return milestone


@router.delete("/{project_id}/milestones/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_milestone(
    project_id: str,
    milestone_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    milestone = db.query(ProjectMilestone).filter(
        ProjectMilestone.id == milestone_id, ProjectMilestone.project_id == project_id
    ).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    db.delete(milestone)
    db.commit()
    return None
