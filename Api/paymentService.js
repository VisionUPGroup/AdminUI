// paymentService.js
import axios from "axios";
import { getToken } from "./tokenHelper";

export const usePaymentService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const createPaymentUrl = async (orderId) => {
        try {
            const token = getToken();
            console.log('Creating payment URL for order:', orderId);
            
            const response = await axios.post(
                `${baseUrl}/api/payments/create-payment-url`,
                { orderID: orderId }, // Đảm bảo gửi đúng format
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': '*/*'
                    }
                }
            );
            
            console.log('Payment URL response:', response.data);
            return response.data;
        } catch (error) {
            console.error("Error creating payment URL:", error.response || error);
            throw error;
        }
    };

    // const createPaymentUrl = async (orderId) => {
    //     try {
    //         const token = getToken();
    //         console.log('Creating payment URL for order:', orderId);
            
    //         // Tạo returnUrl động dựa trên current host
    //         const returnUrl = `${window.location.origin}/en/page/order-success`;
            
    //         const response = await axios.post(
    //             `${baseUrl}/api/payments/create-payment-url`,
    //             { 
    //                 orderID: orderId,
    //                 accountID: 1, // hoặc lấy từ context/props
    //                 amount: 3000000, // hoặc lấy từ props
    //                 returnUrl: returnUrl // Thêm returnUrl vào request
    //             },
    //             {
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`,
    //                     'Content-Type': 'application/json',
    //                     'Accept': '*/*'
    //                 }
    //             }
    //         );
            
    //         return response.data;
    //     } catch (error) {
    //         console.error("Error creating payment URL:", error.response || error);
    //         throw error;
    //     }
    // };

    const fetchPaymentByOrderId = async (orderId) => {
        try {
            const token = getToken();
            const response = await axios.get(
                `${baseUrl}/api/orders/payment/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Payment details response:', response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching payment:", error);
            throw error;
        }
    };

    return {
        createPaymentUrl,
        fetchPaymentByOrderId,
    };
};