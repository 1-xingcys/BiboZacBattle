import { apiCall } from "../api";

export const creat_battle_event = async (event_name, red_side, blue_side) => {
  try {
    const response = await apiCall(`/create_battle_event`, "POST", { event_name, red_side, blue_side });
    console.log("Create event successful");
    return response;
  } catch (error) {
    console.error("Create event failed:", error.message);
    alert("Create event failed:", error.message);
  }
};

export const get_event = async (event_id) => {
  try {
    const response = await apiCall(`/event/${event_id}`);
    console.log("event info: ", response);
    return response;
  } catch (error) {
    console.error("Get event failed: ", error.message);
    alert("Get event failed: ", error.message);
  }
}

export const creat_7_to_smoke = async (participants) => {
  try {
    const response = await apiCall(`/create_7_to_smoke`, "POST", { participants });
    console.log("Create 7 to smoke successful");
    return response;
  } catch (error) {
    console.error("Create 7 to smoke failed:", error.message);
    alert("Create 7 to smoke failed:", error.message);
  }
};

// for admin home page
export const get_event_info = async (a_id) => {
  try {
    const response = await apiCall(`/get_event_info`, "POST", { a_id });
    console.log("event info: ", response);
    return response;
  } catch (error) {
    console.error("Get event failed: ", error.message);
    alert("Get event failed: ", error.message);
  }
}

export const create_new_event = async (name, a_id) => {
  try {
    const response = await apiCall(`/create_new_event`, "POST", { name, a_id });
    console.log(`Create new event ${name} successfully!`);
    return response;
  } catch (error) {
    console.error(`Create new event ${name} failed!`);
    alert(`Create new event ${name} failed!`);
  }
}

export const delete_event = async (eventId) => {
  try {
    const response = await apiCall(`/delete_event`, "DELETE", { eventId });
    console.log(`Delete event ${eventId} successfully!`);
    return response;
  } catch (error) {
    console.error(`Delete event ${eventId} failed!`);
    alert(`Delete event ${eventId} failed!`);
  }
}