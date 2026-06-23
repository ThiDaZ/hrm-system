import os
from datetime import datetime, timedelta
from jose import jwt
import bcrypt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set in the environment variables.")
if not ALGORITHM:
    raise ValueError("ALGORITHM is not set in the environment variables.")

def _truncate_to_72_bytes(password: str) -> str:
    # bcrypt only uses the first 72 bytes of a password.
    return password.encode('utf-8')[:72].decode('utf-8', 'ignore')

def verify_password(plain_password, hashed_password):
    truncated_password = _truncate_to_72_bytes(plain_password).encode("utf-8")
    hashed_password_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(truncated_password, hashed_password_bytes)

def get_password_hash(password):
    truncated_password = _truncate_to_72_bytes(password).encode("utf-8")
    return bcrypt.hashpw(truncated_password, bcrypt.gensalt()).decode("utf-8")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
