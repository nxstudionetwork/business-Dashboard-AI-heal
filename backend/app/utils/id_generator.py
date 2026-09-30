import secrets
from datetime import datetime

class IDGenerator:
    _counters = {}

    @classmethod
    def generate(cls, prefix: str) -> str:
        year = datetime.now().year
        key = f"{prefix}_{year}"
        if key not in cls._counters:
            cls._counters[key] = 0
        cls._counters[key] += 1
        suffix = secrets.token_hex(2).upper()
        return f"{prefix}-{year}-{cls._counters[key]:06d}-{suffix}"

ID_PREFIXES = {
    "lead": "L",
    "client": "CLI",
    "project": "PRO",
    "quotation": "QUO",
    "invoice": "INV",
    "payment": "PAY",
    "expense": "EXP",
    "document": "DOC",
    "calendar": "CAL",
    "note": "NTE",
    "task": "TSK"
}
