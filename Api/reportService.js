import axios from "axios";
import { getToken } from "./tokenHelper";

export const useReportService = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchReportByOrderId = async (orderId, status, type, pageIndex) => {
    try {
      const token = getToken();
      const response = await axios.get(`${baseUrl}/api/reports`, {
        params: {
          OrderID: orderId,
          Status: status,
          Type: type,
          PageIndex: pageIndex,
          PageSize: 10,
          Descending: true,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return {
        items: response.data.data || [],
        totalItems: response.data.totalCount || 0,
        currentPage: pageIndex,
      };
    } catch (error) {
      console.error("Error fetching records:", error);
      throw error;
    }
  };

  const createRePort = async (reportData) => {
    try {
      const token = getToken();
      const response = await axios.post(`${baseUrl}/api/reports`, reportData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response;
    } catch (error) {
      console.error("Error creating record:", error);
      throw error;
    }
  };

  const updateReportStatus = async (reportData) => {
    try {
      const token = getToken();
      const response = await axios.put(`${baseUrl}/api/reports`, reportData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error updating records:", error);
      throw error;
    }
  };

  return {
    fetchReportByOrderId,
    createRePort,
    updateReportStatus,
  };
};
