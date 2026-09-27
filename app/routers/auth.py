from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Recycler
from app.schemas import LoginRequest, LoginResponse
from app.auth.security import verify_password, create_access_token, get_password_hash, validate_strong_password
from app.auth.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class PasswordChangeRequest(BaseModel):
    currentPassword: str
    newPassword: str


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    username = payload.username.strip()
    password = payload.password.strip()

    # 1. Check Admin login
    if username == settings.ADMIN_USERNAME:
        if password == settings.ADMIN_PASSWORD:
            token = create_access_token({"sub": settings.ADMIN_USERNAME, "role": "ADMIN"})
            return {
                "token": token,
                "role": "ADMIN",
                "profile": {
                    "username": settings.ADMIN_USERNAME,
                    "name": "Platform Administrator",
                    "role": "ADMIN"
                }
            }
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")

    # 2. Check Recycler login
    user = db.query(User).filter(User.username == username).first()
    if not user:
        # Check if user matches recycler ID directly
        recycler = db.query(Recycler).filter(Recycler.id == username).first()
        if recycler and recycler.user:
            user = recycler.user

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    # Fetch recycler profile if role is RECYCLER
    profile_data = {"username": user.username, "role": user.role}
    if user.role == "RECYCLER":
        recycler = db.query(Recycler).filter(
            (Recycler.user_id == user.id) | (Recycler.id == user.username)
        ).first()
        if recycler:
            profile_data = {
                "id": recycler.id,
                "username": recycler.id,
                "name": recycler.name,
                "location": recycler.location,
                "materialsAccepted": recycler.materials_accepted,
                "authStatus": recycler.auth_status,
                "offeredRate": recycler.offered_rate,
                "pickupAvailable": recycler.pickup_available,
                "serviceArea": recycler.service_area,
                "accountStatus": recycler.account_status,
                "role": "RECYCLER"
            }

    token = create_access_token({"sub": user.username, "role": user.role, "user_id": user.id})
    return {
        "token": token,
        "role": user.role,
        "profile": profile_data
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] == "ADMIN":
        return {
            "username": settings.ADMIN_USERNAME,
            "role": "ADMIN",
            "name": "Platform Administrator"
        }

    recycler = db.query(Recycler).filter(Recycler.id == current_user["username"]).first()
    if recycler:
        return {
            "id": recycler.id,
            "username": recycler.id,
            "name": recycler.name,
            "location": recycler.location,
            "materialsAccepted": recycler.materials_accepted,
            "authStatus": recycler.auth_status,
            "accountStatus": recycler.account_status,
            "role": "RECYCLER"
        }

    return current_user

@router.post("/change-password")
def change_password(
    payload: PasswordChangeRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    valid, message = validate_strong_password(payload.newPassword)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    
    # If admin
    if current_user["role"] == "ADMIN":
        if payload.currentPassword != settings.ADMIN_PASSWORD:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password incorrect")
        # In a real system, would save to secure vault or db. For admin user in DB:
        admin_user = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        if admin_user:
            admin_user.password_hash = get_password_hash(payload.newPassword)
            db.commit()
        settings.ADMIN_PASSWORD = payload.newPassword
        return {"status": "success", "message": "Admin password updated successfully"}
    
    # If recycler or other user
    user = db.query(User).filter(User.username == current_user["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(payload.currentPassword, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password incorrect")
    
    user.password_hash = get_password_hash(payload.newPassword)
    db.commit()
    return {"status": "success", "message": "Password updated successfully"}

