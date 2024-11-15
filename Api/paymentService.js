import axios from "axios";
import { getToken } from "./tokenHelper";

export const usePaymentService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const fetchPaymentByOrderId = async (orderId) => {
        try {
            const token = getToken();
            const response = await axios.get(`${baseUrl}/api/orders/payment/${orderId}`, {

                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching payment:", error);
            throw error;
        }
    };

   
    

    return {
        fetchPaymentByOrderId,
        
    };
};
