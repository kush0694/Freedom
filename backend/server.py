from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(title="Freedom Score API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

# Auth Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class User(BaseModel):
    id: str
    email: str
    created_at: datetime

# Identity Data Models
class IdentityData(BaseModel):
    age_band: str  # "18-25", "26-35", "36-45", "46-55", "56+"
    country: str
    employment_type: str  # "employed", "self_employed", "student", "unemployed", "retired"
    income_band: str  # "0-25k", "25k-50k", "50k-100k", "100k+"

class IdentityDataResponse(IdentityData):
    user_id: str
    created_at: datetime

# Baseline Snapshot Models
class BaselineSnapshot(BaseModel):
    obligations_range: str  # "0-10k", "10k-25k", "25k-50k", "50k+"
    spending_range: str  # "low", "medium", "high"
    savings_habit: bool
    investment_habit: bool

class BaselineSnapshotResponse(BaselineSnapshot):
    user_id: str
    created_at: datetime

# Monthly Check-in Models
class MonthlyCheckin(BaseModel):
    income_status: str  # "same", "higher", "lower"
    spending_discipline: str  # "on_track", "slightly_over", "way_over"
    savings_done: bool
    stress_level: str  # "none", "minor", "heavy"

class MonthlyCheckinResponse(MonthlyCheckin):
    id: str
    user_id: str
    month: int
    year: int
    submitted_at: datetime

# Behavioral Signal Models
class BehavioralSignal(BaseModel):
    signal_type: str  # "rule_override", "automation_failure", "goal_pause", "panic_action", "missed_commitment", "consistency_streak"
    metadata: Optional[Dict[str, Any]] = None

class BehavioralSignalResponse(BehavioralSignal):
    id: str
    user_id: str
    timestamp: datetime

# Freedom Score Models
class DimensionsBreakdown(BaseModel):
    stability: float
    discipline: float
    resilience: float
    optionality: float
    time_horizon: float

class FreedomScore(BaseModel):
    score: int
    dimensions: DimensionsBreakdown
    trend: str  # "up", "flat", "down"
    insight: Optional[str] = None

class FreedomScoreResponse(FreedomScore):
    id: str
    user_id: str
    calculated_at: datetime

# ==================== HELPER FUNCTIONS ====================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def calculate_freedom_score(user_id: str, identity_data: Optional[dict], baseline: Optional[dict], 
                           checkins: List[dict], signals: List[dict]) -> FreedomScore:
    """
    Placeholder scoring algorithm
    Base score: 500
    Range: 300-900
    """
    base_score = 500
    
    # Initialize dimensions
    stability = 50.0
    discipline = 50.0
    resilience = 50.0
    optionality = 50.0
    time_horizon = 50.0
    
    # Stability calculation (based on income consistency)
    if checkins:
        income_same_count = sum(1 for c in checkins if c.get('income_status') == 'same')
        income_consistency = income_same_count / len(checkins) if checkins else 0
        stability = 30 + (income_consistency * 70)  # 30-100 range
    
    # Discipline calculation (based on spending patterns)
    if checkins:
        on_track_count = sum(1 for c in checkins if c.get('spending_discipline') == 'on_track')
        discipline_ratio = on_track_count / len(checkins) if checkins else 0
        discipline = 20 + (discipline_ratio * 80)  # 20-100 range
    
    # Resilience calculation (based on stress levels)
    if checkins:
        low_stress_count = sum(1 for c in checkins if c.get('stress_level') in ['none', 'minor'])
        resilience_ratio = low_stress_count / len(checkins) if checkins else 0
        resilience = 30 + (resilience_ratio * 70)  # 30-100 range
    
    # Optionality calculation (based on savings)
    if checkins:
        savings_count = sum(1 for c in checkins if c.get('savings_done') is True)
        optionality_ratio = savings_count / len(checkins) if checkins else 0
        optionality = 25 + (optionality_ratio * 75)  # 25-100 range
    
    # Time Horizon calculation (based on consistency streak)
    if checkins:
        time_horizon = min(100, 40 + (len(checkins) * 5))  # Increases with checkins
    
    # Baseline adjustments
    if baseline:
        if baseline.get('savings_habit'):
            optionality += 10
        if baseline.get('investment_habit'):
            time_horizon += 10
    
    # Calculate weighted score
    final_score = int(
        base_score +
        (stability - 50) * 0.30 * 8 +  # 30% weight
        (discipline - 50) * 0.25 * 8 +  # 25% weight
        (resilience - 50) * 0.20 * 8 +  # 20% weight
        (optionality - 50) * 0.15 * 8 +  # 15% weight
        (time_horizon - 50) * 0.10 * 8   # 10% weight
    )
    
    # Clamp to range
    final_score = max(300, min(900, final_score))
    
    # Determine trend
    trend = "flat"
    if len(checkins) >= 2:
        recent_checkins = checkins[-2:]
        if recent_checkins[-1].get('spending_discipline') == 'on_track' and recent_checkins[-1].get('savings_done'):
            trend = "up"
        elif recent_checkins[-1].get('stress_level') == 'heavy' or recent_checkins[-1].get('spending_discipline') == 'way_over':
            trend = "down"
    
    # Generate insight
    insight = None
    if discipline < 40:
        insight = "Focus on maintaining spending discipline this month"
    elif resilience < 40:
        insight = "Consider building an emergency fund to reduce financial stress"
    elif len(checkins) > 3:
        insight = "Great consistency! Keep up the momentum"
    
    return FreedomScore(
        score=final_score,
        dimensions=DimensionsBreakdown(
            stability=round(stability, 1),
            discipline=round(discipline, 1),
            resilience=round(resilience, 1),
            optionality=round(optionality, 1),
            time_horizon=round(time_horizon, 1)
        ),
        trend=trend,
        insight=insight
    )

