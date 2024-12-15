import axios from "axios";
import { getToken } from "./tokenHelper";

export const useLensService = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Fetch lenses with filters
    const fetchLenses = async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const url = `${baseUrl}/api/lens?${queryParams}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching lenses:", error);
            throw error;
        }
    };

    // Create new lens
    const createLens = async (lensData) => {
        try {
            const response = await axios.post(`${baseUrl}/api/lens`, lensData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating lens:", error);
            return null;
        }
    };

    // Update lens
    const updateLens = async (lensData) => {
        try {
            const response = await axios.put(`${baseUrl}/api/lens`, lensData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating lens:", error);
            return null;
        }
    };

    // Get lens by ID
    const fetchLensById = async (id) => {
        try {
            const response = await axios.get(`${baseUrl}/api/lens/${id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching lens with ID ${id}:`, error);
            return null;
        }
    };

    // Delete lens
    const deleteLens = async (id) => {
        try {
            await axios.delete(`${baseUrl}/api/lens/${id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            return true;
        } catch (error) {
            console.error("Error deleting lens:", error);
            throw error;
        }
    };

    // Get lens images
    const fetchLensImages = async (id) => {
        try {
            const response = await axios.get(`${baseUrl}/api/lens/${id}/lens-images`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching lens images for ID ${id}:`, error);
            return null;
        }
    };

    // Update lens image
    const updateLensImage = async (imageFile, lensImageData) => {
        const formData = new FormData();
        formData.append('Image', imageFile);
        formData.append('LensImage.ID', lensImageData.ID);
        formData.append('LensImage.LensID', lensImageData.LensID);
        formData.append('LensImage.AngleView', lensImageData.AngleView);

        try {
            const response = await axios.put(`${baseUrl}/api/lens-images`, formData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating lens image:", error);
            return null;
        }
    };

    // Upload new lens image
    const uploadLensImage = async (imageFile, lensImageData) => {
        const formData = new FormData();
        formData.append('Image', imageFile);
        formData.append('LensImage.LensID', lensImageData.LensID);
        formData.append('LensImage.AngleView', lensImageData.AngleView);

        try {
            const response = await axios.post(`${baseUrl}/api/lens-images`, formData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error uploading lens image:", error);
            return null;
        }
    };

    const fetchLensTypes = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/lens-types`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching lens types:", error);
            return null;
        }
    };

    const fetchEyeReflactives = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/eye-reflactives`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching eye reflactives:", error);
            return null;
        }
    };

    // Create new lens type
const createLensType = async (lensTypeData) => {
    try {
        const response = await axios.post(`${baseUrl}/api/lens-types`, lensTypeData, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'accept': '*/*',
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error creating lens type:", error);
        throw error;
    }
};

// Update lens type
const updateLensType = async (lensTypeData) => {
    try {
        const response = await axios.put(`${baseUrl}/api/lens-types`, lensTypeData, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'accept': '*/*',
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating lens type:", error);
        throw error;
    }
};

// Get lens type by ID
const fetchLensTypeById = async (id) => {
    try {
        const response = await axios.get(`${baseUrl}/api/lens-types/${id}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'accept': '*/*'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching lens type with ID ${id}:`, error);
        throw error;
    }
};

// Delete lens type
const deleteLensType = async (id) => {
    try {
        const response = await axios.delete(`${baseUrl}/api/lens-types/${id}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'accept': '*/*'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting lens type:", error);
        throw error;
    }
};
const createEyeRefractive = async (eyeRefractiveData) => {
    try {
        const response = await axios.post(
            `${baseUrl}/api/eye-reflactives`,
            eyeRefractiveData,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating eye refractive:", error);
        throw error;
    }
};

// Update eye refractive
const updateEyeRefractive = async (eyeRefractiveData) => {
    try {
        const response = await axios.put(
            `${baseUrl}/api/eye-reflactives`,
            eyeRefractiveData,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating eye refractive:", error);
        throw error;
    }
};

// Delete eye refractive
const deleteEyeRefractive = async (id) => {
    try {
        await axios.delete(`${baseUrl}/api/eye-reflactives/${id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
        return true;
    } catch (error) {
        console.error("Error deleting eye refractive:", error);
        throw error;
    }
};

    return {
        fetchLenses,
        createLens,
        updateLens,
        fetchLensById,
        deleteLens,
        fetchLensImages,
        updateLensImage,
        uploadLensImage,
        fetchLensTypes,
        fetchEyeReflactives,
        createLensType,
        updateLensType, 
        fetchLensTypeById,
        deleteLensType,
        createEyeRefractive, 
        updateEyeRefractive, 
        deleteEyeRefractive, 
    };
};
