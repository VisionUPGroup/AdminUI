import axios from "axios";
import { getToken } from "./tokenHelper";

export const useAccountService = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;


  const fetchAccounts = async (params) => {
    try {
      console.log("Fetching accounts with params:", params);
      const response = await axios.get(`${baseUrl}/api/accounts`, {
        params: params,
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      console.log("Accounts fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching accounts:", error);
      return null;
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

  // Create new account
  const createAccount = async (accountData) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${baseUrl}/api/accounts`,
        accountData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Account created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    }
  };

  return {
    fetchAccounts,
    fetchAccountById,
    updateAccount,
    deleteAccount,
    createAccount, // Add the new function to the returned object
  };
};
