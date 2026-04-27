from backend.app.services.evm_service import (
    ActivitySummary,
    calculate_activity_evm,
    calculate_project_evm,
)


def test_activity_normal_calculation() -> None:
    # BAC=10000, Plan=50%, Actual=30%, AC=4000
    res = calculate_activity_evm(
        budget_at_completion=10000.0,
        planned_progress=50.0,
        actual_progress=30.0,
        actual_cost=4000.0,
    )
    assert res.pv == 5000.0
    assert res.ev == 3000.0
    assert res.cv == -1000.0
    assert res.sv == -2000.0
    assert res.cpi == 0.75
    assert res.spi == 0.6
    assert res.eac == 13333.3333
    assert res.vac == -3333.3333
    assert res.cost_status == "sobre presupuesto"
    assert res.schedule_status == "atrasado"


def test_activity_zero_division_ac() -> None:
    # AC = 0 -> CPI, EAC, VAC are None
    res = calculate_activity_evm(
        budget_at_completion=10000.0,
        planned_progress=50.0,
        actual_progress=30.0,
        actual_cost=0.0,
    )
    assert res.cv == 3000.0
    assert res.cpi is None
    assert res.eac is None
    assert res.vac is None
    assert res.cost_status == "sin datos"


def test_activity_zero_division_pv() -> None:
    # PV = 0 -> SPI is None
    res = calculate_activity_evm(
        budget_at_completion=10000.0,
        planned_progress=0.0,
        actual_progress=30.0,
        actual_cost=4000.0,
    )
    assert res.pv == 0.0
    assert res.spi is None
    assert res.schedule_status == "sin datos"


def test_project_no_activities() -> None:
    res = calculate_project_evm([])
    assert res.total_bac == 0.0
    assert res.cpi == 0.0
    assert res.cost_status == "sin datos"


def test_project_with_activities() -> None:
    act1 = ActivitySummary(
        budget_at_completion=1000, planned_value=500, earned_value=500, actual_cost=400
    )
    act2 = ActivitySummary(
        budget_at_completion=2000,
        planned_value=2000,
        earned_value=1000,
        actual_cost=1000,
    )

    res = calculate_project_evm([act1, act2])

    assert res.total_bac == 3000.0
    assert res.total_pv == 2500.0
    assert res.total_ev == 1500.0
    assert res.total_ac == 1400.0
    assert res.cv == 100.0
    assert res.sv == -1000.0
    assert res.cpi == round(1500 / 1400, 4)
    assert res.spi == round(1500 / 2500, 4)
    assert res.cost_status == "bajo presupuesto"
    assert res.schedule_status == "atrasado"


def test_tolerance() -> None:
    # EV=100, AC=99.91 -> CPI=1.0009 -> en presupuesto (diff < 0.001)
    res = calculate_activity_evm(1000.0, 10.0, 10.0, 99.91)
    assert res.cost_status == "en presupuesto"


def test_activity_adelantado() -> None:
    # SPI > 1.0 + TOLERANCE
    res = calculate_activity_evm(
        budget_at_completion=10000.0,
        planned_progress=20.0,
        actual_progress=50.0,
        actual_cost=5000.0,
    )
    # PV = 2000, EV = 5000 -> SPI = 2.5
    assert res.spi == 2.5
    assert res.schedule_status == "adelantado"
