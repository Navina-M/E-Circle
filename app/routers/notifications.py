from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Notification

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
def get_notifications(db: Session = Depends(get_db)):
    notes = db.query(Notification).order_by(Notification.id.desc()).all()
    items = []
    for n in notes:
        items.append({
            "id": n.id,
            "title": n.title,
            "detail": n.detail,
            "read": n.read,
            "time": n.time
        })
    return items
