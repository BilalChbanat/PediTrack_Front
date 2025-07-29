// FILE 2: utils/prescriptionUtils.js
export const getPrescriptionStatus = (prescription) => {
  if (!prescription.endDate) return "active";
  
  const now = new Date();
  const endDate = new Date(prescription.endDate);
  const daysUntilEnd = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilEnd < 0) return "expired";
  if (daysUntilEnd <= 7) return "ending_soon";
  return "active";
};

export const getDaysRemaining = (endDate) => {
  if (!endDate) return "∞";
  
  const now = new Date();
  const end = new Date(endDate);
  const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  
  return days > 0 ? days : 0;
};

export const setDurationDays = (days, startDate, updateField) => {
  if (!startDate) return;
  
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + days);
  
  updateField('endDate', end.toISOString().split('T')[0]);
};

export const formatDate = (dateString) => {
  if (!dateString) return "Not specified";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};