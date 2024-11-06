import axios from "axios";
import { getToken } from "./tokenHelper";

export const useVoucherService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const fetchVoucherById = async (VoucherId) => {
        try {
            const token = getToken();
            const response = await axios.get(`${baseUrl}/api/vouchers/${VoucherId}`, {

                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching vouchers:", error);
            throw error;
        }
    };

   
    

    return {
        fetchVoucherById,
        
    };
};
