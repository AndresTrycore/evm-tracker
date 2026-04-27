"""Mandatory EVM unit tests per quality_standards.md §5.2.

Covers: nominal cases, edge cases, interpretation, and project consolidation.
"""

from app.services.evm_service import (
    ActivitySummary,
    calculate_activity_evm,
    calculate_project_evm,
)

# ── Caso nominal ────────────────────────────────────────────────────────────


def test_planned_value_equals_planned_percent_times_bac() -> None:
    """PV = planned_percent * BAC"""
    res = calculate_activity_evm(10000.0, 50.0, 30.0, 4000.0)
    assert res.pv == 5000.0


def test_earned_value_equals_completed_percent_times_bac() -> None:
    """EV = completed_percent * BAC"""
    res = calculate_activity_evm(10000.0, 50.0, 30.0, 4000.0)
    assert res.ev == 3000.0


def test_cost_variance_positive_means_under_budget() -> None:
    """CV > 0 → se avanza más de lo que cuesta"""
    # EV=5000, AC=3000 → CV=2000
    res = calculate_activity_evm(10000.0, 50.0, 50.0, 3000.0)
    assert res.cv > 0
    assert res.cv == 2000.0


def test_schedule_variance_negative_means_behind_schedule() -> None:
    """SV < 0 → se avanzó menos de lo planificado"""
    # PV=5000, EV=3000 → SV=-2000
    res = calculate_activity_evm(10000.0, 50.0, 30.0, 4000.0)
    assert res.sv < 0
    assert res.sv == -2000.0


def test_cpi_greater_than_one_means_cost_efficient() -> None:
    """CPI > 1 → cada peso gastado produce más de un peso de valor"""
    # EV=5000, AC=3000 → CPI=1.6667
    res = calculate_activity_evm(10000.0, 50.0, 50.0, 3000.0)
    assert res.cpi is not None
    assert res.cpi > 1.0


def test_spi_greater_than_one_means_ahead_of_schedule() -> None:
    """SPI > 1 → se avanza más rápido de lo planificado"""
    # PV=2000, EV=5000 → SPI=2.5
    res = calculate_activity_evm(10000.0, 20.0, 50.0, 5000.0)
    assert res.spi is not None
    assert res.spi > 1.0
    assert res.spi == 2.5


def test_eac_equals_bac_divided_by_cpi() -> None:
    """EAC = BAC / CPI"""
    # BAC=10000, CPI=0.75 → EAC=13333.3333
    res = calculate_activity_evm(10000.0, 50.0, 30.0, 4000.0)
    assert res.eac == 13333.3333


def test_vac_equals_bac_minus_eac() -> None:
    """VAC = BAC - EAC"""
    # BAC=10000, EAC=13333.3333 → VAC=-3333.3333
    res = calculate_activity_evm(10000.0, 50.0, 30.0, 4000.0)
    assert res.vac == -3333.3333


# ── Casos borde ─────────────────────────────────────────────────────────────


def test_cpi_when_actual_cost_is_zero_returns_none() -> None:
    """AC = 0 → CPI=None, EAC=None, VAC=None"""
    res = calculate_activity_evm(10000.0, 50.0, 30.0, 0.0)
    assert res.cpi is None
    assert res.eac is None
    assert res.vac is None
    assert res.cost_status == "sin datos"


def test_spi_when_planned_value_is_zero_returns_none() -> None:
    """PV = 0 → SPI=None"""
    res = calculate_activity_evm(10000.0, 0.0, 30.0, 4000.0)
    assert res.pv == 0.0
    assert res.spi is None
    assert res.schedule_status == "sin datos"


def test_eac_when_cpi_approaches_zero_is_handled() -> None:
    """CPI ≈ 0 (EV=0, AC>0) → EAC=None, VAC=None

    When EV=0 and AC>0, CPI=0/AC which safe_divide handles as 0.0.
    Then EAC=BAC/0.0 → None (second safe_divide catches it).
    Actually: EV=0 → CPI=safe_divide(0, AC)=0.0 → EAC=safe_divide(BAC, 0.0)=None.
    """
    res = calculate_activity_evm(10000.0, 50.0, 0.0, 5000.0)
    assert res.ev == 0.0
    assert res.cpi == 0.0
    # CPI=0 means EAC=BAC/0=None
    assert res.eac is None
    assert res.vac is None


def test_activity_with_zero_progress_produces_zero_ev() -> None:
    """% completado = 0 → EV = 0"""
    res = calculate_activity_evm(10000.0, 50.0, 0.0, 0.0)
    assert res.ev == 0.0


def test_activity_with_full_completion_equals_bac() -> None:
    """% completado = 100 → EV = BAC"""
    res = calculate_activity_evm(10000.0, 50.0, 100.0, 8000.0)
    assert res.ev == 10000.0


def test_activity_with_zero_bac_returns_zero_for_all_value_indicators() -> None:
    """BAC = 0 → PV = EV = 0 sin errores"""
    res = calculate_activity_evm(0.0, 50.0, 30.0, 0.0)
    assert res.pv == 0.0
    assert res.ev == 0.0
    assert res.cv == 0.0
    assert res.sv == 0.0


def test_project_with_no_activities_returns_zeroed_indicators() -> None:
    """Proyecto sin actividades → todos los indicadores consolidados = 0"""
    res = calculate_project_evm([])
    assert res.bac == 0.0
    assert res.pv == 0.0
    assert res.ev == 0.0
    assert res.ac == 0.0
    assert res.cv == 0.0
    assert res.sv == 0.0
    assert res.cpi == 0.0
    assert res.spi == 0.0
    assert res.eac == 0.0
    assert res.vac == 0.0
    assert res.cost_status == "sin datos"
    assert res.schedule_status == "sin datos"


