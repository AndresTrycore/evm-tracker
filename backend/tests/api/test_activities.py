from fastapi.testclient import TestClient


def test_create_activity_invalid_progress(client: TestClient) -> None:
    proj_res = client.post("/api/v1/projects", json={"name": "Activity Proj"})
    proj_id = proj_res.json()["id"]

    response = client.post(
        f"/api/v1/projects/{proj_id}/activities",
        json={
            "name": "Bad Progress",
            "budget_at_completion": 100.0,
            "planned_progress": 150.0,  # Invalid
            "actual_progress": 0.0,
            "actual_cost": 0.0,
        },
    )
    assert response.status_code == 422


def test_update_activity(client: TestClient) -> None:
    proj_res = client.post("/api/v1/projects", json={"name": "Activity Proj 2"})
    proj_id = proj_res.json()["id"]

    act_res = client.post(
        f"/api/v1/projects/{proj_id}/activities",
        json={
            "name": "Dev",
            "budget_at_completion": 1000.0,
            "planned_progress": 0.0,
            "actual_progress": 0.0,
            "actual_cost": 0.0,
        },
    )
    act_id = act_res.json()["id"]

    # Update progress and cost
    upd_res = client.put(
        f"/api/v1/projects/{proj_id}/activities/{act_id}",
        json={"actual_progress": 50.0, "actual_cost": 500.0},
    )
    assert upd_res.status_code == 200
    assert upd_res.json()["actual_progress"] == 50.0


def test_delete_activity(client: TestClient) -> None:
    proj_res = client.post("/api/v1/projects", json={"name": "Activity Proj 3"})
    proj_id = proj_res.json()["id"]

    act_res = client.post(
        f"/api/v1/projects/{proj_id}/activities",
        json={
            "name": "To Delete",
            "budget_at_completion": 100.0,
            "planned_progress": 0.0,
            "actual_progress": 0.0,
            "actual_cost": 0.0,
        },
    )
    act_id = act_res.json()["id"]

    del_res = client.delete(f"/api/v1/projects/{proj_id}/activities/{act_id}")
    assert del_res.status_code == 204

    # Verify it is deleted in the project
    proj_get = client.get(f"/api/v1/projects/{proj_id}")
    assert len(proj_get.json()["activities"]) == 0


def test_create_activity_returns_201_with_evm(client: TestClient) -> None:
    proj_res = client.post("/api/v1/projects", json={"name": "EVM Activity Proj"})
    proj_id = proj_res.json()["id"]

    response = client.post(
        f"/api/v1/projects/{proj_id}/activities",
        json={
            "name": "Design",
            "budget_at_completion": 10000.0,
            "planned_progress": 50.0,
            "actual_progress": 30.0,
            "actual_cost": 4000.0,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Design"
    assert "id" in data
    assert "project_id" in data
    assert data["evm"]["planned_value"] == 5000.0
    assert data["evm"]["earned_value"] == 3000.0
    assert data["evm"]["cost_variance"] == -1000.0


def test_list_activities(client: TestClient) -> None:
    proj_res = client.post("/api/v1/projects", json={"name": "List Act Proj"})
    proj_id = proj_res.json()["id"]

    # Create two activities
    client.post(
        f"/api/v1/projects/{proj_id}/activities",
        json={
            "name": "Act 1",
            "budget_at_completion": 100.0,
            "planned_progress": 0.0,
            "actual_progress": 0.0,
            "actual_cost": 0.0,
        },
    )
    client.post(
        f"/api/v1/projects/{proj_id}/activities",
        json={
            "name": "Act 2",
            "budget_at_completion": 200.0,
            "planned_progress": 0.0,
            "actual_progress": 0.0,
            "actual_cost": 0.0,
        },
    )

    response = client.get(f"/api/v1/projects/{proj_id}/activities")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    names = {a["name"] for a in data}
    assert names == {"Act 1", "Act 2"}


