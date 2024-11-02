import axios from "axios"; 

export const useAuthService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Login
    const login = async (username, password) => {
        return axios.post(`${baseUrl}/api/accounts/login-jwt`, { username, password })
            .then(response => {
                if (response.data) {
                    return response.data;
                } else {
                    return null;
                }
            })
            .catch(error => {
                return null;
            });
    };

    // Register
    const register = async (username, password, email, phoneNumber) => {
        console.log(username)
        console.log(email)
        console.log(password)
        console.log(phoneNumber)
        return axios.post(`${baseUrl}/api/accounts/register`, { username, password, email, phoneNumber })
            .then(response => {
                if (response.data) {
                    return response.data;
                } else {
                    return null;
                }
            })
            .catch(error => {
                return null;
            });
    };

    return { login, register };
};