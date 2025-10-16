from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.sales import router as sales 
from api.routes.model import router as models

app = FastAPI(title="AI Sales Advisor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sales, prefix="/sales", tags=["sales"])
app.include_router(models, prefix="/models", tags=["models"])

# Healthcheck simple (opcional)
@app.get("/health")
def health():
    return {"status": "ok"}
