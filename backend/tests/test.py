import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import sys
import os

# ✅ SET ENV BEFORE IMPORTS (CRITICAL)
os.environ["MASTER_KEY"] = "test_master_key_123456"
os.environ["SUPABASE_URL"] = "https://dummy.supabase.co"
os.environ["SUPABASE_SERVICE_KEY"] = "dummy_key"

# Add backend root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


# ✅ MOCK AUTH PROPERLY
@pytest.fixture(autouse=True)
def mock_auth():
    mock_user = Mock()
    mock_user.id = "550e8400-e29b-41d4-a716-446655440000"
    mock_user.email = "test@example.com"

    mock_auth_response = Mock()
    mock_auth_response.user = mock_user

    with patch("app.dependencies.supabase.auth.get_user", return_value=mock_auth_response):
        yield


# ✅ MOCK SUPABASE CLIENT SAFELY
@pytest.fixture(autouse=True)
def mock_supabase():
    mock_response = Mock()
    mock_response.data = []
    mock_response.count = 0

    mock_table = Mock()
    mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
    mock_table.select.return_value.eq.return_value.execute.return_value = mock_response
    mock_table.select.return_value.execute.return_value = mock_response
    mock_table.insert.return_value.execute.return_value = mock_response

    with patch("app.services.supabase_client.supabase") as mock_supabase:
        mock_supabase.table.return_value = mock_table
        yield


@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer fake-token"}


# ---------------- TESTS ---------------- #

def test_app_starts(client):
    response = client.get("/")
    assert response.status_code in [200, 404]


def test_api_endpoints_authenticated(client, auth_headers):
    endpoints = [
        "/api/contracts",
        "/api/templates",
        "/api/dashboard"
    ]

    for endpoint in endpoints:
        response = client.get(endpoint, headers=auth_headers)

        # ✅ Should not be auth failure
        assert response.status_code != 401


def test_contract_creation_validation_authenticated(client, auth_headers):
    response = client.post(
        "/api/contracts",
        json={},   # ✅ FIXED
        headers=auth_headers
    )

    assert response.status_code == 422


def test_contract_creation_with_data_authenticated(client, auth_headers):
    response = client.post(
        "/api/contracts",
        json={
            "title": "Test Contract",
            "emails": ["test@example.com"]   # ✅ better format
        },
        headers=auth_headers
    )

    # Should pass auth layer
    assert response.status_code != 401