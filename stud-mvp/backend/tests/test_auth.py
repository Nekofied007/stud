"""
Tests for authentication endpoints
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from main import app

# Test database URL (in-memory SQLite)
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test, drop after"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


class TestUserRegistration:
    """Tests for user registration endpoint"""
    
    def test_register_new_user_success(self):
        """Test successful user registration"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_register_duplicate_username(self):
        """Test registration with duplicate username fails"""
        # Register first user
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test1@example.com",
                "password": "password123"
            }
        )
        
        # Try to register with same username
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test2@example.com",
                "password": "password456"
            }
        )
        assert response.status_code == 400
        assert "Username already registered" in response.json()["detail"]
    
    def test_register_duplicate_email(self):
        """Test registration with duplicate email fails"""
        # Register first user
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser1",
                "email": "test@example.com",
                "password": "password123"
            }
        )
        
        # Try to register with same email
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser2",
                "email": "test@example.com",
                "password": "password456"
            }
        )
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
    
    def test_register_invalid_username(self):
        """Test registration with invalid username fails"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "ab",  # Too short (min 3)
                "email": "test@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == 422
    
    def test_register_invalid_password(self):
        """Test registration with short password fails"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "short"  # Too short (min 8)
            }
        )
        assert response.status_code == 422
    
    def test_register_invalid_email(self):
        """Test registration with invalid email fails"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "not-an-email",
                "password": "password123"
            }
        )
        assert response.status_code == 422


class TestUserLogin:
    """Tests for user login endpoint"""
    
    def test_login_success(self):
        """Test successful user login"""
        # Register user first
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "password123"
            }
        )
        
        # Login
        response = client.post(
            "/api/v1/auth/login",
            data={  # OAuth2PasswordRequestForm expects form data
                "username": "testuser",
                "password": "password123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_wrong_password(self):
        """Test login with wrong password fails"""
        # Register user first
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "password123"
            }
        )
        
        # Login with wrong password
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
    
    def test_login_nonexistent_user(self):
        """Test login with nonexistent user fails"""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "nonexistent",
                "password": "password123"
            }
        )
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]


class TestProtectedEndpoints:
    """Tests for protected endpoints requiring authentication"""
    
    def test_get_current_user_success(self):
        """Test accessing protected endpoint with valid token"""
        # Register and login
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "password123"
            }
        )
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "password123"
            }
        )
        token = login_response.json()["access_token"]
        
        # Access protected endpoint
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert "hashed_password" not in data  # Should not expose password
    
    def test_get_current_user_no_token(self):
        """Test accessing protected endpoint without token fails"""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401
    
    def test_get_current_user_invalid_token(self):
        """Test accessing protected endpoint with invalid token fails"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        assert response.status_code == 401


class TestUserUpdate:
    """Tests for updating user profile"""
    
    def test_update_email_success(self):
        """Test updating user email"""
        # Register and login
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "password123"
            }
        )
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "password123"
            }
        )
        token = login_response.json()["access_token"]
        
        # Update email
        response = client.put(
            "/api/v1/auth/me",
            json={"email": "newemail@example.com"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newemail@example.com"
    
    def test_update_password_success(self):
        """Test updating user password"""
        # Register and login
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "oldpassword123"
            }
        )
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "oldpassword123"
            }
        )
        token = login_response.json()["access_token"]
        
        # Update password
        response = client.put(
            "/api/v1/auth/me",
            json={"password": "newpassword123"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        # Try logging in with new password
        login_response2 = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "newpassword123"
            }
        )
        assert login_response2.status_code == 200


class TestUserDeletion:
    """Tests for user account deletion"""
    
    def test_delete_user_success(self):
        """Test deleting user account"""
        # Register and login
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "password123"
            }
        )
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "password123"
            }
        )
        token = login_response.json()["access_token"]
        
        # Delete account
        response = client.delete(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 204
        
        # Try to access protected endpoint (should fail)
        response2 = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response2.status_code == 401
