from dataclasses import dataclass

from app.core.constants import EVM_PRECISION, EVM_TOLERANCE, PerformanceStatus, ProjectHealth


@dataclass
class EVMActivityIndicators:
    pv: float
    ev: float
    cv: float
    sv: float
    cpi: float | None
    spi: float | None
    eac: float | None
    vac: float | None
    cost_status: str
    schedule_status: str


@dataclass
class EVMProjectIndicators:
    bac: float
    pv: float
    ev: float
    ac: float
    cv: float
    sv: float
    cpi: float | None
    spi: float | None
    eac: float | None
    vac: float | None
    cost_status: str
    schedule_status: str
    overall_status: str


def safe_divide(numerator: float, denominator: float) -> float | None:
    if denominator == 0.0:
        return None
    return numerator / denominator


def _get_cost_status(cpi: float | None) -> PerformanceStatus:
    if cpi is None:
        return PerformanceStatus.NO_DATA
    if cpi > 1.0 + EVM_TOLERANCE:
        return PerformanceStatus.UNDER_BUDGET
    if abs(cpi - 1.0) <= EVM_TOLERANCE:
        return PerformanceStatus.ON_BUDGET
    return PerformanceStatus.OVER_BUDGET


def _get_schedule_status(spi: float | None) -> PerformanceStatus:
    if spi is None:
        return PerformanceStatus.NO_DATA
    if spi > 1.0 + EVM_TOLERANCE:
        return PerformanceStatus.AHEAD_OF_SCHEDULE
    if abs(spi - 1.0) <= EVM_TOLERANCE:
        return PerformanceStatus.ON_SCHEDULE
    return PerformanceStatus.BEHIND_SCHEDULE


def _get_overall_status(cost: PerformanceStatus, schedule: PerformanceStatus) -> ProjectHealth:
    if cost == PerformanceStatus.NO_DATA or schedule == PerformanceStatus.NO_DATA:
        return ProjectHealth.NO_DATA

    if cost == PerformanceStatus.UNDER_BUDGET:
        if schedule == PerformanceStatus.AHEAD_OF_SCHEDULE:
            return ProjectHealth.OPTIMAL
        if schedule == PerformanceStatus.ON_SCHEDULE:
            return ProjectHealth.GOOD
        return ProjectHealth.SCHEDULE_ALERT

    if cost == PerformanceStatus.ON_BUDGET:
        if schedule == PerformanceStatus.AHEAD_OF_SCHEDULE:
            return ProjectHealth.GOOD
        if schedule == PerformanceStatus.ON_SCHEDULE:
            return ProjectHealth.ON_CONTROL
        return ProjectHealth.SCHEDULE_ALERT

    # OVER_BUDGET
    if schedule == PerformanceStatus.BEHIND_SCHEDULE:
        return ProjectHealth.CRITICAL
    return ProjectHealth.COST_ALERT


def calculate_activity_evm(
    budget_at_completion: float,
    planned_progress: float,
    actual_progress: float,
    actual_cost: float,
) -> EVMActivityIndicators:
    factor_planificado = planned_progress / 100.0
    factor_completado = actual_progress / 100.0

    pv = factor_planificado * budget_at_completion
    ev = factor_completado * budget_at_completion
    cv = ev - actual_cost
    sv = ev - pv

    cpi = safe_divide(ev, actual_cost)
    spi = safe_divide(ev, pv)

    eac = safe_divide(budget_at_completion, cpi) if cpi is not None else None
    vac = (budget_at_completion - eac) if eac is not None else None

    # Status interpretation
    cost_status = _get_cost_status(cpi)
    schedule_status = _get_schedule_status(spi)

    return EVMActivityIndicators(
        pv=round(pv, EVM_PRECISION),
        ev=round(ev, EVM_PRECISION),
        cv=round(cv, EVM_PRECISION),
        sv=round(sv, EVM_PRECISION),
        cpi=round(cpi, EVM_PRECISION) if cpi is not None else None,
        spi=round(spi, EVM_PRECISION) if spi is not None else None,
        eac=round(eac, EVM_PRECISION) if eac is not None else None,
        vac=round(vac, EVM_PRECISION) if vac is not None else None,
        cost_status=cost_status.value,
        schedule_status=schedule_status.value,
    )


@dataclass
class ActivitySummary:
    budget_at_completion: float
    planned_value: float
    earned_value: float
    actual_cost: float


def calculate_project_evm(activities: list[ActivitySummary]) -> EVMProjectIndicators:
    if not activities:
        return EVMProjectIndicators(
            bac=0.0,
            pv=0.0,
            ev=0.0,
            ac=0.0,
            cv=0.0,
            sv=0.0,
            cpi=0.0,
            spi=0.0,
            eac=0.0,
            vac=0.0,
            cost_status=PerformanceStatus.NO_DATA.value,
            schedule_status=PerformanceStatus.NO_DATA.value,
            overall_status=ProjectHealth.NO_DATA.value,
        )

    total_bac = sum(a.budget_at_completion for a in activities)
    total_pv = sum(a.planned_value for a in activities)
    total_ev = sum(a.earned_value for a in activities)
    total_ac = sum(a.actual_cost for a in activities)

    cv = total_ev - total_ac
    sv = total_ev - total_pv

    cpi = safe_divide(total_ev, total_ac)
    spi = safe_divide(total_ev, total_pv)

    eac = safe_divide(total_bac, cpi) if cpi is not None else None
    vac = (total_bac - eac) if eac is not None else None

    # Status interpretation
    cost_status = _get_cost_status(cpi)
    schedule_status = _get_schedule_status(spi)
    overall_status = _get_overall_status(cost_status, schedule_status)

    return EVMProjectIndicators(
        bac=round(total_bac, EVM_PRECISION),
        pv=round(total_pv, EVM_PRECISION),
        ev=round(total_ev, EVM_PRECISION),
        ac=round(total_ac, EVM_PRECISION),
        cv=round(cv, EVM_PRECISION),
        sv=round(sv, EVM_PRECISION),
        cpi=round(cpi, EVM_PRECISION) if cpi is not None else None,
        spi=round(spi, EVM_PRECISION) if spi is not None else None,
        eac=round(eac, EVM_PRECISION) if eac is not None else None,
        vac=round(vac, EVM_PRECISION) if vac is not None else None,
        cost_status=cost_status.value,
        schedule_status=schedule_status.value,
        overall_status=overall_status.value,
    )
