import axios from "axios"; 
import { getToken } from "./tokenHelper";

export const useExchangeEyeGlassService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const fetchAllExchangeEyeGlass = async (StaffID, AccountID, ProductGlassID, OrderID, pageIndex) => {
        try {
            const token = getToken();
            const url = `${baseUrl}/api/exchange-eyeglass`;    
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    StaffID: StaffID,
                    OrderID: OrderID,
                    AccountID: AccountID,
                    ProductGlassID: ProductGlassID,
                    PageIndex: pageIndex,
                    PageSize: 20,
                },
            });
    
            return {
                items: response.data.data,
                totalItems: response.data.totalCount,
            };
        } catch (error) {
            console.error("Error fetching exchange eye glasses:", error);
            if (error.response) {
                console.error("Response error:", error.response.data);
            }
            return {
                items: [],
                totalItems: 0,
            };
        }
    };
    


    const createExchangeEyeGlass = async (exchangeEyeGlassData) => {
        return axios.post(`${baseUrl}/api/exchange-eyeglass`, exchangeEyeGlassData, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        })
        .then(response => response.data || null)
        .catch(error => null);
    };

    const fetchExchangeEyeGlassById = async (id) => {
        return axios.get(`${baseUrl}/api/exchange-eyeglass/${id}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        })
        .then(response => response.data || null)
        .catch(error => null);
    };

    const deleteExchangeEyeGlass = async (id) => {
        return axios.delete(`${baseUrl}/api/exchange-eyeglass/${id}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        })
        .then(response => response.data || null)
        .catch(error => null);
    };

    const checkProductGlass = async (productGlassID) => {
        return axios.get(`${baseUrl}/api/staff/orders/check-product`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            params: { productGlassID } // Pass productGlassID as a query parameter
        })
        .then(response => response.data || null)
        .catch(error => null);
    };    

    return { fetchAllExchangeEyeGlass, createExchangeEyeGlass, fetchExchangeEyeGlassById, deleteExchangeEyeGlass, checkProductGlass };
};