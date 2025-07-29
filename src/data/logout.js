import axiosInstance from "@/api/axiosInstance";

export const logout = async () => {
    try {
        localStorage.removeItem("isAuth");
        localStorage.removeItem("token");
        await axiosInstance.post("/auth/logout");
        window.location.href = "/auth/";
        console.log("Logout successful");
    } catch (error) {
        console.error("Error during logout:", error);
    }
};
