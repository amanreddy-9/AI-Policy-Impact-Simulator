from fastapi import APIRouter
from backend.graph.builder import build_demo_graph

router = APIRouter()

@router.get("/knowledge-graph")
def knowledge_graph():
    return build_demo_graph()