# ── Interpretación ───────────────────────────────────────────────────────────


def test_cpi_status_over_one_returns_under_budget() -> None:
    """CPI > 1 → status = 'bajo presupuesto'"""
    # EV=5000, AC=3000 → CPI=1.667
    res = calculate_activity_evm(10000.0, 50.0, 50.0, 3000.0)
    assert res.cost_status == "bajo presupuesto"


def test_cpi_status_under_one_returns_over_budget() -> None:
    """CPI < 1 → status = 'sobre presupuesto'"""
    # EV=3000, AC=4000 → CPI=0.75
    res = calculate_activity_evm(10000.0, 50.0, 30.0, 4000.0)
    assert res.cost_status == "sobre presupuesto"


def test_cpi_status_at_one_returns_on_budget() -> None:
    """CPI ≈ 1.0 (within tolerance) → status = 'en presupuesto'"""
    # EV=100, AC≈100 → CPI≈1.0
    res = calculate_activity_evm(1000.0, 10.0, 10.0, 99.91)
    assert res.cost_status == "en presupuesto"


def test_spi_status_over_one_returns_ahead_of_schedule() -> None:
    """SPI > 1 → status = 'adelantado'"""
    res = calculate_activity_evm(10000.0, 20.0, 50.0, 5000.0)
    assert res.schedule_status == "adelantado"


def test_spi_status_under_one_returns_behind_schedule() -> None:
    """SPI < 1 → status = 'atrasado'"""
    # PV=5000, EV=3000 → SPI=0.6
    res = calculate_activity_evm(10000.0, 50.0, 30.0, 4000.0)
    assert res.schedule_status == "atrasado"


def test_spi_status_at_one_returns_on_schedule() -> None:
    """SPI ≈ 1.0 (within tolerance) → status = 'en cronograma'"""
    # PV=EV → SPI=1.0
    res = calculate_activity_evm(10000.0, 50.0, 50.0, 5000.0)
    assert res.schedule_status == "en cronograma"


# ── Consolidación por proyecto ───────────────────────────────────────────────


def test_project_consolidated_bac_equals_sum_of_activities() -> None:
    """BAC proyecto = Σ BAC actividades"""
    activities = [
        ActivitySummary(
            budget_at_completion=1000, planned_value=500,
            earned_value=500, actual_cost=400,
        ),
        ActivitySummary(
            budget_at_completion=2000, planned_value=1000,
            earned_value=800, actual_cost=900,
        ),
    ]
    res = calculate_project_evm(activities)
    assert res.bac == 3000.0


def test_project_consolidated_cpi_uses_summed_ev_and_ac() -> None:
    """CPI consolidado = Σ EV / Σ AC (no promedio de CPIs)"""
    activities = [
        ActivitySummary(
            budget_at_completion=1000, planned_value=500,
            earned_value=500, actual_cost=400,
        ),
        ActivitySummary(
            budget_at_completion=2000, planned_value=2000,
            earned_value=1000, actual_cost=1000,
        ),
    ]
    res = calculate_project_evm(activities)
    # CPI = (500+1000) / (400+1000) = 1500/1400 ≈ 1.0714
    expected_cpi = round(1500 / 1400, 4)
    assert res.cpi == expected_cpi


def test_project_with_activities_returns_correct_summary() -> None:
    """Integration: full project calculation with multiple activities."""
    act1 = ActivitySummary(
        budget_at_completion=1000, planned_value=500,
        earned_value=500, actual_cost=400,
    )
    act2 = ActivitySummary(
        budget_at_completion=2000, planned_value=2000,
        earned_value=1000, actual_cost=1000,
    )
    res = calculate_project_evm([act1, act2])

    assert res.bac == 3000.0
    assert res.pv == 2500.0
    assert res.ev == 1500.0
    assert res.ac == 1400.0
    assert res.cv == 100.0
    assert res.sv == -1000.0
    assert res.cost_status == "bajo presupuesto"
    assert res.schedule_status == "atrasado"


def test_project_health_classification_matrix() -> None:
    """Verify the CPI + SPI combinations for overall health status."""

    def get_health(cpi_val: float, spi_val: float) -> str:
        # BAC=1000, AC=1000/CPI -> AC depends on CPI to get target CPI
        # PV=500, EV=PV*SPI=500*SPI
        # But project calc uses sums. Simpler to use ActivitySummary.
        # CPI = EV/AC, SPI = EV/PV
        # If PV=1000, EV=1000*SPI. Then AC=EV/CPI = (1000*SPI)/CPI.
        ev = 1000.0 * spi_val
        ac = ev / cpi_val
        activities = [
            ActivitySummary(
                budget_at_completion=1000.0,
                planned_value=1000.0,
                earned_value=ev,
                actual_cost=ac,
            )
        ]
        return calculate_project_evm(activities).overall_status

    # Matrix combinations (§8.1)
    assert get_health(1.2, 1.2) == "óptimo"  # Bajo presupuesto, Adelantado
    assert get_health(1.2, 1.0) == "bien"  # Bajo presupuesto, En cronograma
    assert get_health(1.2, 0.8) == "alerta cronograma"  # Bajo presupuesto, Atrasado
    assert get_health(1.0, 1.2) == "bien"  # En presupuesto, Adelantado
    assert get_health(1.0, 1.0) == "en control"  # En presupuesto, En cronograma
    assert get_health(1.0, 0.8) == "alerta cronograma"  # En presupuesto, Atrasado
    assert get_health(0.8, 1.2) == "alerta costo"  # Sobre presupuesto, Adelantado
    assert get_health(0.8, 1.0) == "alerta costo"  # Sobre presupuesto, En cronograma
    assert get_health(0.8, 0.8) == "crítico"  # Sobre presupuesto, Atrasado

