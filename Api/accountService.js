import axios from "axios";
import { getToken } from "./tokenHelper";

export const useAccountService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Fetch accounts by RoleID
    const fetchAccountByRole = async (roleID) => {
        try {
            const token = getToken();
            const response = await axios.get(`${baseUrl}/api/accounts`, {
                params: { RoleID: roleID },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data.data);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching accounts:", error);
            throw error;
        }
    };

    // Update account by ID
    const updateAccount = async (updatedData) => {
        try {
            const token = getToken();
            const response = await axios.put(`${baseUrl}/api/accounts/`, updatedData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
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

    return {
        fetchAccountByRole,
        updateAccount,
        deleteAccount,
    };
};
