import axiosInstance from "@/api/axiosInstance";

export const getConsultations = async () => { 
  try {
    const response = await axiosInstance.get("/consultations"); 
    console.log("response", response.data);   
    return response.data;
  } catch (error) {
    console.error("Error fetching consultations:", error);
    throw error;
  }
}

export const getConsultationsByPatient = async (patientId) => { 
  try {
    const response = await axiosInstance.get(`/consultations/by-patient/${patientId}`); 
    console.log("response", response.data);   
    // Return the consultations array from the response object
    return response.data?.consultations || response.data;
  } catch (error) {
    console.error("Error fetching consultations by patient:", error);
    throw error;
  }
}

export const createConsultation = async (data) => {
  try {
    console.log("Sending consultation data to backend:", data);
    

    
    const response = await axiosInstance.post("/consultations", data);
    console.log("Backend response:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error creating consultation:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    throw error;
  }
}

export const updateConsultation = async (id, data) => {
  try {
    const response = await axiosInstance.patch(`/consultations/${id}`, data);
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating consultation:", error);
    throw error;
  }
}

export const deleteConsultation = async (id) => {
  try {
    const response = await axiosInstance.delete(`/consultations/${id}`);
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting consultation:", error);
    throw error;
  }
} 