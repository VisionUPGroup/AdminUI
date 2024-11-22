// hooks/useStaffOrder.ts
import { useState } from 'react';
import { useEyeGlassService } from '../../../../../Api/eyeGlassService';
import { useLensService } from '../../../../../Api/lensService';
import { useOrderService } from '../../../../../Api/orderService';
import { useProductGlassService } from '../../../../../Api/productGlassService';
import { usePaymentService } from '../../../../../Api/paymentService';
import { EyeGlass } from '../types/product';
import { Lens } from '../types/lens';

interface OrderState {
  selectedProduct: EyeGlass | null;
  selectedLens: Lens | null;
  prescription: {
    sphereOD?: number;
    cylinderOD?: number;
    axisOD?: number;
    sphereOS?: number;
    cylinderOS?: number;
    axisOS?: number;
    pd?: number;
  } | null;
  customer: any | null;
}

export const useStaffOrder = () => {
  const [orderState, setOrderState] = useState<OrderState>({
    selectedProduct: null,
    selectedLens: null,
    prescription: null,
    customer: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eyeGlassService = useEyeGlassService();
  const lensService = useLensService();
  const orderService = useOrderService();
  const productGlassService = useProductGlassService();
  const paymentService = usePaymentService();

  const fetchProducts = async (filters: any) => {
    setLoading(true);
    try {
      const response = await eyeGlassService.fetchEyeGlasses(filters);
      return response.data;
    } catch (err) {
      setError('Failed to fetch products');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchLenses = async (filters: any) => {
    setLoading(true);
    try {
      const response = await lensService.fetchLenses(filters);
      return response.data;
    } catch (err) {
      setError('Failed to fetch lenses');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (paymentMethod: 'cash' | 'vnpay') => {
    if (!orderState.selectedProduct || !orderState.selectedLens || !orderState.customer) {
      setError('Missing required order information');
      return null;
    }

    setLoading(true);
    try {
      // Create product glass first
      const productGlassData = {
        eyeGlassID: orderState.selectedProduct.id,
        leftLenID: orderState.selectedLens.id,
        rightLenID: orderState.selectedLens.id,
        accountID: orderState.customer.id,
        ...orderState.prescription
      };

      // Create order
      const orderData = {
        receiverAddress: orderState.customer.profiles[0]?.address || '',
        orderDate: new Date().toISOString(),
        isDeposit: false,
        listProductGlassID: [productGlassData]
      };

      const orderResponse = await orderService.createOrderNow(orderData, orderState.customer.id);

      if (paymentMethod === 'vnpay') {
        const paymentUrl = await paymentService.createPaymentUrl(orderResponse.id);
        return { orderResponse, paymentUrl };
      }

      return { orderResponse };
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderState = (updates: Partial<OrderState>) => {
    setOrderState(prev => ({ ...prev, ...updates }));
  };

  return {
    orderState,
    loading,
    error,
    fetchProducts,
    fetchLenses,
    createOrder,
    updateOrderState,
    clearError: () => setError(null)
  };
};