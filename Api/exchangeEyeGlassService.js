import axios from "axios";
import { getToken } from "./tokenHelper";

export const useExchangeEyeGlassService = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch all exchange eye glasses with filters
  const fetchAllExchangeEyeGlass = async (StaffID, AccountID, ProductGlassID, OrderID, ReportID, Status, pageIndex) => {
    try {
      const token = getToken();
      const params = {
        PageIndex: pageIndex,
        PageSize: 20,
        Descending: true
      };

      // Only add optional params if they have values
      if (StaffID) params.StaffID = StaffID;
      if (AccountID) params.AccountID = AccountID;
      if (ProductGlassID) params.ProductGlassID = ProductGlassID;
      if (OrderID) params.OrderID = OrderID;
      if (ReportID) params.ReportID = ReportID;
      if (Status !== undefined) params.Status = Status;

      const response = await axios.get(`${baseUrl}/api/exchange-eyeglass`, {
        params,
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
      console.error("Error fetching exchange eye glasses:", error);
      throw error;
    }
  };

  // Create new exchange eye glass
  const createExchangeEyeGlass = async (exchangeEyeGlassData) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${baseUrl}/api/exchange-eyeglass`,
        exchangeEyeGlassData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Exchange eye glass created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating exchange eye glass:", error);
      throw error;
    }
  };

  // Fetch exchange eye glass by ID
  const fetchExchangeEyeGlassById = async (id) => {
    try {
      const token = getToken();
      const response = await axios.get(`${baseUrl}/api/exchange-eyeglass/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching exchange eye glass:", error);
      throw error;
    }
  };

  // Delete exchange eye glass
  const deleteExchangeEyeGlass = async (id) => {
    try {
      const token = getToken();
      const response = await axios.delete(
        `${baseUrl}/api/exchange-eyeglass/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Exchange eye glass deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting exchange eye glass:", error);
      throw error;
    }
  };

  // Check product glass availability
  const checkProductGlass = async (productGlassID) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${baseUrl}/api/staff/orders/check-product`,
        {
          params: { productGlassID },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking product glass:", error);
      throw error;
    }
  };

  return {
    fetchAllExchangeEyeGlass,
    createExchangeEyeGlass,
    fetchExchangeEyeGlassById,
    deleteExchangeEyeGlass,
    checkProductGlass,
  };
};