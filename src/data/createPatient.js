import axiosInstance from "@/api/axiosInstance";
import { toast } from 'react-toastify';

// Utility function to sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};

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
      
      // Format phone number to ensure it starts with +
      let phoneNumber = data.phoneNumber;
      if (phoneNumber && !phoneNumber.startsWith('+')) {
        phoneNumber = `+${phoneNumber.replace(/^\+/, '')}`;
      }
      
      // Send parent data as a patient with parent role
      const parentData = {
        firstName: sanitizeInput(data.fullName.split(' ')[0] || data.fullName),
        lastName: sanitizeInput(data.fullName.split(' ').slice(1).join(' ') || data.fullName),
        gender: data.gender || 'other', // Default to 'other' if not provided
        birthDate: data.birthDate || new Date('1980-01-01T00:00:00.000Z').toISOString(), // Default birth date
        fullName: sanitizeInput(data.fullName),
        email: sanitizeInput(data.email || '').toLowerCase(),
        phoneNumber: sanitizeInput(phoneNumber),
        address: sanitizeInput(data.address || ''),
        role: 'parent'
      };
      
      console.log("Transformed parent data:", parentData);
      console.log("Data types:", {
        firstName: typeof parentData.firstName,
        lastName: typeof parentData.lastName,
        gender: typeof parentData.gender,
        birthDate: typeof parentData.birthDate,
        fullName: typeof parentData.fullName,
        email: typeof parentData.email,
        phoneNumber: typeof parentData.phoneNumber,
        address: typeof parentData.address,
        role: typeof parentData.role
      });
      
      // Use the regular patients endpoint with parent role
      const response = await axiosInstance.post("/patients", parentData);
      toast.success('Parent created successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating parent:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);
      
      // Show specific validation errors if available
      if (error.response?.data?.message && Array.isArray(error.response.data.message)) {
        const errorMessages = error.response.data.message.join(', ');
        toast.error(`Validation errors: ${errorMessages}`, {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.error(`Error creating parent: ${error.response?.data?.error || error.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
      
      throw error;
    }
  }
