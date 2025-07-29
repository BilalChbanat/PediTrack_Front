// =============================================================================
// src/utils/patientHelpers.js
import { STATUS_COLORS, VACCINE_SCHEDULES } from '../constant/patien  tConstants';

export const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.default;

export const formatDate = (dateString) => {
  if (!dateString) return "Not administered";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const calculateNextDueDate = (vaccination) => {
  if (!vaccination.dateAdministered) return null;
  
  const administeredDate = new Date(vaccination.dateAdministered);
  const nextDueDate = new Date(administeredDate);
  const schedule = VACCINE_SCHEDULES[vaccination.vaccine.toLowerCase()] || VACCINE_SCHEDULES.default;
  
  if (schedule.unit === "years") {
    nextDueDate.setFullYear(nextDueDate.getFullYear() + schedule.interval);
  } else {
    nextDueDate.setMonth(nextDueDate.getMonth() + schedule.interval);
  }
  
  return nextDueDate.toISOString().split('T')[0];
};

export const calculateBMI = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) return 0;
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

export const getBMICategory = (bmi, age) => {
  if (age < 2) return "N/A";
  if (bmi < 18.5) return "Underweight";
  if (bmi >= 18.5 && bmi < 25) return "Normal";
  if (bmi >= 25 && bmi < 30) return "Overweight";
  return "Obese";
};

export const getBMICategoryColor = (category) => {
  switch (category) {
    case "Normal": return "#4caf50";
    case "Underweight": return "#ff9800";
    case "Overweight": return "#f44336";
    case "Obese": return "#d32f2f";
    default: return "#9e9e9e";
  }
};

export const processPatientData = (patient) => {
  return {
    name: `${patient.firstName} ${patient.lastName}`,
    avatar: patient.img || "/img/default-avatar.jpg",
    age: patient.age || "Not specified",
    gender: patient.gender || "Not specified",
    bloodType: patient.bloodType || "Not specified",
    phoneNumber: patient.parent?.phoneNumber || "Not specified",
    email: patient.parent?.email || "Not specified",
    address: patient.parent?.address || "Not specified",
    emergencyContact: patient.parent?.fullName || "Not specified",
    allergies: patient.allergies || "None specified",
    chronicConditions: patient.chronicConditions || "None specified",
  };
};

export const processAppointments = (appointments = []) => {
  return appointments.map(appointment => ({
    _id: appointment._id,
    name: appointment.doctor || "Medical Staff",
    message: `Appointment for ${appointment.type || "check-up"}`,
    time: appointment.date ? formatDate(appointment.date) : "No date specified",
    hour: appointment.time ? appointment.time : "No time specified",
    date: appointment.date,
    doctor: appointment.doctor,
    type: appointment.type,
    notes: appointment.notes,
    reason: appointment.reason || appointment.notes
  }));
};

export const filterAndSortVaccinations = (vaccinations, filters) => {
  let result = [...vaccinations];

  if (filters.status !== "all") {
    result = result.filter(v => v.status === filters.status);
  }

  result.sort((a, b) => {
    let comparison = 0;
    switch (filters.sortField) {
      case "vaccine":
        comparison = a.vaccine.localeCompare(b.vaccine);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "dueDate":
      default:
        comparison = new Date(a.dueDate) - new Date(b.dueDate);
        break;
    }
    return filters.sortDirection === "asc" ? comparison : -comparison;
  });

  return result;
};