// Example integration from the existing frontend.
// Copy/adapt this pattern inside your app.js or dashboard layer.
async function runBackendSimulation(transfer) {
  const response = await fetch("http://127.0.0.1:8000/api/simulate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({transfer, rounds: 1000})
  });
  if (!response.ok) throw new Error("Backend simulation failed");
  return response.json();
}
