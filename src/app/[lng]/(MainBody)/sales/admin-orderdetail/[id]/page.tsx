"use client";
import { useParams } from 'next/navigation';
import OrderDetailPage from '@/Components/Sales/AdminOrderDetail';

const OrderDetailContainer = () => {
  const params = useParams();
  const id = params?.id as string;

  return <OrderDetailPage id = {id}/>;
};

export default OrderDetailContainer;