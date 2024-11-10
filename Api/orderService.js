import axios from "axios";
import { getToken } from "./tokenHelper";

export const useOrderService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Fetch all orders with optional query parameters
    const fetchAllOrder = async (username = '', process, pageIndex) => {
        try {
            const token = getToken();
            const response = await axios.get(`${baseUrl}/api/admin/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    Username: username,
                    Process: process,
                    PageIndex: pageIndex,
                    PageSize: 20, // Set to 20 as requested
                },
            });
            return {
                items: response.data.data,
                totalItems: response.data.totalCount,
                revenueCompleted: response.data.totalRevenue,
                currentPage: pageIndex
            };
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw error;
        }
    };

    const countOrder = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${baseUrl}/api/orders/count?valueCount=true`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error counting orders:", error);
            throw error;
        }
    };

    // Delete order by ID
    const deleteOrder = async (orderId) => {
        try {
            const token = getToken();
            const response = await axios.delete(`${baseUrl}/api/orders/${orderId}`, {
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

    // Fetch order statistics with dynamic startDate and endDate
// Trong orderService.js
const fetchStatisticOrder = async (date, endDate) => {
    try {
        const token = getToken();
        const params = endDate 
          ? { startDate: date, endDate: endDate }
          : { dateOnly: date };
          
        const response = await axios.get(
            `${baseUrl}/api/orders/statistic`,
            {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching statistics:", error);
        throw error;
    }
};
const fetchStatisticOrderDateToDate = async (startDate, endDate) => {
    try {
        const token = getToken();
        const params =  { startDate: startDate, endDate: endDate }
       
          
        const response = await axios.get(
            `${baseUrl}/api/orders/statistic-date-to-date`,
            {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching statistics:", error);
        throw error;
    }
};

    
    return {
        fetchAllOrder,
        fetchStatisticOrder,
        fetchStatisticOrderDateToDate,
        deleteOrder,
        updateOrderProcess,
        countOrder
    };
};
