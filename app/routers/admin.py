import random
import string
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Recycler, Collector, Lot, Transaction, ActivityLog
from app.schemas import RecyclerCreate, RecyclerStatusUpdate
from app.auth.security import get_password_hash, generate_strong_password, validate_strong_password
from app.auth.dependencies import require_admin
from app.seed import seed_database

router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(require_admin)])

def paginate_query(query, page: int = 1, page_size: int = 10):
    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total, total_pages

@router.get("/dashboard")
def get_admin_dashboard(db: Session = Depends(get_db)):
    total_collectors = db.query(Collector).count()
    active_collectors = db.query(Collector).filter(Collector.status == "ACTIVE").count()
    total_recyclers = db.query(Recycler).count()
    active_recyclers = db.query(Recycler).filter(Recycler.account_status == "ACTIVE").count()
    
    lots = db.query(Lot).all()
    total_lots = len(lots)
    pending_requests = sum(1 for l in lots if l.status == "REQUESTED")
    completed_handovers = sum(1 for l in lots if l.status in ["HANDED_OVER", "PAYMENT_PENDING", "COMPLETED"])
    completed_lots = sum(1 for l in lots if l.status == "COMPLETED")
    
    total_weight = sum(l.weight for l in lots)
    estimated_value = sum(l.estimated_value for l in lots)
    
    transactions = db.query(Transaction).all()
    total_transactions = len(transactions)
    pending_payments = sum(1 for t in transactions if t.payment_status == "PENDING")

    # Material distribution
    mat_counts = {}
    for l in lots:
        mat_counts[l.material] = mat_counts.get(l.material, 0) + 1
    material_dist = [{"name": k, "value": v} for k, v in mat_counts.items()]

    # Lot status distribution
    status_counts = {}
    for l in lots:
        status_counts[l.status] = status_counts.get(l.status, 0) + 1
    lot_status_dist = [{"name": k, "value": v} for k, v in status_counts.items()]

    # Monthly trends
    months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    collection_trend = [{"month": m, "value": int(30 + i * 15 + random.randint(-5, 5))} for i, m in enumerate(months)]
    transaction_trend = [{"month": m, "value": int(20 + i * 12 + random.randint(-4, 4))} for i, m in enumerate(months)]

    return {
        "kpis": {
            "totalCollectors": total_collectors,
            "activeCollectors": active_collectors,
            "totalRecyclers": total_recyclers,
            "activeRecyclers": active_recyclers,
            "totalLots": total_lots,
            "pendingRequests": pending_requests,
            "completedHandovers": completed_handovers,
            "totalTransactions": total_transactions,
            "todaysCollections": 7,
            "todaysTransactions": 4,
            "pendingPayments": pending_payments,
            "totalWeight": f"{total_weight:.1f}",
            "estimatedValue": estimated_value,
            "completedLots": completed_lots,
        },
        "collectionTrend": collection_trend,
        "materialDistribution": material_dist,
        "transactionTrend": transaction_trend,
        "lotStatus": lot_status_dist,
    }

def serialize_recycler(r):
    return {
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
        "lat": r.lat,
        "lng": r.lng,
        "materialsAccepted": r.materials_accepted or [],
        "eeeCategories": r.eee_categories or [],
        "authStatus": r.auth_status,
        "authNumber": r.auth_number,
        "cpcbRegistrationId": r.cpcb_registration_id or r.auth_number,
        "cpcbRegistrationStatus": r.cpcb_registration_status,
        "registrationDate": r.registration_date,
        "registrationValidUntil": r.registration_valid_until,
        "spcbName": r.spcb_name,
        "verificationStatus": r.verification_status,
        "processingCapacityMtPerYear": r.processing_capacity_mt_per_year,
        "offeredRate": r.offered_rate,
        "priceMaterial": r.price_material,
        "minimumQuantityKg": r.minimum_quantity_kg,
        "pickupCharge": r.pickup_charge,
        "pickupAvailable": r.pickup_available,
        "serviceArea": r.service_area,
        "contact": r.contact,
        "contactPerson": r.contact_person,
        "officialPhone": r.contact,
        "email": r.email,
        "officialEmail": r.email,
        "website": r.website,
        "matchScore": r.match_score,
        "verificationScore": r.verification_score,
        "dataConfidence": r.data_confidence,
        "sourceName": r.source_name,
        "sourceUrl": r.source_url,
        "accountStatus": r.account_status,
        "createdAt": r.created_at.strftime("%Y-%m-%d") if r.created_at else "2026-09-01"
    }

@router.get("/recyclers")
def get_recyclers(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Recycler)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            Recycler.name.ilike(s) | 
            Recycler.id.ilike(s) | 
            Recycler.location.ilike(s) |
            Recycler.district.ilike(s) |
            Recycler.state.ilike(s) |
            Recycler.cpcb_registration_id.ilike(s)
        )
    if status:
        query = query.filter(Recycler.account_status == status)
    if location:
        query = query.filter(Recycler.location.ilike(f"%{location}%") | Recycler.district.ilike(f"%{location}%"))

    recyclers, total, total_pages = paginate_query(query, page, page_size)

    items = [serialize_recycler(r) for r in recyclers]

    return {
        "items": items,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": total_pages
    }

