from backend.app.main import app
from fastapi.testclient import TestClient


def test_health_endpoint_returns_ok() -> None:
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_route_is_registered() -> None:
    routes = {getattr(route, "path", None) for route in app.router.routes}

    assert "/health" in routes
