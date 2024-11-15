import axios from "axios";
import { getToken } from "./tokenHelper";

export const useRefractionRecordsService = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchRefractionRecordsByProfileId = async (profileId) => {
    try {
      const token = getToken();
      const response = await axios.get(`${baseUrl}/api/refraction-records`, {
        params: {
          ProfileID: profileId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching records:", error);
      throw error;
    }
  };

  const createRefractionRecords = async (refractionData) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${baseUrl}/api/refraction-records`,
        refractionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response;
    } catch (error) {
      console.error("Error creating record:", error);
      throw error;
    }
  };

  const updateRefractionRecords = async (refractionData) => {
    try {
      const token = getToken();
      const response = await axios.put(
        `${baseUrl}/api/refraction-records`,
        refractionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating records:", error);
      throw error;
    }
  };

  const deleteRefractionRecords = async (refractionId) => {
    try {
      const token = getToken();
      const response = await axios.delete(`${baseUrl}/api/refraction-records/${refractionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error deleting records:", error);
      throw error;
    }
  };

  return {
    fetchRefractionRecordsByProfileId,
    createRefractionRecords,
    updateRefractionRecords,
    deleteRefractionRecords,
  };
};
