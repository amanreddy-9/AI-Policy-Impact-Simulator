from fastapi import APIRouter
from backend.causal.effects import get_effects

router = APIRouter()

@router.get("/effects")
def effects():
    out = {}
    for group, vals in get_effects().items():
        out[group] = {k: vars(v) for k, v in vals.items()}
    return {
        "status": "demo",
        "warning": "Illustrative coefficients only until replaced by validated historical estimates.",
        "effects": out
    }
