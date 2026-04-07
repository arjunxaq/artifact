import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import sys
import os
import warnings

os.environ["MASTER_KEY"] = "test_master_key_123456"
os.environ["SUPABASE_URL"] = "https://dummy.supabase.co"
os.environ["SUPABASE_SERVICE_KEY"] = "dummy_key"

warnings.filterwarnings("ignore", category=DeprecationWarning)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def mock_auth():
    mock_user = Mock()
    mock_user.id = "550e8400-e29b-41d4-a716-446655440000"
    mock_user.email = "test@example.com"

    # Override dependency directly (cleaner than patching supabase.auth)
    with patch("app.dependencies.get_current_user", return_value=mock_user):
        yield


@pytest.fixture(autouse=True)
def mock_supabase():
    # Create a smart mock that returns appropriate responses based on the query
    class SmartMockResponse:
        def __init__(self, data=None, count=None):
            self.data = data if data is not None else []
            self.count = count

    class SmartMockTable:
        def __init__(self):
            self._call_count = 0
            self._responses = [
                SmartMockResponse(count=0),  # managed count
                SmartMockResponse(count=0),  # assigned count
                SmartMockResponse(data=[]),  # pending contracts
                SmartMockResponse(data=[]),  # notifications
            ]

        def select(self, *args, **kwargs):
            return self

        def eq(self, *args, **kwargs):
            return self

        def order(self, *args, **kwargs):
            return self

        def execute(self):
            # Return different responses for dashboard queries
            if self._call_count < len(self._responses):
                response = self._responses[self._call_count]
                self._call_count += 1
                return response
            return SmartMockResponse(data=[])

        def insert(self, *args, **kwargs):
            return self

        def update(self, *args, **kwargs):
            return self

        def delete(self, *args, **kwargs):
            return self

    mock_table = SmartMockTable()

    mock_client = Mock()
    mock_client.table.return_value = mock_table
    mock_client.storage.from_.return_value.upload.return_value = None
    mock_client.storage.from_.return_value.create_signed_url.return_value = "signed-url"

    # Patch ALL entry points including the supabase client creation
    with patch("supabase.create_client", return_value=mock_client), \
         patch("app.services.supabase_client.supabase", mock_client), \
         patch("app.dependencies.supabase", mock_client), \
         patch("app.routes.contracts.supabase", mock_client):

        yield


@pytest.fixture(autouse=True)
def mock_redis():
    """Mock Redis client"""
    mock_redis_client = Mock()
    mock_redis_client.get.return_value = None
    mock_redis_client.setex.return_value = None
    mock_redis_client.delete.return_value = None

    with patch("app.services.redis_service.redis_client", mock_redis_client), \
         patch("app.routes.contracts.redis_client", mock_redis_client):

        yield


# -------------------------------
# HEADERS
# -------------------------------
@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer fake-token"}


# -------------------------------
# TESTS
# -------------------------------

def test_app_starts(client):
    response = client.get("/")
    assert response.status_code in [200, 404]


def test_api_endpoints_authenticated(client, auth_headers):
    endpoints = [
        "/api/contracts",  # GET contracts list
        "/api/templates",  # GET templates
        "/api/dashboard"   # GET dashboard
    ]

    for endpoint in endpoints:
        response = client.get(endpoint, headers=auth_headers)

        # Must NOT be auth failure - should get past auth layer
        assert response.status_code != 401, f"Endpoint {endpoint} failed authentication"


def test_contract_creation_validation_authenticated(client, auth_headers):
    response = client.post(
        "/api/contracts",
        json={},   # correct format
        headers=auth_headers
    )

    assert response.status_code == 422


def test_contract_creation_with_data_authenticated(client, auth_headers):
    response = client.post(
        "/api/contracts",
        json={
            "title": "Test Contract",
            "emails": ["test@example.com"]
        },
        headers=auth_headers
    )

    # Should pass auth layer
    assert response.status_code != 401