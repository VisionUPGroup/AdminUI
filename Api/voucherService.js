import axios from "axios";
import { getToken } from "./tokenHelper";

export const useVoucherService = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch all vouchers
  const fetchVouchers = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/vouchers`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      return null;
    }
  };

  // Fetch voucher by ID
  const fetchVoucherById = async (id) => {
    try {
      const response = await axios.get(`${baseUrl}/api/vouchers/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching voucher with ID ${id}:`, error);
      return null;
    }
  };

  // Fetch voucher by code
  const fetchVoucherByCode = async (code) => {
    try {
      const response = await axios.get(`${baseUrl}/api/code/${code}/vouchers`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching voucher with code ${code}:`, error);
      return null;
    }
  };

  // Create a new voucher
  const createVoucher = async (voucherData) => {
    try {
      const response = await axios.post(`${baseUrl}/api/vouchers`, voucherData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating voucher:", error);
      return null;
    }
  };

  // Update an existing voucher
  const updateVoucher = async (voucherData) => {
    try {
      const response = await axios.put(`${baseUrl}/api/vouchers`, voucherData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating voucher:", error);
      return null;
    }
  };

  // Delete a voucher
  const deleteVoucher = async (id) => {
    try {
      const response = await axios.delete(`${baseUrl}/api/vouchers/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting voucher with ID ${id}:`, error);
      return null;
    }
  };

  return {
    fetchVouchers,
    fetchVoucherById,
    fetchVoucherByCode,
    createVoucher,
    updateVoucher,
    deleteVoucher,
  };
};
