from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Price

router = APIRouter(prefix="/api/prices", tags=["Prices"])

@router.get("")
def get_prices(db: Session = Depends(get_db)):
    prices = db.query(Price).all()
    items = []
    for p in prices:
        items.append({
            "material": p.material,
            "subCategory": p.sub_category,
            "location": p.location,
            "buyingPrice": p.buying_price,
            "quotedPrice": p.quoted_price,
            "unit": p.unit,
            "recycler": p.recycler,
            "lastUpdated": p.last_updated,
            "history": p.history or []
        })
    return items
