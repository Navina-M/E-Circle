import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Recycler, Lot, Transaction, TraceabilityEvent, ActivityLog, PickupRecord
from app.schemas import LotActionRequest, PickupConfirmRequest
from app.auth.dependencies import require_recycler

router = APIRouter(prefix="/api/recyclers", tags=["Recyclers"])

def paginate_list(items_list, page: int = 1, page_size: int = 10):
    total = len(items_list)
    total_pages = max(1, (total + page_size - 1) // page_size)
    start = (page - 1) * page_size
    return items_list[start:start + page_size], total, total_pages

@router.get("/me")
def get_recycler_profile(recycler: Recycler = Depends(require_recycler)):
    return {
        "id": recycler.id,
        "username": recycler.id,
        "name": recycler.name,
        "companyName": recycler.company_name or recycler.name,
        "facilityName": recycler.facility_name or recycler.name,
        "facilityAddress": recycler.facility_address,
        "district": recycler.district,
        "state": recycler.state,
        "pincode": recycler.pincode,
        "location": recycler.location,
        "lat": recycler.lat,
        "lng": recycler.lng,
        "materialsAccepted": recycler.materials_accepted or [],
        "eeeCategories": recycler.eee_categories or [],
        "authStatus": recycler.auth_status,
        "authNumber": recycler.auth_number,
        "cpcbRegistrationId": recycler.cpcb_registration_id or recycler.auth_number,
        "cpcbRegistrationStatus": recycler.cpcb_registration_status,
        "registrationDate": recycler.registration_date,
        "registrationValidUntil": recycler.registration_valid_until,
        "spcbName": recycler.spcb_name,
        "verificationStatus": recycler.verification_status,
        "processingCapacityMtPerYear": recycler.processing_capacity_mt_per_year,
        "offeredRate": recycler.offered_rate,
        "priceMaterial": recycler.price_material,
        "minimumQuantityKg": recycler.minimum_quantity_kg,
        "pickupCharge": recycler.pickup_charge,
        "pickupAvailable": recycler.pickup_available,
        "serviceArea": recycler.service_area,
        "contact": recycler.contact,
        "contactPerson": recycler.contact_person,
        "officialPhone": recycler.contact,
        "email": recycler.email,
        "officialEmail": recycler.email,
        "website": recycler.website,
        "matchScore": recycler.match_score,
        "verificationScore": recycler.verification_score,
        "dataConfidence": recycler.data_confidence,
        "sourceName": recycler.source_name,
        "sourceUrl": recycler.source_url,
        "accountStatus": recycler.account_status,
        "createdAt": recycler.created_at.strftime("%Y-%m-%d") if recycler.created_at else "2026-09-01"
    }

@router.get("/dashboard")
def get_recycler_dashboard(
    recycler: Recycler = Depends(require_recycler),
    db: Session = Depends(get_db)
):
    # STRICT DATA ISOLATION: Query ONLY lots where recycler_id == recycler.id
    my_lots = db.query(Lot).filter(Lot.recycler_id == recycler.id).all()
    
    new_requests = sum(1 for l in my_lots if l.status == "REQUESTED")
    accepted_lots = sum(1 for l in my_lots if l.status == "ACCEPTED")
    pending_pickups = sum(1 for l in my_lots if l.status == "PICKUP_SCHEDULED")
    completed_lots = sum(1 for l in my_lots if l.status == "COMPLETED")
    total_received = sum(l.weight for l in my_lots)
    pending_payments = sum(1 for l in my_lots if l.status == "PAYMENT_PENDING")

    # Material distribution for this recycler
    counts = {}
    for l in my_lots:
        counts[l.material] = counts.get(l.material, 0) + 1
    material_dist = [{"name": k, "value": v} for k, v in counts.items()]

    recent_lots_data = []
    for l in my_lots[:6]:
        recent_lots_data.append({
            "id": l.id,
            "collectorId": l.collector_id,
            "material": l.material,
            "weight": l.weight,
            "quotedPrice": l.quoted_price,
            "status": l.status,
            "createdAt": l.created_at.strftime("%Y-%m-%d %H:%M") if l.created_at else ""
        })

    months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    weight_trend = [{"month": m, "value": int(15 + i * 8)} for i, m in enumerate(months)]

    return {
        "kpis": {
            "newRequests": new_requests,
            "acceptedLots": accepted_lots,
            "pendingPickups": pending_pickups,
            "completedLots": completed_lots,
            "totalReceived": f"{total_received:.1f}",
            "pendingPayments": pending_payments
        },
        "weightTrend": weight_trend,
        "materialDistribution": material_dist,
        "recentLots": recent_lots_data
    }

@router.get("/lots")
def get_recycler_lots(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    material: Optional[str] = None,
    recycler: Recycler = Depends(require_recycler),
    db: Session = Depends(get_db)
):
    query = db.query(Lot).filter(Lot.recycler_id == recycler.id)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(Lot.id.ilike(s) | Lot.material.ilike(s) | Lot.collector_id.ilike(s))
    if status:
        query = query.filter(Lot.status == status)
    if material:
        query = query.filter(Lot.material == material)

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    lots = query.offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for l in lots:
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
            "recyclerName": recycler.name,
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

@router.get("/requests")
def get_recycler_requests(
    recycler: Recycler = Depends(require_recycler),
    db: Session = Depends(get_db)
):
    req_lots = db.query(Lot).filter(
        Lot.recycler_id == recycler.id,
        Lot.status.in_(["REQUESTED", "MATCHED"])
    ).all()
    
    items = []
    for l in req_lots:
        items.append({
            "id": l.id,
            "collectorId": l.collector_id,
            "material": l.material,
            "subCategory": l.sub_category,
            "weight": l.weight,
            "estimatedValue": l.estimated_value,
            "quotedPrice": l.quoted_price,
            "location": l.location,
            "status": l.status,
            "createdAt": l.created_at.strftime("%Y-%m-%d %H:%M") if l.created_at else ""
        })
    return items

@router.post("/lots/{lot_id}/action")
def lot_action(
    lot_id: str,
    payload: LotActionRequest,
    recycler: Recycler = Depends(require_recycler),
    db: Session = Depends(get_db)
):
    lot = db.query(Lot).filter(Lot.id == lot_id, Lot.recycler_id == recycler.id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found or access denied")

    action = payload.action.upper()
    if action == "ACCEPT":
        lot.status = "ACCEPTED"
    elif action == "REJECT":
        lot.status = "REJECTED"
    elif action == "QUOTE" and payload.quotedPrice:
        lot.quoted_price = payload.quotedPrice
        lot.status = "ACCEPTED"
    elif action == "SCHEDULE_PICKUP":
        lot.status = "PICKUP_SCHEDULED"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    # Add traceability event
    trc_count = db.query(TraceabilityEvent).filter(TraceabilityEvent.lot_id == lot.id).count()
    trc_event = TraceabilityEvent(
        id=f"TRC-{lot.id[4:]}-{str(trc_count + 1).zfill(2)}",
        lot_id=lot.id,
        label=f"RECYCLER ACTION: {action}",
        done=True,
        active=False,
        timestamp=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        location=recycler.location,
        responsible=recycler.id
    )
    db.add(trc_event)
    
    # Log activity
    act = ActivityLog(
        id=f"ACT-{datetime.datetime.utcnow().strftime('%f')[:5]}",
        user_id=recycler.id,
        role="Recycler",
        action=f"Recycler {recycler.id} {action.lower()}ed lot {lot.id}",
        lot_id=lot.id,
        timestamp=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        location=recycler.location
    )
    db.add(act)

    db.commit()
    db.refresh(lot)
    return {"id": lot.id, "status": lot.status}

@router.post("/pickups/confirm")
def confirm_pickup(
    payload: PickupConfirmRequest,
    recycler: Recycler = Depends(require_recycler),
    db: Session = Depends(get_db)
):
    lot = db.query(Lot).filter(Lot.id == payload.lotId, Lot.recycler_id == recycler.id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found or access denied")

    handover_ref = f"HAND-2026-{str(db.query(PickupRecord).count() + 1).zfill(6)}"
    
    pickup = PickupRecord(
        id=f"PKP-{lot.id[4:]}",
        lot_id=lot.id,
        recycler_id=recycler.id,
        collector_id=lot.collector_id,
        handover_ref=handover_ref,
        scheduled_time=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        collector_location=lot.location,
        handover_location=payload.handoverLocation,
        status="COMPLETED",
        weight=payload.finalWeight
    )
    db.add(pickup)

    lot.status = "HANDED_OVER"
    lot.weight = payload.finalWeight
    lot.final_value = lot.quoted_price

    # Generate completed transaction record
    txn = Transaction(
        id=f"TXN-2026-{str(db.query(Transaction).count() + 1).zfill(6)}",
        lot_id=lot.id,
        collector_id=lot.collector_id,
        recycler_id=recycler.id,
        material=lot.material,
        weight=payload.finalWeight,
        quoted_price=lot.quoted_price,
        final_price=lot.quoted_price,
        payment_status="PENDING",
        payment_method=payload.paymentMethod or "Cash",
        collection_location=lot.location,
        handover_location=payload.handoverLocation,
        date=datetime.date.today().isoformat(),
        status="COMPLETED"
    )
    db.add(txn)

    # Traceability event
    trc_count = db.query(TraceabilityEvent).filter(TraceabilityEvent.lot_id == lot.id).count()
    event = TraceabilityEvent(
        id=f"TRC-{lot.id[4:]}-{str(trc_count + 1).zfill(2)}",
        lot_id=lot.id,
        label=f"HANDOVER CONFIRMED ({handover_ref})",
        done=True,
        active=True,
        timestamp=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        location=payload.handoverLocation,
        weight=payload.finalWeight,
        responsible=recycler.id
    )
    db.add(event)

    db.commit()
    return {"handoverRef": handover_ref, "lotId": lot.id, "status": lot.status}

@router.get("/transactions")
def get_recycler_transactions(
    page: int = 1,
    page_size: int = 10,
    recycler: Recycler = Depends(require_recycler),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(Transaction.recycler_id == recycler.id)
    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    txns = query.offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for t in txns:
        items.append({
            "id": t.id,
            "lotId": t.lot_id,
            "collectorId": t.collector_id,
            "recyclerId": t.recycler_id,
            "material": t.material,
            "weight": t.weight,
            "quotedPrice": t.quoted_price,
            "finalPrice": t.final_price,
            "paymentStatus": t.payment_status,
            "paymentMethod": t.payment_method,
            "collectionLocation": t.collection_location,
            "handoverLocation": t.handover_location,
            "date": t.date,
            "status": t.status
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": total_pages
    }
