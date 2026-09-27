from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Lot, Recycler, TraceabilityEvent
from app.schemas import LotResponse

router = APIRouter(prefix="/api/lots", tags=["Lots"])

@router.get("")
def get_lots(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    material: Optional[str] = None,
    location: Optional[str] = None,
    recyclerId: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Lot)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(Lot.id.ilike(s) | Lot.material.ilike(s) | Lot.collector_id.ilike(s))
    if status:
        query = query.filter(Lot.status == status)
    if material:
        query = query.filter(Lot.material == material)
    if location:
        query = query.filter(Lot.location == location)
    if recyclerId:
        query = query.filter(Lot.recycler_id == recyclerId)

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    lots = query.offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for l in lots:
        r_name = l.recycler.name if l.recycler else None
        items.append({
            "id": l.id,
            "collectorId": l.collector_id,
            "material": l.material,
            "subCategory": l.sub_category,
            "description": l.description,
            "weight": l.weight,
            "condition": l.condition,
            "aiConfidence": l.ai_confidence,
            "estimatedValue": l.estimated_value,
            "quotedPrice": l.quoted_price,
            "finalValue": l.final_value,
            "location": l.location,
            "lat": l.lat,
            "lng": l.lng,
            "recyclerId": l.recycler_id,
            "recyclerName": r_name,
            "status": l.status,
            "createdAt": l.created_at.strftime("%Y-%m-%d %H:%M") if l.created_at else ""
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": total_pages
    }

@router.get("/{id}")
def get_lot(id: str, db: Session = Depends(get_db)):
    l = db.query(Lot).filter(Lot.id == id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lot not found")
    
    r_name = l.recycler.name if l.recycler else None
    return {
        "id": l.id,
        "collectorId": l.collector_id,
        "material": l.material,
        "subCategory": l.sub_category,
        "description": l.description,
        "weight": l.weight,
        "condition": l.condition,
        "aiConfidence": l.ai_confidence,
        "estimatedValue": l.estimated_value,
        "quotedPrice": l.quoted_price,
        "finalValue": l.final_value,
        "location": l.location,
        "lat": l.lat,
        "lng": l.lng,
        "recyclerId": l.recycler_id,
        "recyclerName": r_name,
        "status": l.status,
        "createdAt": l.created_at.strftime("%Y-%m-%d %H:%M") if l.created_at else ""
    }

@router.get("/{id}/traceability")
def get_lot_traceability(id: str, db: Session = Depends(get_db)):
    events = db.query(TraceabilityEvent).filter(TraceabilityEvent.lot_id == id).order_by(TraceabilityEvent.id.asc()).all()
    items = []
    for e in events:
        items.append({
            "id": e.id,
            "label": e.label,
            "done": e.done,
            "active": e.active,
            "timestamp": e.timestamp,
            "location": e.location,
            "weight": e.weight,
            "responsible": e.responsible
        })
    return items

@router.patch("/{id}/status")
def update_lot_status(id: str, status_payload: dict, db: Session = Depends(get_db)):
    l = db.query(Lot).filter(Lot.id == id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lot not found")
    
    new_status = status_payload.get("status")
    if new_status:
        l.status = new_status
        db.commit()
    return {"id": l.id, "status": l.status}

@router.post("/{id}/quote")
def submit_lot_quote(id: str, quote_payload: dict, db: Session = Depends(get_db)):
    l = db.query(Lot).filter(Lot.id == id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lot not found")
    
    quoted_rate = quote_payload.get("quotedRate") or quote_payload.get("quotedPrice")
    if quoted_rate:
        l.quoted_price = float(quoted_rate) * l.weight if quote_payload.get("isPerKg", True) else float(quoted_rate)
        if quote_payload.get("autoAccept"):
            l.status = "ACCEPTED"
        db.commit()
    return {
        "id": l.id,
        "quotedPrice": l.quoted_price,
        "status": l.status,
        "message": f"Quote of ₹{l.quoted_price:.2f} successfully submitted"
    }

