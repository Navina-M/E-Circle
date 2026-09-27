import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.seed import seed_database
from app.routers import (
    auth,
    admin,
    recyclers,
    lots,
    transactions,
    prices,
    maps,
    fairroute,
    ai,
    notifications
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ecircle_backend")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack REST API backend for E-CIRCLE Recycler & Admin Portal with PostgreSQL, JWT Auth, FairRoute, and AI Material Classification.",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(recyclers.router)
app.include_router(lots.router)
app.include_router(transactions.router)
app.include_router(prices.router)
app.include_router(maps.router)
app.include_router(fairroute.router)
app.include_router(ai.router)
app.include_router(notifications.router)

@app.on_event("startup")
def startup_event():
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Running initial dataset import/seed...")
        seed_result = seed_database()
        logger.info(f"Database seed result: {seed_result}")
    except Exception as e:
        logger.error(f"Error during startup database initialization: {e}")

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
