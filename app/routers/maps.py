from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Recycler, Collector, Lot

router = APIRouter(prefix="/api/maps", tags=["Maps"])

@router.get("")
def get_map_markers(db: Session = Depends(get_db)):
    recyclers = db.query(Recycler).all()
    collectors = db.query(Collector).all()
    lots = db.query(Lot).all()

    markers = []

    for r in recyclers:
        markers.append({
            "id": r.id,
            "type": "RECYCLER",
            "title": r.name,
            "lat": r.lat or 13.0827,
            "lng": r.lng or 80.2707,
            "status": r.auth_status,
            "details": f"Auth: {r.auth_number or r.cpcb_registration_id} | {r.location} | Materials: {', '.join(r.materials_accepted or [])} | ₹{r.offered_rate}/kg"
        })

    for c in collectors:
        markers.append({
            "id": c.id,
            "type": "COLLECTOR",
            "title": f"Collector {c.id}",
            "lat": c.lat or 9.48,
            "lng": c.lng or 77.35,
            "status": c.status,
            "details": f"Operating area: {c.location} | Lots: {c.total_lots}"
        })

    for l in lots[:30]:
        markers.append({
            "id": l.id,
            "type": "LOT",
            "title": f"Lot {l.id} ({l.material})",
            "lat": l.lat or 9.46,
            "lng": l.lng or 77.32,
            "status": l.status,
            "details": f"Weight: {l.weight}kg | Est. Value: ₹{l.estimated_value}"
        })

    return markers
