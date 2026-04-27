from enum import StrEnum


class PerformanceStatus(StrEnum):
    UNDER_BUDGET = "bajo presupuesto"
    OVER_BUDGET = "sobre presupuesto"
    ON_BUDGET = "en presupuesto"
    AHEAD_OF_SCHEDULE = "adelantado"
    ON_SCHEDULE = "en cronograma"
    BEHIND_SCHEDULE = "atrasado"
    NO_DATA = "sin datos"


class ProjectHealth(StrEnum):
    OPTIMAL = "óptimo"
    GOOD = "bien"
    ON_CONTROL = "en control"
    SCHEDULE_ALERT = "alerta cronograma"
    COST_ALERT = "alerta costo"
    CRITICAL = "crítico"
    NO_DATA = "sin datos"


EVM_TOLERANCE = 0.001
EVM_PRECISION = 4
API_PRECISION = 2
