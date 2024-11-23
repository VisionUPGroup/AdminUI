import axios from "axios";
import { getToken } from "./tokenHelper";

export const useAccountService = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch accounts by RoleID
  const fetchAccountByRole = async (roleID, username = "", pageIndex = 1) => {
    try {
      const token = getToken();
      const response = await axios.get(`${baseUrl}/api/accounts`, {
        params: {
          RoleID: roleID,
          Username: username,
          PageIndex: pageIndex,
          PageSize: 10, // Số lượng items mỗi trang
          Descending: true
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        items: response.data.data,
        totalItems: response.data.totalCount, // Giả sử API trả về tổng số items
        currentPage: pageIndex,
      };
    } catch (error) {
      console.error("Error fetching accounts:", error);
      throw error;
    }
  };

  // Update account by ID
  const updateAccount = async (updatedData) => {
    try {
      const token = getToken();
      const response = await axios.put(
        `${baseUrl}/api/accounts/`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Account updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating account:", error);
      throw error;
    }
  };

  // Delete account by ID
  const deleteAccount = async (id) => {
    try {
      const token = getToken();
      const response = await axios.delete(`${baseUrl}/api/accounts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Account deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };
  const fetchAccountById = async (accountId) => {
    try {
      const token = getToken();
      const response = await axios.get(`${baseUrl}/api/accounts/${accountId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching account:", error);
      throw error;
    }
  };

  return {
    fetchAccountByRole,
    fetchAccountById,
    updateAccount,
    deleteAccount,
  };
};