# ==================== BASE ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Freedom Score API", "version": "1.0.0"}

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = {
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return Token(access_token=access_token)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Find user
    user = await db.users.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return Token(access_token=access_token)

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(
        id=str(user["_id"]),
        email=user["email"],
        created_at=user["created_at"]
    )

# ==================== ONBOARDING ENDPOINTS ====================

@api_router.post("/onboarding/identity", response_model=IdentityDataResponse)
async def submit_identity_data(data: IdentityData, user_id: str = Depends(get_current_user)):
    # Check if already exists
    existing = await db.identity_data.find_one({"user_id": user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Identity data already submitted")
    
    identity_dict = {
        "user_id": user_id,
        **data.dict(),
        "created_at": datetime.utcnow()
    }
    
    await db.identity_data.insert_one(identity_dict)
    
    return IdentityDataResponse(**identity_dict)

@api_router.post("/onboarding/baseline", response_model=BaselineSnapshotResponse)
async def submit_baseline_snapshot(data: BaselineSnapshot, user_id: str = Depends(get_current_user)):
    # Check if already exists
    existing = await db.baseline_snapshot.find_one({"user_id": user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Baseline snapshot already submitted")
    
    baseline_dict = {
        "user_id": user_id,
        **data.dict(),
        "created_at": datetime.utcnow()
    }
    
    await db.baseline_snapshot.insert_one(baseline_dict)
    
    # Calculate initial freedom score
    identity_data = await db.identity_data.find_one({"user_id": user_id})
    score = calculate_freedom_score(user_id, identity_data, baseline_dict, [], [])
    
    score_dict = {
        "user_id": user_id,
        **score.dict(),
        "calculated_at": datetime.utcnow()
    }
    await db.freedom_scores.insert_one(score_dict)
    
    return BaselineSnapshotResponse(**baseline_dict)

@api_router.get("/onboarding/status")
async def get_onboarding_status(user_id: str = Depends(get_current_user)):
    identity = await db.identity_data.find_one({"user_id": user_id})
    baseline = await db.baseline_snapshot.find_one({"user_id": user_id})
    
    return {
        "identity_completed": identity is not None,
        "baseline_completed": baseline is not None,
        "onboarding_completed": identity is not None and baseline is not None
    }

# ==================== CHECK-IN ENDPOINTS ====================

@api_router.post("/checkin/submit", response_model=MonthlyCheckinResponse)
async def submit_monthly_checkin(data: MonthlyCheckin, user_id: str = Depends(get_current_user)):
    now = datetime.utcnow()
    current_month = now.month
    current_year = now.year
    
    # Check if already submitted for this month
    existing = await db.monthly_checkins.find_one({
        "user_id": user_id,
        "month": current_month,
        "year": current_year
    })
    if existing:
        raise HTTPException(status_code=400, detail="Check-in already submitted for this month")
    
    checkin_dict = {
        "user_id": user_id,
        **data.dict(),
        "month": current_month,
        "year": current_year,
        "submitted_at": now
    }
    
    result = await db.monthly_checkins.insert_one(checkin_dict)
    checkin_id = str(result.inserted_id)
    
    # Recalculate freedom score
    identity_data = await db.identity_data.find_one({"user_id": user_id})
    baseline = await db.baseline_snapshot.find_one({"user_id": user_id})
    checkins = await db.monthly_checkins.find({"user_id": user_id}).sort("submitted_at", -1).to_list(100)
    signals = await db.behavioral_signals.find({"user_id": user_id}).to_list(100)
    
    score = calculate_freedom_score(user_id, identity_data, baseline, checkins, signals)
    
    score_dict = {
        "user_id": user_id,
        **score.dict(),
        "calculated_at": datetime.utcnow()
    }
    await db.freedom_scores.insert_one(score_dict)
    
    return MonthlyCheckinResponse(
        id=checkin_id,
        **checkin_dict
    )

@api_router.get("/checkin/latest", response_model=Optional[MonthlyCheckinResponse])
async def get_latest_checkin(user_id: str = Depends(get_current_user)):
    checkin = await db.monthly_checkins.find_one(
        {"user_id": user_id},
        sort=[("submitted_at", -1)]
    )
    
    if not checkin:
        return None
    
    return MonthlyCheckinResponse(
        id=str(checkin["_id"]),
        user_id=checkin["user_id"],
        **{k: v for k, v in checkin.items() if k not in ["_id", "user_id"]}
    )

@api_router.get("/checkin/can_submit")
async def can_submit_checkin(user_id: str = Depends(get_current_user)):
    now = datetime.utcnow()
    existing = await db.monthly_checkins.find_one({
        "user_id": user_id,
        "month": now.month,
        "year": now.year
    })
    
    return {"can_submit": existing is None}

# ==================== SCORE ENDPOINTS ====================

@api_router.get("/score/current", response_model=Optional[FreedomScoreResponse])
async def get_current_score(user_id: str = Depends(get_current_user)):
    score = await db.freedom_scores.find_one(
        {"user_id": user_id},
        sort=[("calculated_at", -1)]
    )
    
    if not score:
        return None
    
    return FreedomScoreResponse(
        id=str(score["_id"]),
        user_id=score["user_id"],
        score=score["score"],
        dimensions=DimensionsBreakdown(**score["dimensions"]),
        trend=score["trend"],
        insight=score.get("insight"),
        calculated_at=score["calculated_at"]
    )

@api_router.get("/score/history", response_model=List[FreedomScoreResponse])
async def get_score_history(user_id: str = Depends(get_current_user), limit: int = 12):
    scores = await db.freedom_scores.find(
        {"user_id": user_id}
    ).sort("calculated_at", -1).limit(limit).to_list(limit)
    
    return [
        FreedomScoreResponse(
            id=str(score["_id"]),
            user_id=score["user_id"],
            score=score["score"],
            dimensions=DimensionsBreakdown(**score["dimensions"]),
            trend=score["trend"],
            insight=score.get("insight"),
            calculated_at=score["calculated_at"]
        )
        for score in scores
    ]

# ==================== BEHAVIORAL SIGNAL ENDPOINTS ====================

@api_router.post("/behavior/track", response_model=BehavioralSignalResponse)
async def track_behavioral_signal(data: BehavioralSignal, user_id: str = Depends(get_current_user)):
    signal_dict = {
        "user_id": user_id,
        **data.dict(),
        "timestamp": datetime.utcnow()
    }
    
    result = await db.behavioral_signals.insert_one(signal_dict)
    signal_id = str(result.inserted_id)
    
    return BehavioralSignalResponse(
        id=signal_id,
        **signal_dict
    )

@api_router.get("/behavior/signals", response_model=List[BehavioralSignalResponse])
async def get_behavioral_signals(user_id: str = Depends(get_current_user), limit: int = 50):
    signals = await db.behavioral_signals.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return [
        BehavioralSignalResponse(
            id=str(signal["_id"]),
            **{k: v for k, v in signal.items() if k != "_id"}
        )
        for signal in signals
    ]

# ==================== STATS ENDPOINTS ====================

@api_router.get("/stats/streak")
async def get_consistency_streak(user_id: str = Depends(get_current_user)):
    checkins = await db.monthly_checkins.find(
        {"user_id": user_id}
    ).sort("submitted_at", -1).to_list(100)
    
    if not checkins:
        return {"streak": 0}
    
    # Calculate consecutive months
    streak = 1
    for i in range(len(checkins) - 1):
        current = checkins[i]
        previous = checkins[i + 1]
        
        # Check if consecutive months
        if current["year"] == previous["year"]:
            if current["month"] - previous["month"] == 1:
                streak += 1
            else:
                break
        elif current["year"] - previous["year"] == 1 and current["month"] == 1 and previous["month"] == 12:
            streak += 1
        else:
            break
    
    return {"streak": streak}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
