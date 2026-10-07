from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.simulation.monte_carlo import simulate

router = APIRouter()

class SimulationRequest(BaseModel):
    transfer: float = Field(6000, ge=4000, le=12000)
    rounds: int = Field(1000, ge=100, le=10000)

@router.post("/simulate")
def run_simulation(req: SimulationRequest):
    return simulate(req.transfer, req.rounds).to_dict(orient="records")
