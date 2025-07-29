import axiosInstance from "@/api/axiosInstance";

export const getPatientTable = async () => {
  try {
    const res = await axiosInstance.get("/patients");
    console.log("Patients:", res.data);
    
    const patients = Array.isArray(res.data) ? res.data : []; // fallback
    
    return patients.map((patient) => ({
      // Include the original patient ID for appointment booking
      patientId: patient._id || patient.id,
      _id: patient._id || patient.id,
      
      // Display fields
      img: "/img/team-2.jpeg",
      name: `${patient.firstName} ${patient.lastName}`,
      email: patient.email || "No email provided", // Use actual email instead of gender
      
      // Job field - you might want to replace this with actual data
      job: ["still Not specify"], // Keep as array for compatibility
      
      // Status fields
      hasRendezvous: patient.hasRendezvous || false,
      online: patient.online || false, // Add online status
      
      // Date field
      date: patient.birthDate ? patient.birthDate : "Not specified",
      
      // Include all original patient data for appointment booking
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthDate: patient.birthDate,
      gender: patient.gender,
      phoneNumber: patient.phoneNumber,
      
      // Include parent information if available
      parentName: patient.fullName || patient.parentName,
      parentEmail: patient.email,
      parentPhone: patient.phoneNumber,
      
      // Any other fields you might need
      ...patient // Spread operator to include any additional fields
    }));
    
  } catch (err) {
    console.error("Failed to fetch patients:", err);
    return [];
  }
};

export const getParents = async () => {
  try {
    const res = await axiosInstance.get("/patients/parents");
    console.log("Parents:", res.data);
    return res.data;
  }
  catch (err) {
    console.error("Failed to fetch parents:", err);
    return [];
  }
};
    

    
  