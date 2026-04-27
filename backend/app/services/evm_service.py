from dataclasses import dataclass

TOLERANCE = 0.001


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



def safe_divide(numerator: float, denominator: float) -> float | None:
    if denominator == 0.0:
        return None
    return numerator / denominator


def _get_cost_status(cpi: float | None) -> str:
    if cpi is None:
        return "sin datos"
    if cpi > 1.0 + TOLERANCE:
        return "bajo presupuesto"
    if abs(cpi - 1.0) <= TOLERANCE:
        return "en presupuesto"
    return "sobre presupuesto"


def _get_schedule_status(spi: float | None) -> str:
    if spi is None:
        return "sin datos"
    if spi > 1.0 + TOLERANCE:
        return "adelantado"
    if abs(spi - 1.0) <= TOLERANCE:
        return "en cronograma"
    return "atrasado"


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

    # Redondeo
    pv = round(pv, 4)
    ev = round(ev, 4)
    cv = round(cv, 4)
    sv = round(sv, 4)
    cpi_rnd = round(cpi, 4) if cpi is not None else None
    spi_rnd = round(spi, 4) if spi is not None else None
    eac_rnd = round(eac, 4) if eac is not None else None
    vac_rnd = round(vac, 4) if vac is not None else None

    return EVMActivityIndicators(
        pv=pv,
        ev=ev,
        cv=cv,
        sv=sv,
        cpi=cpi_rnd,
        spi=spi_rnd,
        eac=eac_rnd,
        vac=vac_rnd,
        cost_status=_get_cost_status(cpi),
        schedule_status=_get_schedule_status(spi),
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
            cost_status="sin datos",
            schedule_status="sin datos",
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

    return EVMProjectIndicators(
        bac=round(total_bac, 4),
        pv=round(total_pv, 4),
        ev=round(total_ev, 4),
        ac=round(total_ac, 4),
        cv=round(cv, 4),
        sv=round(sv, 4),
        cpi=round(cpi, 4) if cpi is not None else None,
        spi=round(spi, 4) if spi is not None else None,
        eac=round(eac, 4) if eac is not None else None,
        vac=round(vac, 4) if vac is not None else None,
        cost_status=_get_cost_status(cpi),
        schedule_status=_get_schedule_status(spi),
    )

