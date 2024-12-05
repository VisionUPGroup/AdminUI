import axios from "axios";
import { getToken } from "./tokenHelper";

export const useProductGlassService = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Create a new product glass
  const createProductGlass = async (productGlassData) => {
    const token = getToken();
    try {
      const response = await axios.post(
        `${baseUrl}/api/product-glasses`,
        productGlassData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating product glass:", error);
      throw error;
    }
  };
  const fetchProductGlassById = async (productGlassId) => {
    const token = getToken();
    try {
      const response = await axios.get(
        `${baseUrl}/api/product-glasses/${productGlassId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetch product glass:", error);
      throw error;
    }
  };

  return {
    createProductGlass,
    fetchProductGlassById,
  };
};
