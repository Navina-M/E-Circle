from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    id: str
    username: str
    role: str
    name: Optional[str] = None
    location: Optional[str] = None

class LoginResponse(BaseModel):
    token: str
    role: str
    profile: Any

# --- Recycler Schemas ---
class RecyclerBase(BaseModel):
    name: str
    companyName: Optional[str] = None
    facilityName: Optional[str] = None
    facilityAddress: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    location: str
    lat: Optional[float] = 9.45
    lng: Optional[float] = 77.3
    materialsAccepted: List[str]
    eeeCategories: Optional[List[str]] = None
    authStatus: Optional[str] = "AUTHORIZED"
    authNumber: Optional[str] = None
    cpcbRegistrationId: Optional[str] = None
    cpcbRegistrationStatus: Optional[str] = None
    registrationDate: Optional[str] = None
    registrationValidUntil: Optional[str] = None
    spcbName: Optional[str] = None
    verificationStatus: Optional[str] = None
    processingCapacityMtPerYear: Optional[float] = None
    offeredRate: Optional[float] = 150.0
    priceMaterial: Optional[str] = "Mixed E-Waste"
    minimumQuantityKg: Optional[float] = 0.0
    pickupCharge: Optional[float] = 0.0
    pickupAvailable: Optional[bool] = True
    serviceArea: Optional[str] = "15 km radius"
    contact: Optional[str] = None
    contactPerson: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    matchScore: Optional[int] = 75
    verificationScore: Optional[int] = 75
    dataConfidence: Optional[float] = 0.85
    sourceName: Optional[str] = None
    sourceUrl: Optional[str] = None

class RecyclerCreate(RecyclerBase):
    pass

class RecyclerResponse(RecyclerBase):
    id: str
    username: str
    accountStatus: str
    createdAt: str

    class Config:
        from_attributes = True

class RecyclerCreateResponse(BaseModel):
    record: RecyclerResponse
    generatedPassword: str

class RecyclerStatusUpdate(BaseModel):
    accountStatus: str

# --- Collector Schemas ---
class CollectorResponse(BaseModel):
    id: str
    language: str
    location: str
    totalLots: int
    totalTransactions: int
    totalEarnings: float
    status: str
    lastActivity: Optional[str] = None

    class Config:
        from_attributes = True

# --- Lot Schemas ---
class LotBase(BaseModel):
    material: str
    subCategory: Optional[str] = "Mixed"
    description: Optional[str] = ""
    weight: float
    condition: Optional[str] = "Good"
    location: str
    lat: Optional[float] = 9.45
    lng: Optional[float] = 77.3
    recyclerId: Optional[str] = None

class LotResponse(LotBase):
    id: str
    collectorId: str
    aiConfidence: float
    estimatedValue: float
    quotedPrice: float
    finalValue: Optional[float] = None
    recyclerName: Optional[str] = None
    status: str
    createdAt: str

    class Config:
        from_attributes = True

class LotActionRequest(BaseModel):
    action: str # ACCEPT, REJECT, QUOTE, CONFIRM_PICKUP
    quotedPrice: Optional[float] = None

class PickupConfirmRequest(BaseModel):
    lotId: str
    handoverLocation: str
    finalWeight: float
    paymentMethod: Optional[str] = "Cash"

# --- Transaction Schemas ---
class TransactionResponse(BaseModel):
    id: str
    lotId: str
    collectorId: str
    recyclerId: str
    material: str
    weight: float
    quotedPrice: float
    finalPrice: float
    paymentStatus: str
    paymentMethod: str
    collectionLocation: str
    handoverLocation: str
    date: str
    status: str

    class Config:
        from_attributes = True

# --- Traceability Schemas ---
class TraceabilityEventResponse(BaseModel):
    id: str
    label: str
    done: bool
    active: bool
    timestamp: Optional[str] = None
    location: Optional[str] = None
    weight: Optional[float] = None
    responsible: Optional[str] = None

# --- Price Board Schemas ---
class PriceItem(BaseModel):
    material: str
    subCategory: str
    location: str
    buyingPrice: float
    quotedPrice: float
    unit: str
    recycler: str
    lastUpdated: str
    history: List[float]

# --- FairRoute Schemas ---
class FairRouteCandidate(BaseModel):
    recycler: RecyclerResponse
    distanceKm: float
    acceptsMaterial: bool
    score: int

# --- AI Schemas ---
class AIClassifyResponse(BaseModel):
    material_category: str
    sub_category: str
    confidence: float
    detected_objects: List[str]
    estimated_weight_if_available: float
    verification_status: str

# --- Pagination Wrapper ---
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    pageSize: int
    totalPages: int
