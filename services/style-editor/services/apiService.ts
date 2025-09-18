import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const saveStyleExample = async (before: string, after: string) => {
  try {
    const response = await api.post("/style-examples/", {
      before_text: before,
      after_text: after,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error saving style example:", error);
    throw error;
  }
};
