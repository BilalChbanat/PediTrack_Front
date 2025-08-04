

import axiosInstance from "@/api/axiosInstance";

export const getAppointments = async (data) => { 
  try {
    const response = await axiosInstance.get("/appointments"); 
    console.log("response", response.data);   
    return response.data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

export const createAppointment = async (data) => {
  try {
    const response = await axiosInstance.post("/appointments", data);
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}


export const updateAppointment = async (id, data) => {
  try {
    console.log("Sending update request:", { id, data });
    const response = await axiosInstance.put(`/appointments/${id}`, data);
    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating appointment:", error);
    // Log the request data for debugging
    console.log("Request data:", { id, data });
    
    // If there's a response with error details, log them
    if (error.response?.data) {
      console.error("Backend error details:", error.response.data);
      console.error("Backend error message:", error.response.data.message);
      console.error("Backend error status:", error.response.status);
    }
    
    // Create a more informative error
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
    const enhancedError = new Error(`Failed to update appointment: ${errorMessage}`);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    
    throw enhancedError;
  }
}
export const deleteAppointment = async (id) => {
  try {
    const response = await axiosInstance.delete(`/appointments/${id}`);
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
}
