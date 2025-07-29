import axiosInstance from "@/api/axiosInstance";

export const getVaccinationRecords = async (patientId) => {
    try {
        const response = await axiosInstance.get("/vaccinations", {
            params: patientId ? { patientId } : {},
        });
        let data = response && response.data ? response.data : [];
        if (!Array.isArray(data)) {
            data = [data];
        }
        return data;
    } catch (error) {
        console.error("Error fetching vaccination records:", error);
        throw error;
    }
};