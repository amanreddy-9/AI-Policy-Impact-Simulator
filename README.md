# AI Policy Impact Simulator — India

This package combines the teammate's frontend prototype with a Python/FastAPI
backend implementing the project architecture from the proposal:

Data → Knowledge Graph → Causal Effects → Monte Carlo Simulation → PPO → Dashboard/API.

## Important data note

The included coefficients and demo population are SYNTHETIC/ILLUSTRATIVE so the
project can run immediately. They are not validated estimates of Indian policy
effects. Before presenting empirical findings, replace them with documented
Indian data and run causal identification/validation.

## Windows quick start

1. Install Python 3.11+.
2. Open PowerShell in this project folder.
3. Create an environment:

   `py -m venv .venv`

4. Activate it:

   `.\.venv\Scripts\Activate.ps1`

5. Install dependencies:

   `pip install -r requirements.txt`

6. Start the backend:

   `python -m uvicorn backend.main:app --reload`

7. Open:
   `http://127.0.0.1:8000/docs`

## API

- GET `/health`
- POST `/api/simulate`
- GET `/api/effects`
- GET `/api/knowledge-graph`
- POST `/api/train`
- GET `/api/recommend`

## Frontend

Open the existing `index.html` from the teammate's prototype. The next integration
step is to replace its local JS calculations with fetch() calls to the FastAPI
endpoints above.

## Recommended academic implementation path

1. Choose one policy domain (PM-KISAN is used for the demo).
2. Acquire documented Indian historical datasets.
3. Build treatment/control panels.
4. Estimate DiD and/or CATE with DoWhy/EconML.
5. Store validated subgroup effects.
6. Feed those effects into Monte Carlo simulation.
7. Train PPO against the simulation environment.
8. Backtest against a historical policy episode.
9. Connect the dashboard to the API.
10. Report uncertainty and limitations.

## Optional Neo4j

Start Neo4j locally, configure `.env`, and use `backend.graph.builder.write_to_neo4j`
to persist the graph. The included JSON graph is a minimal demonstration graph.
