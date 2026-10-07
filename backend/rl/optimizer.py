"""Stable-Baselines3 PPO optimizer with a safe fallback."""
from pathlib import Path

def train_ppo(steps: int = 5000):
    try:
        from stable_baselines3 import PPO
    except ImportError as exc:
        raise ImportError("Install stable-baselines3 to train PPO") from exc

    from backend.rl.environment import PolicyEnv
    env = PolicyEnv()
    model = PPO("MlpPolicy", env, verbose=0, seed=42)
    model.learn(total_timesteps=steps)
    out = Path(__file__).resolve().parents[2] / "models" / "ppo_policy"
    out.parent.mkdir(parents=True, exist_ok=True)
    model.save(str(out))
    return str(out)

def recommend():
    try:
        from stable_baselines3 import PPO
    except ImportError as exc:
        raise ImportError("Install stable-baselines3 to use PPO") from exc
    from backend.rl.environment import PolicyEnv
    path = Path(__file__).resolve().parents[2] / "models" / "ppo_policy"
    if not Path(str(path) + ".zip").exists():
        return {"status": "not_trained", "message": "Run training first."}
    model = PPO.load(str(path))
    obs, _ = PolicyEnv().reset()
    action, _ = model.predict(obs, deterministic=True)
    return {"recommended_transfer": float(action[0])}