@router.get("/recyclers/{id}")
def get_recycler(id: str, db: Session = Depends(get_db)):
    r = db.query(Recycler).filter(Recycler.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recycler not found")
    return serialize_recycler(r)

@router.post("/recyclers")
def create_recycler(payload: RecyclerCreate, db: Session = Depends(get_db)):
    count = db.query(Recycler).count()
    rec_id = f"REC-2026-{str(count + 1).zfill(6)}"
    raw_password = generate_strong_password(12)

    user = User(
        id=f"usr-{rec_id.lower()}",
        username=rec_id,
        password_hash=get_password_hash(raw_password),
        role="RECYCLER",
        is_active=True
    )
    db.add(user)

    recycler = Recycler(
        id=rec_id,
        user_id=user.id,
        name=payload.name,
        location=payload.location,
        lat=payload.lat or 9.45,
        lng=payload.lng or 77.3,
        materials_accepted=payload.materialsAccepted,
        auth_status=payload.authStatus or "AUTHORIZED",
        auth_number=payload.authNumber or f"TNPCB-AUTH-{2000 + count}",
        offered_rate=payload.offeredRate or 150.0,
        pickup_available=payload.pickupAvailable if payload.pickupAvailable is not None else True,
        service_area=payload.serviceArea or "15 km radius",
        contact=payload.contact or "+91 9900000000",
        email=payload.email or f"contact@{rec_id.lower()}.in",
        account_status="ACTIVE"
    )
    db.add(recycler)
    db.commit()
    db.refresh(recycler)

    record = {
        "id": recycler.id,
        "username": recycler.id,
        "name": recycler.name,
        "location": recycler.location,
        "materialsAccepted": recycler.materials_accepted,
        "authStatus": recycler.auth_status,
        "accountStatus": recycler.account_status,
        "createdAt": datetime.date.today().isoformat()
    }

    return {
        "record": record,
        "generatedPassword": raw_password
    }

@router.patch("/recyclers/{id}/status")
def update_recycler_status(id: str, payload: RecyclerStatusUpdate, db: Session = Depends(get_db)):
    r = db.query(Recycler).filter(Recycler.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recycler not found")
    r.account_status = payload.accountStatus
    if r.user:
        r.user.is_active = (payload.accountStatus == "ACTIVE")
    db.commit()
    return {"id": r.id, "accountStatus": r.account_status}

@router.delete("/recyclers/{id}")
def delete_recycler(id: str, db: Session = Depends(get_db)):
    r = db.query(Recycler).filter(Recycler.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recycler not found")
    
    # Soft delete / deactivate user account to preserve historical transactions
    r.account_status = "INACTIVE"
    if r.user:
        r.user.is_active = False
    db.commit()
    return {"deleted": True, "id": id}

@router.post("/import-recyclers")
def import_recyclers(db: Session = Depends(get_db)):
    result = seed_database(db)
    return result

@router.get("/collectors")
def get_collectors(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Collector)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(Collector.id.ilike(s) | Collector.location.ilike(s))
    
    collectors, total, total_pages = paginate_query(query, page, page_size)
    items = []
    for c in collectors:
        items.append({
            "id": c.id,
            "language": c.language,
            "location": c.location,
            "totalLots": c.total_lots,
            "totalTransactions": c.total_transactions,
            "totalEarnings": c.total_earnings,
            "status": c.status,
            "lastActivity": c.last_activity
        })
    return {
        "items": items,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": total_pages
    }

@router.get("/collectors/{id}")
def get_collector(id: str, db: Session = Depends(get_db)):
    collector = db.query(Collector).filter(Collector.id == id).first()
    if not collector:
        raise HTTPException(status_code=404, detail="Collector not found")
    
    lots = db.query(Lot).filter(Lot.collector_id == id).all()
    lots_list = []
    for l in lots:
        lots_list.append({
            "id": l.id,
            "collectorId": l.collector_id,
            "material": l.material,
            "weight": l.weight,
            "estimatedValue": l.estimated_value,
            "quotedPrice": l.quoted_price,
            "finalValue": l.final_value,
            "status": l.status,
            "location": l.location,
            "createdAt": l.created_at.strftime("%Y-%m-%d %H:%M") if l.created_at else ""
        })

    return {
        "collector": {
            "id": collector.id,
            "language": collector.language,
            "location": collector.location,
            "totalLots": collector.total_lots,
            "totalTransactions": collector.total_transactions,
            "totalEarnings": collector.total_earnings,
            "status": collector.status,
            "lastActivity": collector.last_activity
        },
        "lots": lots_list
    }

@router.get("/activity")
def get_activity(page: int = 1, page_size: int = 10, db: Session = Depends(get_db)):
    query = db.query(ActivityLog).order_by(ActivityLog.created_at.desc())
    logs, total, total_pages = paginate_query(query, page, page_size)
    items = []
    for a in logs:
        items.append({
            "id": a.id,
            "user": a.user_id,
            "role": a.role,
            "action": a.action,
            "lotId": a.lot_id,
            "timestamp": a.timestamp,
            "location": a.location
        })
    return {
        "items": items,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": total_pages
    }
