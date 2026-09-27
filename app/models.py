import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # e.g. USR-2026-000001 or admin or REC-2026-000001
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # ADMIN or RECYCLER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    recycler_profile = relationship("Recycler", back_populates="user", uselist=False)

class Recycler(Base):
    __tablename__ = "recyclers"

    id = Column(String, primary_key=True, index=True) # e.g. EC-REC-00001
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    company_name = Column(String, nullable=True)
    facility_name = Column(String, nullable=True)
    facility_address = Column(Text, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    location = Column(String, nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    materials_accepted = Column(JSON, nullable=False) # List of strings e.g. ["PCB", "Cables"]
    eee_categories = Column(JSON, nullable=True) # List of strings e.g. ["IT Equipment"]
    auth_status = Column(String, default="AUTHORIZED") # AUTHORIZED or PENDING_RENEWAL
    auth_number = Column(String, nullable=True)
    cpcb_registration_id = Column(String, nullable=True)
    cpcb_registration_status = Column(String, nullable=True)
    registration_date = Column(String, nullable=True)
    registration_valid_until = Column(String, nullable=True)
    spcb_name = Column(String, nullable=True)
    verification_status = Column(String, nullable=True)
    processing_capacity_mt_per_year = Column(Float, nullable=True)
    offered_rate = Column(Float, default=150.0)
    price_material = Column(String, default="Mixed E-Waste")
    minimum_quantity_kg = Column(Float, default=0.0)
    pickup_charge = Column(Float, default=0.0)
    pickup_available = Column(Boolean, default=True)
    service_area = Column(String, default="15 km radius")
    contact = Column(String, nullable=True)
    contact_person = Column(String, nullable=True)
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    match_score = Column(Integer, default=75)
    verification_score = Column(Integer, default=75)
    data_confidence = Column(Float, default=0.85)
    source_name = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    account_status = Column(String, default="ACTIVE") # ACTIVE or INACTIVE
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="recycler_profile")
    lots = relationship("Lot", back_populates="recycler")
    transactions = relationship("Transaction", back_populates="recycler")

class Collector(Base):
    __tablename__ = "collectors"

    id = Column(String, primary_key=True, index=True) # e.g. COL-2026-000001
    language = Column(String, default="Tamil")
    location = Column(String, nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    total_lots = Column(Integer, default=0)
    total_transactions = Column(Integer, default=0)
    total_earnings = Column(Float, default=0.0)
    status = Column(String, default="ACTIVE") # ACTIVE or INACTIVE
    last_activity = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    lots = relationship("Lot", back_populates="collector")

class Lot(Base):
    __tablename__ = "lots"

    id = Column(String, primary_key=True, index=True) # e.g. LOT-2026-000001
    collector_id = Column(String, ForeignKey("collectors.id"), nullable=False)
    recycler_id = Column(String, ForeignKey("recyclers.id"), nullable=True)
    material = Column(String, nullable=False)
    sub_category = Column(String, default="Mixed")
    description = Column(Text, nullable=True)
    weight = Column(Float, nullable=False)
    condition = Column(String, default="Good")
    ai_confidence = Column(Float, default=90.0)
    estimated_value = Column(Float, default=0.0)
    quoted_price = Column(Float, default=0.0)
    final_value = Column(Float, nullable=True)
    location = Column(String, nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    status = Column(String, default="CREATED") # CREATED, AI_VERIFIED, MATCHED, REQUESTED, ACCEPTED, REJECTED, PICKUP_SCHEDULED, HANDED_OVER, PAYMENT_PENDING, COMPLETED, CANCELLED
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    collector = relationship("Collector", back_populates="lots")
    recycler = relationship("Recycler", back_populates="lots")
    traceability_events = relationship("TraceabilityEvent", back_populates="lot", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="lot")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True) # e.g. TXN-2026-000001
    lot_id = Column(String, ForeignKey("lots.id"), nullable=False)
    collector_id = Column(String, ForeignKey("collectors.id"), nullable=False)
    recycler_id = Column(String, ForeignKey("recyclers.id"), nullable=False)
    material = Column(String, nullable=False)
    weight = Column(Float, nullable=False)
    quoted_price = Column(Float, nullable=False)
    final_price = Column(Float, nullable=False)
    payment_status = Column(String, default="PAID") # PAID or PENDING
    payment_method = Column(String, default="Cash") # Cash or Digital
    collection_location = Column(String, nullable=False)
    handover_location = Column(String, nullable=False)
    date = Column(String, nullable=False)
    status = Column(String, default="COMPLETED") # COMPLETED or PROCESSING
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lot = relationship("Lot", back_populates="transactions")
    recycler = relationship("Recycler", back_populates="transactions")

class TraceabilityEvent(Base):
    __tablename__ = "traceability_events"

    id = Column(String, primary_key=True, index=True) # e.g. TRC-2026-000001
    lot_id = Column(String, ForeignKey("lots.id"), nullable=False)
    label = Column(String, nullable=False) # LOT CREATED, AI MATERIAL VERIFIED, RECYCLER ACCEPTED, etc.
    done = Column(Boolean, default=True)
    active = Column(Boolean, default=False)
    timestamp = Column(String, nullable=True)
    location = Column(String, nullable=True)
    weight = Column(Float, nullable=True)
    responsible = Column(String, nullable=True) # Collector ID or Recycler ID
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lot = relationship("Lot", back_populates="traceability_events")

class PickupRecord(Base):
    __tablename__ = "pickup_records"

    id = Column(String, primary_key=True, index=True) # e.g. HAND-2026-000001
    lot_id = Column(String, ForeignKey("lots.id"), nullable=False)
    recycler_id = Column(String, ForeignKey("recyclers.id"), nullable=False)
    collector_id = Column(String, ForeignKey("collectors.id"), nullable=False)
    handover_ref = Column(String, unique=True, nullable=False)
    scheduled_time = Column(String, nullable=True)
    collector_location = Column(String, nullable=False)
    handover_location = Column(String, nullable=False)
    status = Column(String, default="SCHEDULED") # SCHEDULED, COMPLETED
    weight = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    material = Column(String, nullable=False)
    sub_category = Column(String, default="Mixed")
    location = Column(String, nullable=False)
    buying_price = Column(Float, nullable=False)
    quoted_price = Column(Float, nullable=False)
    unit = Column(String, default="kg")
    recycler = Column(String, nullable=False)
    last_updated = Column(String, nullable=False)
    history = Column(JSON, nullable=False) # List of numeric historical rates

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, index=True) # e.g. ACT-00001
    user_id = Column(String, nullable=False)
    role = Column(String, nullable=False) # Collector or Recycler or Admin
    action = Column(String, nullable=False)
    lot_id = Column(String, nullable=True)
    timestamp = Column(String, nullable=False)
    location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, nullable=True) # If null, role target is used
    role_target = Column(String, nullable=True) # ADMIN or RECYCLER
    title = Column(String, nullable=False)
    detail = Column(String, nullable=False)
    read = Column(Boolean, default=False)
    time = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
