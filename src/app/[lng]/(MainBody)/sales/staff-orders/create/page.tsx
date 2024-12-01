"use client";
import StaffOrderPage from "@/Components/Staff/Order/StaffOrderPage";
import { CartProvider } from '../../../../../../Components/Staff/Order/context/CartContext';

const SaleOrdersContainer = () => {
  return (
    <CartProvider>
      <StaffOrderPage />
    </CartProvider>
  );
};

export default SaleOrdersContainer;
