import axios from "axios";
import { getToken } from "./tokenHelper";

export const useMeasurementService = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchMeasurementsRecordId = async (recordId) => {
    try {
      const token = getToken();
      const response = await axios.get(`${baseUrl}/api/measurement-results`, {
        params: {
            RecordID: recordId,
            Descending:true
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error("Error fetching measurements:", error);
      throw error;
    }
  };

  const createMeasurement = async (measurementData) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${baseUrl}/api/measurement-results`,
        measurementData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error creating measurements:", error);
      throw error;
    }
  };

  const updateMeasurement = async (measurementData) => {
    try {
      const token = getToken();
      const response = await axios.put(
        `${baseUrl}/api/measurement-results`,
        measurementData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating measurements:", error);
      throw error;
    }
  };

  const deleteMeasurement = async (measurementId) => {
    try {
      const token = getToken();
      const response = await axios.delete(`${baseUrl}/api/measurement-results/${measurementId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error deleting measurements:", error);
      throw error;
    }
  };

  return {
    fetchMeasurementsRecordId,
    createMeasurement,
    updateMeasurement,
    deleteMeasurement,
  };
};
