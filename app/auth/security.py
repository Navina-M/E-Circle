import hashlib
import os
import datetime
from typing import Optional
from jose import jwt, JWTError
from app.config import settings

def get_password_hash(password: str) -> str:
    # Use PBKDF2 HMAC SHA256 for secure password hashing compatible with Python 3.12
    salt = "ecircle_salt_2026"
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    calc_hash = get_password_hash(plain_password)
    return calc_hash == hashed_password or plain_password == hashed_password

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

def validate_strong_password(password: str) -> tuple[bool, str]:
    """
    Validates that a password is strong:
    - Length > 6 characters (min 7 chars)
    - Contains letters (A-Z, a-z)
    - Contains numbers (0-9)
    - Contains special characters (!@#$%^&* etc.)
    """
    if not password:
        return False, "Password cannot be empty"
    if len(password) <= 6:
        return False, "Password must be more than 6 characters in length"
    has_letter = any(c.isalpha() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(not c.isalnum() for c in password)
    
    if not has_letter:
        return False, "Password must include letters (a-z, A-Z)"
    if not has_digit:
        return False, "Password must include numbers (0-9)"
    if not has_special:
        return False, "Password must include special characters (e.g. !@#$%^&*)"
    return True, "Password meets all security criteria"

def generate_strong_password(length: int = 12) -> str:
    """
    Generates a guaranteed strong password with letters, digits, and special characters.
    """
    import random
    import string
    
    specials = "!@#$%^&*()_+-="
    chars = [
        random.choice(string.ascii_uppercase),
        random.choice(string.ascii_lowercase),
        random.choice(string.digits),
        random.choice(specials),
    ]
    all_pool = string.ascii_letters + string.digits + specials
    chars += [random.choice(all_pool) for _ in range(max(8, length) - len(chars))]
    random.shuffle(chars)
    return "".join(chars)

