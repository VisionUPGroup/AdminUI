import axios from "axios";
import { getToken } from "./tokenHelper";

export const useProfileService = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchProfilesByAccountId = async (accountId, pageIndex, pageSize, username) => {
    try {
      const token = getToken();
      const response = await axios.get(`${baseUrl}/api/profiles`, {
        params: {
          AccountID: accountId,
          PageIndex: pageIndex,
          PageSize: pageSize,
          Descending: true,
          Username: username,
          
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
      console.error("Error fetching profiles:", error);
      throw error;
    }
  };

  const createProfiles = async (profileData) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${baseUrl}/api/profiles`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = getToken();
      const response = await axios.put(
        `${baseUrl}/api/profiles`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const deleteProfile = async (profileId) => {
    try {
      const token = getToken();
      const response = await axios.delete(`${baseUrl}/api/profiles/${profileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw error;
    }
  };

  return {
    fetchProfilesByAccountId,
    createProfiles,
    updateProfile,
    deleteProfile,
  };
};
