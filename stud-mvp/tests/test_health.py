"""
Basic test for the health endpoint
Run with: pytest
"""
import pytest
from fastapi.testclient import TestClient
import sys
sys.path.insert(0, '../backend')

from main import app

client = TestClient(app)

def test_health_endpoint():
    """Test that the health endpoint returns 200 OK"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert data["service"] == "stud-backend"

def test_root_endpoint():
    """Test that the root endpoint returns API info"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "docs" in data
    assert data["docs"] == "/docs"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
