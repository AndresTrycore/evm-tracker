from app.api.v1 import activities, projects
from fastapi import APIRouter

api_router = APIRouter()

api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(
    activities.router, prefix="/projects/{project_id}/activities", tags=["activities"]
)

