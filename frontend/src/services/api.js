const API_BASE = "http://127.0.0.1:8000";

export const getZones = async () => {
  const res = await fetch(`${API_BASE}/zones`);
  return res.json();
};