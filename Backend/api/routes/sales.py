from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.sale_service import SaleService
from database import get_db

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Devuelve el resumen del dashboard de ventas."""
    return SaleService.getDashboardSummary(db)
