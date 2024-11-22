"use client";
import { useParams } from 'next/navigation';
import OrderSuccessPage from "@/Components/Staff/Order/Modals/order-success";

const OrderSuccessContainer = () => {
  const params = useParams();

  return <OrderSuccessPage />;
};

export default OrderSuccessContainer;