import axios from "axios";
import { getToken } from "./tokenHelper"; 

export const useKioskService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Lấy danh sách tất cả các ki-ốt
    const fetchAllKiosk = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/kiosks`);
            console.log("Kiosk Data:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching kiosks:", error);
            throw error;
        }
    };

    // Lấy thông tin ki-ốt theo ID
    const fetchKioskById = async (id) => {
        try {
            const response = await axios.get(`${baseUrl}/api/kiosks/${id}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching kiosk:", error);
            throw error;
        }
    };

    // Tạo mới một ki-ốt
    const createKiosk = async (kioskData) => {
        try {
            const response = await axios.post(`${baseUrl}/api/kiosks`, kioskData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            if (error.response?.data && Array.isArray(error.response.data)) {
                error.message = error.response.data[0];
            }
            throw error;
        }
    };

    // Di chuyển orders giữa các kiosk
    const moveOrderKiosk = async (kioskData) => {
        try {
            const response = await axios.post(`${baseUrl}/api/kiosks/move-orders`, kioskData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            // Đảm bảo ném lỗi để component có thể xử lý
            console.error("Error moving orders:", error);
            throw error; 
        }
    };

    // Cập nhật ki-ốt
    const updateKiosk = async (kioskData) => {
        try {
            const response = await axios.put(`${baseUrl}/api/kiosks`, kioskData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating kiosk:", error);
            throw error;
        }
    };

    // Xóa ki-ốt theo ID
    const deleteKiosk = async (id) => {
        try {
            const response = await axios.delete(`${baseUrl}/api/kiosks/${id}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting kiosk:", error);
            throw error;
        }
    };

    return {
        fetchAllKiosk,
        fetchKioskById,
        createKiosk,
        updateKiosk,
        deleteKiosk,
        moveOrderKiosk
    };
};