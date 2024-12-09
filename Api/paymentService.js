// paymentService.js
import axios from "axios";
import { getToken } from "./tokenHelper";

export const usePaymentService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const createPaymentUrl = async (paymentData) => {
        try {
            const token = getToken();
            console.log('Creating payment URL for order:', paymentData.orderID);
            
            const response = await axios.post(
                `${baseUrl}/api/payments/create-payment-url`,
                { 
                    orderID: paymentData.orderID
                },
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

    // const createPaymentUrl = async (paymentData) => {
    //     try {
    //         const token = getToken();
    //         console.log('Creating payment URL for order:', orderId);
            
    //         // Tạo returnUrl động dựa trên current host
    //         const returnUrl = `${window.location.origin}/en/page/order-success`;
    //         console.log('Payment data:', paymentData);
            
    //         const response = await axios.post(
    //             `${baseUrl}/api/payments/create-payment-url`,
    //             { 
    //                 orderID: paymentData.orderID,
    //                 returnUrl: returnUrl
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