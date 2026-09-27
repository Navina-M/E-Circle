from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Transaction
from app.auth.dependencies import require_admin

router = APIRouter(prefix="/api/admin/transactions", tags=["Transactions"], dependencies=[Depends(require_admin)])

@router.get("")
def get_transactions(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    material: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            Transaction.id.ilike(s) | 
            Transaction.lot_id.ilike(s) | 
            Transaction.collector_id.ilike(s) | 
            Transaction.recycler_id.ilike(s)
        )
    if status:
        query = query.filter(Transaction.status == status)
    if material:
        query = query.filter(Transaction.material == material)

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
