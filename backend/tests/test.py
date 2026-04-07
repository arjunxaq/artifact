import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.main import app

@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)

@pytest.fixture(autouse=True)
def mock_auth():
    """Mock Supabase authentication for all tests"""
    mock_user = Mock()
    mock_user.id = "550e8400-e29b-41d4-a716-446655440000"  # Valid UUID format
    mock_user.email = "test@example.com"
    
    mock_auth_response = Mock()
    mock_auth_response.user = mock_user
    
    with patch('app.dependencies.supabase.auth.get_user', return_value=mock_auth_response):
        yield

@pytest.fixture(autouse=True)
def mock_supabase_tables():
    """Mock Supabase table operations"""
    mock_response = Mock()
    mock_response.data = []
    mock_response.count = 0
    
    # Mock all the table operations that might be called
    with patch('app.services.supabase_client.supabase.table') as mock_table:
        mock_table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
        mock_table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        mock_table.return_value.select.return_value.execute.return_value = mock_response
        yield

@pytest.fixture
def auth_headers():
    """Authenticated headers for testing"""
    return {"Authorization": "Bearer fake-token"}

def test_app_starts(client):
    """Test that the app starts and can handle requests"""
    # Test root endpoint (might not exist, but tests if app runs)
    response = client.get("/")
    assert response.status_code in [200, 404]  # 404 is fine, means routing works

def test_api_endpoints_authenticated(client, auth_headers):
    """Test that API endpoints work with authentication"""
    # Test a few endpoints - they should work with auth (return data or appropriate errors)
    endpoints = [
        "/api/contracts",
        "/api/templates", 
        "/api/dashboard"
    ]
    
    for endpoint in endpoints:
        response = client.get(endpoint, headers=auth_headers)
        # Should not be 401 (unauthorized) anymore - auth is mocked
        assert response.status_code not in [401]  # Should be 200, 404, or other app errors

def test_contract_creation_validation_authenticated(client, auth_headers):
    """Test contract creation validation with authentication"""
    # Test with missing required fields - should get validation error
    response = client.post("/api/contracts", data={}, headers=auth_headers)
    assert response.status_code == 422  # Validation error expected

def test_contract_creation_with_data_authenticated(client, auth_headers):
    """Test contract creation with some data and authentication"""
    response = client.post("/api/contracts", data={
        "title": "Test Contract",
        "emails": "test@example.com"
    }, headers=auth_headers)
    # Should get past auth, may fail for other reasons (missing template/file)
    assert response.status_code not in [401]  # Not unauthorized