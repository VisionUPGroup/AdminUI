import axios from "axios";
import { getToken } from "./tokenHelper";
import Kiosk from "@/Components/Kiosk/KioskList";

export const useOrderService = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch all orders with optional query parameters
  // Trong orderService.js
  const fetchAllOrder = async (
    fromDate = "",
    toDate = "",
    username = "",
    process = "",
    pageIndex = 1,
    accountId = "",
    kioskId = "",
    placedByKioskId = "",
    shipperId,
    isDeposit = "",
    issueType = "",
    orderId = "",

  ) => {
    try {
      const token = getToken();
      const response = await axios.get(`${baseUrl}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          Username: username,
          KioskID: kioskId,
          AccountID: accountId,
          Process: process,
          PageIndex: pageIndex,
          PageSize: 20,
          Descending: true,
          FromDate: fromDate,
          ToDate: toDate,
          PlacedByKioskID: placedByKioskId,
          isDeposit: isDeposit,
          issueType: issueType,
          ShipperID: shipperId,
          ID: orderId
        
        },
      });
      return {
        items: response.data.data,
        totalItems: response.data.totalCount,
        revenueCompleted: response.data.totalRevenue,
        currentPage: pageIndex,
      };
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  };
  const fetchStaffOrder = async (  fromDate = "",
    toDate = "",
    username = "",
    process = "",
    pageIndex = 1,
    accountId = "",
    kioskId = "",
    placedByKioskId = "",
    shipperId,
    isDeposit = "",
    issueType = "",
    orderId = "",) => {
    try {
      const token = getToken();
      const response = await axios.get(`${baseUrl}/api/accounts/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          Username: username,
          KioskID: kioskId,
          AccountID: accountId,
          Process: process,
          PageIndex: pageIndex,
          PageSize: 20,
          Descending: true,
          FromDate: fromDate,
          ToDate: toDate,
          PlacedByKioskID: placedByKioskId,
          isDeposit: isDeposit,
          issueType: issueType,
          ShipperID: shipperId,
          ID: orderId
        },
      });
      return {
        items: response.data.data,
        totalItems: response.data.totalCount,
        revenueCompleted: response.data.totalRevenue,
        currentPage: pageIndex,
      };
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  };

  const countOrder = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${baseUrl}/api/orders/count?valueCount=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
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
          "Content-Type": "application/json",
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
            "Content-Type": "application/json",
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

      const response = await axios.get(`${baseUrl}/api/orders/statistic`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  };
  const fetchStatisticOrderDateToDate = async (startDate, endDate) => {
    try {
      const token = getToken();
      const params = { startDate: startDate, endDate: endDate };

      const response = await axios.get(
        `${baseUrl}/api/orders/statistic-date-to-date`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  };

  const createOrderNow = async (orderData, id) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${baseUrl}/api/staff/orders/now`, 
        orderData,
        {
          // params: {
          //   accountId: orderData.accountID
          // },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'accept': '*/*'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };
  
  const fetchOrderById = async (orderId) => {
    try {
      const token = getToken(); // Retrieve the token
      const response = await axios.get(`${baseUrl}/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data; // Return the order data
    } catch (error) {
      console.error("Error fetching order by ID:", error);
      throw error;
    }
  };

  const confirmDelivery = async (orderId, imageFile) => {
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('Id', orderId);
      formData.append('Image', imageFile);
  
      const response = await axios.post(
        `${baseUrl}/api/orders/delivery-confirm`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'accept': '*/*'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error confirming delivery:', error);
      throw error;
    }
  };
  

  return {
    fetchAllOrder,
    fetchStaffOrder,
    fetchStatisticOrder,
    fetchStatisticOrderDateToDate,
    deleteOrder,
    updateOrderProcess,
    countOrder,
    createOrderNow,
    fetchOrderById,
    confirmDelivery
  };
};
