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
      console.log("Creating parent with data:", data);
      
      // Transform the data to match the API payload structure
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || data.fullName;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const parentData = {
        firstName: firstName,
        lastName: lastName,
        gender: "other", // Default gender since it's required
        birthDate: new Date().toISOString(), // Default to current date since it's required
        fullName: data.fullName,
        email: data.email || '',
        role: "parent",
        address: data.address || '',
        phoneNumber: data.phoneNumber
      };
      
      console.log("Transformed parent data:", parentData);
      const response = await axiosInstance.post("/patients/create-parent", parentData);
      toast.success('Parent created successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating parent:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  }
