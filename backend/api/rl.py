from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.rl.optimizer import train_ppo, recommend

router = APIRouter()

class TrainRequest(BaseModel):
    steps: int = Field(5000, ge=1000, le=100000)

@router.post("/train")
def train(req: TrainRequest):
    return {"model_path": train_ppo(req.steps)}

@router.get("/recommend")
def recommendation():
    return recommend()
