import axios from "axios";
import { getToken } from "./tokenHelper";

export const useEyeGlassService = () => {
  const baseUrl = "https://visionup.azurewebsites.net";

  // Lấy danh sách kính mắt
  const fetchEyeGlasses = async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${baseUrl}/api/eye-glasses?${queryParams}`;

    return axios
      .get(url, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((response) => response.data || null)
      .catch((error) => {
        console.error("Error fetching eye glasses:", error);
        return null;
      });
  };

  // Lấy danh sách loại kính mắt
  const fetchEyeGlassTypes = async () => {
    const url = `${baseUrl}/api/eyeglass-types`;

    return axios
      .get(url, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
        },
        params: {
          Descending: true,
        },
      })
      .then((response) => response.data || null)
      .catch((error) => {
        console.error("Error fetching eye glass types:", error);
        return null;
      });
  };

  // Lấy thông tin kính mắt theo ID
  const fetchEyeGlassById = async (id) => {
    const url = `${baseUrl}/api/eye-glasses/${id}`;

    return axios
      .get(url, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((response) => response.data || null)
      .catch((error) => {
        console.error(`Error fetching eye glass with ID ${id}:`, error);
        return null;
      });
  };

  // Lấy danh sách hình ảnh của kính mắt theo ID
  const fetchEyeGlassImagesById = async (id) => {
    const url = `${baseUrl}/api/eye-glasses/${id}/eye-glass-images`;

    return axios
      .get(url, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((response) => response.data || null)
      .catch((error) => {
        console.error(`Error fetching eye glass images for ID ${id}:`, error);
        return null;
      });
  };

  // Cập nhật thông tin kính mắt
  const updateEyeGlass = async (eyeGlassData) => {
    const url = `${baseUrl}/api/eye-glasses`;

    return axios
      .put(url, eyeGlassData, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.data || null)
      .catch((error) => {
        console.error("Error updating eye glass:", error);
        return null;
      });
  };

  // Cập nhật hình ảnh của kính mắt
  const updateEyeGlassImage = async (imageFile, eyeGlassImageData) => {
    const url = `${baseUrl}/api/eye-glass-images`;
    const formData = new FormData();
    formData.append("Image", imageFile);
    formData.append("EyeGlassImage.ID", eyeGlassImageData.ID);
    formData.append("EyeGlassImage.EyeGlassID", eyeGlassImageData.EyeGlassID);
    formData.append("EyeGlassImage.AngleView", eyeGlassImageData.AngleView);

    return axios
      .put(url, formData, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data || null)
      .catch((error) => {
        console.error("Error updating eye glass image:", error);
        return null;
      });
  };

  // Tạo mới kính mắt
  const createEyeGlass = async (eyeGlassData) => {
    const url = `${baseUrl}/api/eye-glasses`;

    return axios
      .post(url, eyeGlassData, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.data || null)
      .catch((error) => {
        console.error("Error creating eye glass:", error);
        return null;
      });
  };

  const uploadEyeGlassImage = async (imageFile, eyeGlassImageData) => {
    const url = `${baseUrl}/api/eye-glass-images`;
    const formData = new FormData();
    formData.append("Image", imageFile);
    formData.append("EyeGlassImage.EyeGlassID", eyeGlassImageData.EyeGlassID);
    formData.append("EyeGlassImage.AngleView", eyeGlassImageData.AngleView);

    return axios
      .post(url, formData, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data || null)
      .catch((error) => {
        console.error("Error uploading eye glass image:", error);
        return null;
      });
  };

  const deleteEyeGlass = async (id) => {
    const url = `${baseUrl}/api/eye-glasses/${id}`;

    try {
      const response = await axios.delete(url, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      // Check response status
      if (response.status >= 200 && response.status < 300) {
        return true;
      }

      throw new Error("Server returned unexpected status");
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(
          error.response.data?.message || `Lỗi server: ${error.response.status}`
        );
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("Không nhận được phản hồi từ server");
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error("Lỗi khi gửi yêu cầu xóa");
      }
    }
  };

  const createEyeGlassType = async (eyeGlassTypeData) => {
    const url = `${baseUrl}/api/eyeglass-types`;

    return axios
      .post(url, eyeGlassTypeData, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.data || null)
      .catch((error) => {
        console.error("Error creating eye glass type:", error);
        return null;
      });
  };

  const updateEyeGlassType = async (eyeGlassTypeData) => {
    const url = `${baseUrl}/api/eyeglass-types`;

    return axios
      .put(url, eyeGlassTypeData, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.data || null)
      .catch((error) => {
        console.error("Error updating eye glass type:", error);
        return null;
      });
  };

  const deleteEyeGlassType = async (id) => {
    const url = `${baseUrl}/api/eyeglass-types/${id}`;

    try {
      const response = await axios.delete(url, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        return true;
      }

      throw new Error("Server returned unexpected status");
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data?.message ||
            `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        throw new Error("No response received from server");
      } else {
        throw new Error("Error sending delete request");
      }
    }
  };

  return {
    fetchEyeGlasses,
    fetchEyeGlassTypes,
    fetchEyeGlassById,
    fetchEyeGlassImagesById,
    updateEyeGlass,
    updateEyeGlassImage,
    createEyeGlass,
    uploadEyeGlassImage,
    deleteEyeGlass,
    createEyeGlassType,
    updateEyeGlassType,
    deleteEyeGlassType,
  };
};
