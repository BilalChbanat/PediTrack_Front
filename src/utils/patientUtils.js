export const formatDate = (dateString) => {
  if (!dateString) return "Not administered";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const calculateBMI = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) return 0;
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

export const getStatusColor = (status) => {
  const STATUS_COLORS = {
    done: "green",
    pending: "orange",
    overdue: "red",
    default: "blue-gray"
  };
  return STATUS_COLORS[status] || STATUS_COLORS.default;
};