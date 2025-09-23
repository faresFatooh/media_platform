import axios from "axios";

const API_BASE = import.meta.env.VITE_MAIN_BACKEND_URL + "/api/discovery-script";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getApiConfigs() {
  const res = await axios.get(`${API_BASE}/configs/`, {
    headers: { ...getAuthHeaders() },
  });
  return res.data;
}

export async function saveApiConfigs(data: any) {
  const res = await axios.post(`${API_BASE}/configs/`, data, {
    headers: { ...getAuthHeaders() },
  });
  return res.data;
}
