// FILE 1: constants/prescriptionConstants.js
export const PRESCRIPTION_STATUS = {
  active: { color: "green", label: "Active" },
  expired: { color: "gray", label: "Expired" },
  ending_soon: { color: "orange", label: "Ending Soon" }
};

export const COMMON_MEDICATIONS = [
  "Amoxicillin", "Paracetamol", "Doliprane", "Ibuprofen", 
  "Ventolin", "Aspirin", "Vitamin D"
];

export const FREQUENCY_OPTIONS = [
  "1x per day", "2x per day", "3x per day", 
  "Every 4 hours", "Every 6 hours", "As needed"
];