from fastapi.testclient import TestClient


def test_create_project(client: TestClient) -> None:
    response = client.post(
        "/api/v1/projects", json={"name": "Test Project", "description": "Desc"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
    assert "id" in data



def test_get_projects(client: TestClient) -> None:
    # Crear uno
    client.post("/api/v1/projects", json={"name": "List Project"})

    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert response.json()[-1]["name"] == "List Project"


def test_get_project_with_evm_returns_correct_indicators(client: TestClient) -> None:
    # 1. Create project
    proj_res = client.post("/api/v1/projects", json={"name": "EVM Proj"})
    proj_id = proj_res.json()["id"]

    # 2. Create activity
    act_res = client.post(
        f"/api/v1/projects/{proj_id}/activities",
        json={
            "name": "Dev",
            "budget_at_completion": 10000.0,
            "planned_progress": 50.0,
            "actual_progress": 30.0,
            "actual_cost": 4000.0,
        },
    )
    assert act_res.status_code == 201

    # 3. Get project
    response = client.get(f"/api/v1/projects/{proj_id}")
    assert response.status_code == 200
    data = response.json()

    # Check EVM indicators inside activity
    evm = data["activities"][0]["evm"]
    assert evm["planned_value"] == 5000.0
    assert evm["earned_value"] == 3000.0
    assert evm["cost_variance"] == -1000.0
    assert evm["cost_performance_index"] == 0.75

    # Check EVM summary inside project
    summary = data["evm_summary"]
    assert summary["cost_status"] == "sobre presupuesto"
    assert summary["schedule_status"] == "atrasado"


def test_update_project(client: TestClient) -> None:
    proj_res = client.post("/api/v1/projects", json={"name": "Update Me"})
    proj_id = proj_res.json()["id"]

    response = client.put(f"/api/v1/projects/{proj_id}", json={"name": "Updated"})
    assert response.status_code == 200
    assert response.json()["name"] == "Updated"


def test_delete_project(client: TestClient) -> None:
    proj_res = client.post("/api/v1/projects", json={"name": "Delete Me"})
    proj_id = proj_res.json()["id"]

    response = client.delete(f"/api/v1/projects/{proj_id}")
    assert response.status_code == 204

    # Verify it's gone
    assert client.get(f"/api/v1/projects/{proj_id}").status_code == 404


def test_get_project_not_found(client: TestClient) -> None:
    fake_id = "00000000-0000-0000-0000-000000000000"
    response = client.get(f"/api/v1/projects/{fake_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == f"Proyecto con id {fake_id} no encontrado"


def test_create_project_with_empty_name_returns_422(client: TestClient) -> None:
    response = client.post("/api/v1/projects", json={"name": ""})
    assert response.status_code == 422


def test_update_activity_recalculates_project_indicators(
    client: TestClient,
) -> None:
    # 1. Create project with activity
    proj_res = client.post("/api/v1/projects", json={"name": "Recalc Proj"})
    proj_id = proj_res.json()["id"]

    act_res = client.post(
        f"/api/v1/projects/{proj_id}/activities",
        json={
            "name": "Task",
            "budget_at_completion": 10000.0,
            "planned_progress": 50.0,
            "actual_progress": 30.0,
            "actual_cost": 4000.0,
        },
    )
    act_id = act_res.json()["id"]

    # 2. Get initial EVM
    initial = client.get(f"/api/v1/projects/{proj_id}").json()
    initial_ev = initial["activities"][0]["evm"]["earned_value"]
    assert initial_ev == 3000.0

    # 3. Update activity progress
    client.put(
        f"/api/v1/projects/{proj_id}/activities/{act_id}",
        json={"actual_progress": 80.0},
    )

    # 4. Verify EVM recalculated
    updated = client.get(f"/api/v1/projects/{proj_id}").json()
    updated_ev = updated["activities"][0]["evm"]["earned_value"]
    assert updated_ev == 8000.0  # 80% * 10000


def test_response_includes_cpi_and_spi_status_interpretation(
    client: TestClient,
) -> None:
    proj_res = client.post("/api/v1/projects", json={"name": "Status Proj"})
    proj_id = proj_res.json()["id"]

    client.post(
        f"/api/v1/projects/{proj_id}/activities",
        json={
            "name": "Dev",
            "budget_at_completion": 10000.0,
            "planned_progress": 50.0,
            "actual_progress": 30.0,
            "actual_cost": 4000.0,
        },
    )

    response = client.get(f"/api/v1/projects/{proj_id}")
    summary = response.json()["evm_summary"]

    # Verify both status fields exist and have valid values
    assert summary["cost_status"] in [
        "bajo presupuesto",
        "en presupuesto",
        "sobre presupuesto",
        "sin datos",
    ]
    assert summary["schedule_status"] in [
        "adelantado",
        "en cronograma",
        "atrasado",
        "sin datos",
    ]


def test_response_indicators_are_rounded_to_two_decimals(
    client: TestClient,
) -> None:
    proj_res = client.post("/api/v1/projects", json={"name": "Rounding Proj"})
    proj_id = proj_res.json()["id"]

    # BAC=10000, Plan=50%, Actual=30%, AC=4000
    # CPI = 3000/4000 = 0.75 (exact)
    # EAC = 10000/0.75 = 13333.3333... → should be 13333.33 in response
    client.post(
        f"/api/v1/projects/{proj_id}/activities",
        json={
            "name": "Dev",
            "budget_at_completion": 10000.0,
            "planned_progress": 50.0,
            "actual_progress": 30.0,
            "actual_cost": 4000.0,
        },
    )

    response = client.get(f"/api/v1/projects/{proj_id}")
    evm = response.json()["activities"][0]["evm"]

    assert evm["estimate_at_completion"] == 13333.33
    assert evm["variance_at_completion"] == -3333.33



