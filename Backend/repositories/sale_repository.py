from sqlalchemy.orm import Session
from models.sale_model import Sale
from datetime import date

class SaleRepository:

    @staticmethod
    def get_all(db: Session):
        """Obtiene todos las ventas"""
        return db.query(Sale).all()
    
    @staticmethod
    def get_all_by_range(db: Session, startdate: date, enddate: date):
        """Obtiene todas las ventas usando rango de fechas"""
        return db.query(Sale).filter(Sale.sale_date >= startdate, Sale.sale_date <= enddate).all()
