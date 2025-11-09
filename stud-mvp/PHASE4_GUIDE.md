# Phase 4: Authentication & Privacy - Implementation Guide

**Status**: 🚧 **READY FOR IMPLEMENTATION**  
**Priority**: HIGH (Required before production deployment)  
**Estimated Time**: 2-3 days

---

## Overview

This phase adds user authentication, authorization, and privacy compliance to the STUD MVP. The implementation uses JWT tokens for authentication with optional OAuth support.

## Architecture

### Backend (FastAPI)

```
backend/
├── auth.py                 # JWT utilities, password hashing
├── models/
│   └── user.py            # User model, database schema
├── routers/
│   └── auth_router.py     # Login, register, logout endpoints
├── middleware/
│   └── auth_middleware.py # JWT validation, current user injection
└── database.py            # User database connection
```

### Frontend (React)

```
frontend/src/
├── contexts/
│   └── AuthContext.tsx    # Auth state management
├── components/
│   ├── LoginPage.tsx      # Login form
│   └── RegisterPage.tsx   # Registration form
├── utils/
│   └── ProtectedRoute.tsx # Route guard
└── api/
    └── auth.ts            # Auth API functions
```

---

## Implementation Steps

### Step 1: Backend Authentication (Completed ✅)

**File: `backend/auth.py`** (CREATED)
- JWT token creation and validation
- Password hashing with bcrypt
- Token expiry handling

**Dependencies Added:**
```
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
```

### Step 2: User Model & Database

**File: `backend/models/user.py`** (TODO)
```python
from sqlalchemy import Column, String, Boolean, DateTime
from database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**File: `backend/database.py`** (TODO)
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./stud.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 3: Authentication Endpoints

**File: `backend/routers/auth_router.py`** (TODO)
```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from auth import create_access_token, verify_password, get_password_hash
from database import get_db
from models.user import User
from datetime import timedelta

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

@router.post("/register")
async def register(email: str, password: str, full_name: str, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(password)
    new_user = User(email=email, hashed_password=hashed_password, full_name=full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User created successfully", "user_id": new_user.id}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Decode token and get user
    token_data = decode_access_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.email == token_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"email": user.email, "full_name": user.full_name, "id": user.id}

@router.post("/logout")
async def logout():
    # In JWT, logout is handled client-side by removing token
    return {"message": "Logged out successfully"}
```

### Step 4: Frontend Auth Context

**File: `frontend/src/contexts/AuthContext.tsx`** (TODO)
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, getCurrentUser } from '../api/auth'

interface User {
  id: string
  email: string
  full_name?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token')
    if (token) {
      getCurrentUser(token)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('access_token')
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { access_token } = await loginUser(email, password)
    localStorage.setItem('access_token', access_token)
    const userData = await getCurrentUser(access_token)
    setUser(userData)
  }

  const register = async (email: string, password: string, fullName: string) => {
    await registerUser(email, password, fullName)
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### Step 5: Login & Register Pages

**File: `frontend/src/pages/LoginPage.tsx`** (TODO)
```typescript
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/courses')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Login to STUD</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
```

### Step 6: Protected Routes

**File: `frontend/src/utils/ProtectedRoute.tsx`** (TODO)
```typescript
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/ui'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
```

### Step 7: Update Router

**File: `frontend/src/router.js`** (UPDATE)
```javascript
// Wrap protected routes
<Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
<Route path="/courses/:playlistId" element={<ProtectedRoute><CourseDetailPage /></ProtectedRoute>} />
// ... other protected routes
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
```

---

## Google OAuth Integration (Optional)

### Backend OAuth

**File: `backend/routers/oauth_router.py`** (TODO)
```python
from fastapi import APIRouter
from authlib.integrations.starlette_client import OAuth

oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@router.get('/google/login')
async def google_login(request: Request):
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get('/google/callback')
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get('userinfo')
    # Create or get user, generate JWT
    return {"access_token": jwt_token}
```

---

## Privacy & GDPR Compliance

### Privacy Policy Page

**File: `frontend/src/pages/PrivacyPolicy.tsx`** (TODO)
- Data collection statement
- Cookie usage
- Third-party services (YouTube, OpenAI)
- User rights (access, deletion, export)
- Contact information

### Terms of Service

**File: `frontend/src/pages/TermsOfService.tsx`** (TODO)
- Acceptable use policy
- Content ownership
- Liability limitations
- Termination clause

### Data Export/Deletion Endpoints

**Backend Endpoints:** (TODO)
```python
@router.get("/me/export")
async def export_user_data(current_user: User = Depends(get_current_user)):
    # Export all user data as JSON
    return {
        "user": user_data,
        "playlists": playlists_data,
        "quiz_history": quiz_data,
        "tutor_history": tutor_data
    }

@router.delete("/me")
async def delete_account(current_user: User = Depends(get_current_user)):
    # Delete user and all associated data
    # GDPR right to be forgotten
    pass
```

---

## Testing

### Auth Tests (TODO)

```python
# tests/test_auth.py
def test_register_user():
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User"
    })
    assert response.status_code == 200

def test_login_user():
    response = client.post("/api/v1/auth/login", data={
        "username": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_protected_endpoint():
    # Without token
    response = client.get("/api/v1/ingest/playlists")
    assert response.status_code == 401
    
    # With token
    response = client.get("/api/v1/ingest/playlists", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
```

---

## Security Best Practices

1. **Environment Variables**: Move `SECRET_KEY` to `.env`
2. **HTTPS Only**: Enforce in production
3. **Password Requirements**: Min 8 chars, complexity rules
4. **Rate Limiting**: Prevent brute force attacks
5. **CORS Configuration**: Whitelist frontend domain
6. **SQL Injection Protection**: Use parameterized queries (SQLAlchemy handles this)
7. **XSS Protection**: Sanitize user inputs
8. **CSRF Tokens**: For state-changing operations

---

## Deployment Checklist

- [ ] Generate strong `SECRET_KEY` for production
- [ ] Set up PostgreSQL instead of SQLite
- [ ] Configure HTTPS with SSL certificates
- [ ] Set up email verification (SendGrid/Mailgun)
- [ ] Implement rate limiting (slowapi)
- [ ] Add CORS whitelist for production domain
- [ ] Set up logging and monitoring (Sentry)
- [ ] Password reset flow with email tokens
- [ ] Session management (refresh tokens)
- [ ] Multi-factor authentication (2FA) - optional

---

**Status**: Infrastructure ready, implementation pending  
**Next**: Complete implementation or move to Phase 5 (Testing & CI/CD)
