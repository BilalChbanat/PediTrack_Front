import axiosInstance from "@/api/axiosInstance";
import { toast } from 'react-toastify';

export const createPatient = async (data) => { 
  try {
    const response = await axiosInstance.post("/patients", data);
        toast.success('Patient created successfully!', {
            position: "top-right",
            autoClose: 3000,
          });
    
    return response.data;
  } catch (error) {
    console.error("Error creating patient:", error);
    throw error;
  }
}



  export const createParent = async (data) => {
    try {
      const response = await axiosInstance.post("/patients/create-parent", data);
      toast.success('Parent created successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating parent:", error);
      throw error;
    }
  }
