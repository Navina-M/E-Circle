from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Recycler
from app.auth.security import decode_access_token
from app.config import settings

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> dict:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    sub = payload.get("sub")
    role = payload.get("role")
    if not sub or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    if role == "ADMIN" and sub == settings.ADMIN_USERNAME:
        return {"id": "admin", "username": settings.ADMIN_USERNAME, "role": "ADMIN"}
    
    user = db.query(User).filter(User.username == sub).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive or not found",
        )
    
    return {"id": user.id, "username": user.username, "role": user.role}

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required for this endpoint",
        )
    return current_user

def require_recycler(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Recycler:
    if current_user["role"] != "RECYCLER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recycler access required for this endpoint",
        )
    
    recycler = db.query(Recycler).filter(
        (Recycler.id == current_user["username"]) | (Recycler.user_id == current_user["id"])
    ).first()
    
    if not recycler:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated recycler profile not found",
        )
    
    if recycler.account_status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recycler account is currently inactive",
        )
    
    return recycler
