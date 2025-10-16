from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.model_service import ModelService
from database import get_db

router = APIRouter()

@router.get("/build")
def build_models(db: Session = Depends(get_db)):
    return ModelService.build_models(db)

@router.get("/predict")
def predict(db: Session = Depends(get_db)):
    return ModelService.predict(db)

