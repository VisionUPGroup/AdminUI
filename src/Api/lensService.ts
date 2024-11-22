
import axios from 'axios';

export const useLensService = () => {
  const fetchLenses = async (params: { lensTypeId: number }) => {
    try {
      // Log request parameters
      console.log('Requesting lenses with params:', params);
      
      // Đảm bảo URL và parameters đúng với API backend
      const response = await axios.get('/api/lenses', { params });
      
      // Log response
      console.log('API Response:', response);
      
      return response;
    } catch (error) {
      console.error('Lens service error:', error);
      throw error;
    }
  };

  return { fetchLenses };
};