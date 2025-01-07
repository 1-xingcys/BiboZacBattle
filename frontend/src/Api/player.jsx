import { apiCall } from "../api";

export const get_veri_code = async (name, e_id) => {
  try {
    const response = await apiCall(`/sign_up`, "POST", { name, e_id });
    console.log("API response:", response); 
    return response;
  } catch (error) {
    console.error("Sign up failed:", error.message);
    throw error;
  }
};