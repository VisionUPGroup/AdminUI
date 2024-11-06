import axios from "axios";
import { getToken } from "./tokenHelper";

export const useOrderService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Fetch all orders
    const fetchAllOrder = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${baseUrl}/api/admin/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Orders Data:", response.data.data); // Log data received from API
            return response.data.data;
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw error;
        }
    };

    // Delete order by ID
    const deleteOrder = async (orderId) => {
        try {
            const token = getToken();
            const response = await axios.delete(`${baseUrl}/api/admin/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Order deleted successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error deleting order:", error);
            throw error;
        }
    };

    // Update order process
    const updateOrderProcess = async (orderId, newProcessValue) => {
        try {
            const token = getToken();
            const response = await axios.put(
                `${baseUrl}/api/orders/update-process`,
                {
                    id: orderId,
                    process: newProcessValue,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Order process updated successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error updating order process:", error);
            throw error;
        }
    };

    return {
        fetchAllOrder,
        deleteOrder,
        updateOrderProcess,
    };
};
