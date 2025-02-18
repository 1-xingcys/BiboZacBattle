import { apiCall } from "../api";

export const get_veri_code = async (name, e_id) => {
  try {
    const response = await apiCall(`/sign_up`, "POST", { name, e_id });
    console.log("API response:", response); 
    return response;
  } catch (error) {
    console.error("Sign up failed:", error.message);
    alert("Sign up failed:", error.message);
  }
};

export const authentication = async (e_id, veri_code) => {
  try {
    const response = await apiCall(`/player/login`, "POST", { e_id, veri_code });
    console.log("API response:", response); 
    return response;
  } catch (error) {
    console.error("Login failed:", error.message);
    alert("Login failed:", error.message);
  }
};

export const offline = async (e_id, name) => {
  try {
    const response = await apiCall(`/player/logout`, "POST", { e_id, name });
    console.log("API response:", response); 
    return response;
  } catch (error) {
    console.error("Logout (offline) failed:", error.message);
    alert("Logout (offline) failed:", error.message);
  }
};