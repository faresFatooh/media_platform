import axios from "axios";

const API_BASE = import.meta.env.VITE_MAIN_BACKEND_URL + "/api/discovery-script";

export async function getApiConfigs() {
  const res = await axios.get(`${API_BASE}/configs/`, { withCredentials: true });
  return res.data;
}

export async function saveApiConfigs(data: any) {
  const res = await axios.post(`${API_BASE}/configs/`, data, { withCredentials: true });
  return res.data;
}
