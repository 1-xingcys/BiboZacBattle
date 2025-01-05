import { apiCall } from "../api";

export const get_veri_code = async (name) => {
  try {
    const response = await apiCall(`/sign_up`, "POST", { name });
    console.log("API response:", response); 
    return response;
  } catch (error) {
    console.error("Sign up failed:", error.message);
    throw error;
  }
};