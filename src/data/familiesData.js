import axiosInstance from "@/api/axiosInstance";

// Families API endpoints
export const getFamilies = async () => {
    try {
        const response = await axiosInstance.get("/families");
        return response.data;
    } catch (error) {
        console.error('Error fetching families:', error);
        throw error;
    }
};

export const getFamily = async (id) => {
    try {
        const response = await axiosInstance.get(`/families/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching family:', error);
        throw error;
    }
};

export const createFamily = async (familyData) => {
    console.log('Creating family with data:', familyData);
    try {
        const response = await axiosInstance.post("/families", familyData);
        return response.data;
    } catch (error) {
        console.error('Error creating family:', error);
        throw error.response?.data?.message
            ? new Error(error.response.data.message)
            : error;
    }
};

export const updateFamily = async (id, familyData) => {
    try {
        const response = await axiosInstance.patch(`/families/${id}`, familyData);
        return response.data;
    } catch (error) {
        console.error('Error updating family:', error);
        throw error.response?.data?.message
            ? new Error(error.response.data.message)
            : error;
    }
};

export const deleteFamily = async (id) => {
    try {
        await axiosInstance.delete(`/families/${id}`);
        return true;
    } catch (error) {
        console.error('Error deleting family:', error);
        throw error.response?.data?.message
            ? new Error(error.response.data.message)
            : error;
    }
};

export const getFamiliesByParent = async (parentId) => {
    try {
        const response = await axiosInstance.get(`/families/by-parent/${parentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching families by parent:', error);
        throw error;
    }
};

export const getFamiliesByChild = async (childId) => {
    try {
        const response = await axiosInstance.get(`/families/by-child/${childId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching families by child:', error);
        throw error;
    }
};
