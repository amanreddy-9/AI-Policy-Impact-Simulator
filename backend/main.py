from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.api import simulation, causal, rl, graph, llm_policy, evidence_pipeline

root_dir = Path(__file__).resolve().parents[1]

app = FastAPI(
    title="AI Policy Impact Simulator India",
    version="1.0.0",
    description="Production-grade AI Public Policy Impact Simulator & Optimization Platform with Controlled Evidence Retrieval."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation.router, prefix="/api")
app.include_router(causal.router, prefix="/api")
app.include_router(rl.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(llm_policy.router, prefix="/api/policy")
app.include_router(evidence_pipeline.router, prefix="/api")

if (root_dir / "css").exists():
    app.mount("/css", StaticFiles(directory=root_dir / "css"), name="css")
if (root_dir / "js").exists():
    app.mount("/js", StaticFiles(directory=root_dir / "js"), name="js")
if (root_dir / "data").exists():
    app.mount("/data", StaticFiles(directory=root_dir / "data"), name="data")

@app.get("/app")
def serve_app():
    return FileResponse(root_dir / "index.html")

@app.get("/")
def root():
    return FileResponse(root_dir / "index.html")


@app.get("/health")
def health():
    return {"status": "ok"}

