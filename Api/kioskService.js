import axios from "axios";
import { getToken } from "./tokenHelper"; 

export const useKioskService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Lấy danh sách tất cả các ki-ốt
    const fetchAllKiosk = async () => {
        return axios.get(`${baseUrl}/api/kiosks`)
            .then(response => {
                console.log("Kiosk Data:", response.data); // In ra dữ liệu nhận được từ API
                return response.data || null;
            })
            .catch(error => {
                console.error("Error fetching kiosks:", error); // In ra lỗi nếu có
                return null;
            });
    };
    
    

    // Lấy thông tin ki-ốt theo ID
    const fetchKioskById = async (id) => {
        return axios.get(`${baseUrl}/api/kiosks/${id}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        })
        .then(response => response.data || null)
        .catch(error => null);
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
    const moveOrderKiosk = async (kioskData) => {
        return axios.post(`${baseUrl}/api/kiosks/move-orders`, kioskData, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        })
        .then(response => response.data || null)
        .catch(error => null);
    };

    // Cập nhật ki-ốt
    const updateKiosk = async (kioskData) => {
        return axios.put(`${baseUrl}/api/kiosks`, kioskData, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        })
        .then(response => response.data || null)
        .catch(error => null);
    };

    // Xóa ki-ốt theo ID
    const deleteKiosk = async (id) => {
        return axios.delete(`${baseUrl}/api/kiosks/${id}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        })
        .then(response => response.data || null)
        .catch(error => null);
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
