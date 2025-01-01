import { apiCall } from "../api";

export const creat_battle_event = async (event_name, red_side, blue_side) => {
  try {
    const response = await apiCall(`/create_battle_event`, "POST", { event_name, red_side, blue_side });
    console.log("Create event successful");
    return response;
  } catch (error) {
    console.error("Create event failed:", error.message);
    throw error;
  }
};

export const get_event = async (event_id) => {
  try {
    const response = await apiCall(`/event/${event_id}`);
    console.log("event info: ", response);
    return response;
  } catch (error) {
    console.error("Get event failed: ", error.message);
    throw error;
  }
}