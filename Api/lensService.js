import axios from "axios";
import { getToken } from "./tokenHelper";

export const useLensService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const fetchLensById = async (lensId) => {
        try {
            const token = getToken();
            const response = await axios.get(`${baseUrl}/api/lens/${lensId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching lens:", error);
            throw error;
        }
    };


    return {
     fetchLensById
    };
};
