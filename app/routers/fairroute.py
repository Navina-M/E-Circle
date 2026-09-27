import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Lot, Recycler

router = APIRouter(prefix="/api/fairroute", tags=["FairRoute"])

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    # Haversine formula for distance in km
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

@router.get("/{lot_id}")
def get_fairroute_ranking(lot_id: str, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    recyclers = db.query(Recycler).filter(Recycler.account_status == "ACTIVE").all()
    candidates = []

    lot_lat = lot.lat or 9.45
    lot_lng = lot.lng or 77.3

    for r in recyclers:
        r_lat = r.lat or 9.45
        r_lng = r.lng or 77.3
        dist = calculate_distance(lot_lat, lot_lng, r_lat, r_lng)
        
        accepts = lot.material in (r.materials_accepted or [])
        is_auth = (r.auth_status == "AUTHORIZED")
        has_pickup = bool(r.pickup_available)
        
        # FairRoute score calculation:
        # Auth: +30, Material match: +30, Pickup: +15, Rate bonus up to +15, Distance penalty
        score = 0
        if is_auth: score += 30
        if accepts: score += 35
        if has_pickup: score += 15
        
        # Distance score (max 20 points, decreasing with distance)
        dist_score = max(0, 20 - int(dist * 0.5))
        score += dist_score

        rec_data = {
            "id": r.id,
            "username": r.id,
            "name": r.name,
            "companyName": r.company_name or r.name,
            "facilityName": r.facility_name or r.name,
            "facilityAddress": r.facility_address,
            "district": r.district,
            "state": r.state,
            "pincode": r.pincode,
            "location": r.location,
            "materialsAccepted": r.materials_accepted or [],
            "eeeCategories": r.eee_categories or [],
            "authStatus": r.auth_status,
            "authNumber": r.auth_number,
            "cpcbRegistrationId": r.cpcb_registration_id,
            "cpcbRegistrationStatus": r.cpcb_registration_status,
            "spcbName": r.spcb_name,
            "processingCapacityMtPerYear": r.processing_capacity_mt_per_year,
            "offeredRate": r.offered_rate,
            "pickupAvailable": r.pickup_available,
            "serviceArea": r.service_area,
            "contact": r.contact,
            "email": r.email,
            "website": r.website,
            "accountStatus": r.account_status,
            "createdAt": r.created_at.strftime("%Y-%m-%d") if r.created_at else "2026-09-01"
        }

        candidates.append({
            "recycler": rec_data,
            "distanceKm": dist,
            "acceptsMaterial": accepts,
            "score": score
        })

    candidates.sort(key=lambda x: x["score"], reverse=True)
    return candidates
