from sqlalchemy import Column, Integer, String, Date, Numeric, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Sale(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, index=True, nullable=True)
    client_category = Column(String, nullable=True)
    product_code = Column(String, index=True, nullable=False)
    product_name = Column(String, nullable=True)
    product_brand = Column(String, nullable=True)
    price = Column(Numeric(12, 2), nullable=False)
    price_retail = Column(Numeric(12, 2), nullable=False)
    car_brand = Column(String, nullable=True)
    car_model = Column(String, nullable=True)
    car_year = Column(Integer, nullable=True)
    drivetrain = Column(String, nullable=True)
    car_transmission = Column(String, nullable=True)
    sale_date = Column(Date, nullable=False)
    quantity = Column(Integer, nullable=False)
    exchange_rate = Column(Numeric(12, 4), nullable=True)
    total = Column(Numeric(14, 2), nullable=True)
    description = Column(Text, nullable=True)
