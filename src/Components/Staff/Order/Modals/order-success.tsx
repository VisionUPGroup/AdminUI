// pages/order-success.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePaymentService } from '../../../../../Api/paymentService';
import { useOrderService } from '../../../../../Api/orderService';
import OrderSuccessModal from './OrderSuccessModal';
import PrintReceipt from './PrintReceipt';
import { toast } from 'react-hot-toast';
import { OrderSuccessData } from '../types/orderSuccess';
import ReceiptPrintHandler from './ReceiptPrintHandler';

interface OrderData {
  orderID: number; // Đổi id thành orderID
  code: string;
  orderTime: string;
  totalAmount: number; // Đổi total thành totalAmount
  isDeposit: boolean;
  receiverAddress: string | null;
  kioskID?: number;
  process: number; // Thêm process
  productGlass: Array<{
    productGlassID: number;
    eyeGlass: {
      id: number, // Thêm id
      name: string;
      eyeGlassImage: string;
    };
    leftLen: {
      id: number, // Thêm id
      lensName: string;
      lensDescription: string;
      leftLensImage: string | null;
    };
    rightLen: {
      id: number, // Thêm id
      lensName: string;
      lensDescription: string;
      rightLensImage: string | null;
    };
  }>;
  totalPaid: number;
  remainingAmount: number;
  voucher: null | {
    id: number;
    code: string;
    discountValue: number;
  };
  payments: Array<{
    id: number;
    totalAmount: number;
    date: string;
    paymentMethod: string;
  }>;
}

const COMPANY_INFO = {
  name: "Vision Store",
  address: "123 Vision Street, District 1, HCMC",
  phone: "(028) 1234 5678",
  email: "contact@visionstore.com",
  logo: "/images/logo.png",
  taxId: "0123456789",
  website: "https://visionup.id.vn/" 
};

const STAFF_NAME = "Staff Member"; 

const OrderSuccessPage = () => {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPrintHandler, setShowPrintHandler] = useState(false);
  const { fetchPaymentByOrderId } = usePaymentService();
  const { fetchOrderById } = useOrderService();
  const [hasMounted, setHasMounted] = useState(false);
  const [hasFetchedPayment, setHasFetchedPayment] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || hasFetchedPayment) return;
  
    const handleVNPayResponse = async () => {
      const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
      const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
      const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
  
      if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
        try {
          // Lấy OrderId từ OrderInfo (bỏ prefix VSU)
          const orderId = vnp_OrderInfo?.replace('VSU', '');
          
          if (orderId) {
            // Fetch payment và order details song song
            const [paymentDetails, orderDetails] = await Promise.all([
              fetchPaymentByOrderId(orderId),
              fetchOrderById(orderId)
            ]);
            
            if (paymentDetails) {
              // Transform data cho OrderSuccessModal
              const orderSuccessData = {
                orderID: parseInt(orderId),
                code: vnp_OrderInfo || '',
                orderTime: new Date().toISOString(),
                totalAmount: paymentDetails.totalAmount,
                isDeposit: paymentDetails.isDeposit,
                receiverAddress: paymentDetails.receiverAddress || null,
                kioskID: paymentDetails.kioskID,
                process: paymentDetails.process || 1,
                productGlass: paymentDetails.productGlass.map((item: any) => ({
                  productGlassID: item.productGlassID,
                  eyeGlass: {
                    id: item.eyeGlass.id,
                    name: item.eyeGlass.name,
                    eyeGlassImage: item.eyeGlass.eyeGlassImage
                  },
                  leftLen: {
                    id: item.leftLen.id,
                    lensName: item.leftLen.lensName,
                    lensDescription: item.leftLen.lensDescription,
                    leftLensImage: item.leftLen.leftLensImage || null
                  },
                  rightLen: {
                    id: item.rightLen.id,
                    lensName: item.rightLen.lensName,
                    lensDescription: item.rightLen.lensDescription,
                    rightLensImage: item.rightLen.rightLensImage || null
                  }
                })),
                totalPaid: paymentDetails.totalPaid || 0,
                remainingAmount: paymentDetails.remainingAmount || 0,
                voucher: paymentDetails.voucher,
                payments: paymentDetails.payments || []
              };
              
              // Set data và show modal
              setOrderData(orderSuccessData);
              setShowModal(true);
              setHasFetchedPayment(true);
              toast.success('Payment completed successfully');
            }
          }
        } catch (error) {
          console.error('Error processing payment response:', error);
          toast.error('Failed to process payment response');
          router.push('/en/sales/staff-orders');
        }
      } else {
        toast.error('Payment failed');
        router.push('/en/sales/staff-orders');
      }
    };
  
    if (searchParams.toString()) {
      handleVNPayResponse();
    }
  }, [searchParams, router, fetchPaymentByOrderId, hasMounted, hasFetchedPayment]);

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/en/sales/staff-orders');
  };

  const handlePrintReceipt = () => {
    setShowPrintHandler(true);
  };

  const handlePrintComplete = () => {
    setShowPrintHandler(false);
  };

  const handlePrintError = (error: Error) => {
    toast.error(`Print failed: ${error.message}`);
    setShowPrintHandler(false);
  };

  const handleViewOrderDetails = () => {
    if (orderData?.orderID) {
      router.push(`/en/sales/staff-orderdetail/${orderData.orderID}`);
    }
  };

  const handleNewOrder = () => {
    router.push('/en/sales/staff-orders/create');
  };

  if (!orderData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner"></div>
          <p>Processing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <OrderSuccessModal
        isOpen={showModal}
        orderData={orderData}
        onClose={handleCloseModal}
        onViewDetails={handleViewOrderDetails}
        onNewOrder={handleNewOrder}
        companyInfo={COMPANY_INFO}
      />

      {showPrintHandler && (
        <ReceiptPrintHandler
          orderData={orderData}
          companyInfo={COMPANY_INFO}
          staffName={STAFF_NAME}
          onPrintComplete={handlePrintComplete}
          onPrintError={handlePrintError}
          onPrintStart={() => {
            const loadingToast = toast.loading('Preparing to print...');
            return () => toast.dismiss(loadingToast);
          }}
        />
      )}
    </>
  );
};

export default OrderSuccessPage;