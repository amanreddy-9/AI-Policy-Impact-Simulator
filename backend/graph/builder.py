"""Simple knowledge-graph builder with optional Neo4j support."""
import json
from pathlib import Path

def build_demo_graph():
    graph = {
        "nodes": [
            {"id": "PM-KISAN", "type": "policy"},
            {"id": "Marginal Farmer", "type": "demographic_group"},
            {"id": "Small Farmer", "type": "demographic_group"},
            {"id": "Income", "type": "outcome"},
            {"id": "Poverty", "type": "outcome"},
        ],
        "edges": [
            {"source": "PM-KISAN", "target": "Marginal Farmer", "relation": "targets"},
            {"source": "PM-KISAN", "target": "Small Farmer", "relation": "targets"},
            {"source": "PM-KISAN", "target": "Income", "relation": "affects"},
            {"source": "PM-KISAN", "target": "Poverty", "relation": "affects"},
        ],
    }
    out = Path(__file__).resolve().parents[2] / "data" / "processed" / "knowledge_graph.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(graph, indent=2), encoding="utf-8")
    return graph

def write_to_neo4j(graph, uri, username, password):
    from neo4j import GraphDatabase
    driver = GraphDatabase.driver(uri, auth=(username, password))
    with driver.session() as session:
        for node in graph["nodes"]:
            session.run("MERGE (n:Entity {id:$id}) SET n.type=$type", id=node["id"], type=node["type"])
        for edge in graph["edges"]:
            session.run(
                "MATCH (a:Entity {id:$s}), (b:Entity {id:$t}) "
                "MERGE (a)-[r:RELATES {type:$rel}]->(b)",
                s=edge["source"], t=edge["target"], rel=edge["relation"]
            )
    driver.close()
