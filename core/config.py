from dataclasses import dataclass


@dataclass(frozen=True)
class WorkIncomeConfig:
    """Default config values for work-income tracking."""

    currency: str = "CNY"
    monthly_income: float = 15000.0
    work_hours_per_day: float = 8.0
    work_start: str = "09:00"
    lunch_start: str = "12:00"
    lunch_end: str = "13:30"
    work_end: str = "18:00"


DEFAULT_CONFIG = WorkIncomeConfig()
