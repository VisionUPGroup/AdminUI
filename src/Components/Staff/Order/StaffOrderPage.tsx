import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Camera, Plus, Search, ShoppingCart } from 'lucide-react';
import { useEyeGlassService } from '../../../../Api/eyeGlassService';
import { useLensService } from '../../../../Api/lensService';
import { useOrderService } from '../../../../Api/orderService';
import { usePaymentService } from '../../../../Api/paymentService';
import { useProductGlassService } from '../../../../Api/productGlassService';
import { EyeGlass } from './types/product';
import { Lens } from './types/lens';
import styles from './styles/StaffOrder.module.scss';
import ProductGrid from './ProductSelection/ProductGrid';
import LensSelection from './LensSelection/index';
import CustomerSearch from './CustomerSelection/CustomerSearch';
import OrderSummary from './OrderSummary/OrderSummary';
import OrderSuccessModal from './Modals/OrderSuccessModal';
import { toast } from 'react-hot-toast';

interface Customer {
  id: number;
  email: string;
  phoneNumber: string;
  profiles: Array<{
    fullName: string;
    address: string;
  }>;
}

interface VoucherInfo {
  id: number;
  name: string;
  code: string;
  discountType: string;
  discountValue: number;
  status: boolean;
}

interface PrescriptionData {
  sphereOD?: number;
  cylinderOD?: number;
  axisOD?: number;
  sphereOS?: number;
  cylinderOS?: number;
  axisOS?: number;
  pd?: number;
}

const steps = [
  { id: 1, title: 'Select Product', icon: Camera },
  { id: 2, title: 'Add Lens', icon: Plus },
  { id: 3, title: 'Customer Info', icon: Search },
  { id: 4, title: 'Checkout', icon: ShoppingCart }
];

const COMPANY_INFO = {
  name: "Vision Store",
  address: "123 Vision Street, District 1, HCMC",
  phone: "(028) 1234 5678",
  email: "contact@visionstore.com",
  logo: "/images/logo.png",
  taxId: "0123456789",
  website: "https://visionstore.com"
};

const StaffOrderPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter();

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vnpay'>('cash');

  // Order states
  const [selectedProduct, setSelectedProduct] = useState<EyeGlass | null>(null);
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherInfo | null>(null);

  // Services
  const eyeGlassService = useEyeGlassService();
  const lensService = useLensService();
  const { createOrderNow } = useOrderService();
  const { createPaymentUrl, fetchPaymentByOrderId } = usePaymentService();
  const productGlassService = useProductGlassService();

  const handleCreateOrder = async (method: 'cash' | 'vnpay') => {
    if (!selectedProduct || !selectedLens || !selectedCustomer || !prescriptionData) {
      setError('Missing required order information');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        receiverAddress: selectedCustomer.profiles[0]?.address || null,
        isDeposit: true,
        voucherID: selectedVoucher?.id || null,
        orderDetails: [{
          quantity: 1,
          productGlassRequest: {
            eyeGlassID: selectedProduct.id,
            leftLenID: selectedLens.id,
            rightLenID: selectedLens.id,
            accountID: selectedCustomer.id,
            sphereOD: prescriptionData.sphereOD || 0,
            cylinderOD: prescriptionData.cylinderOD || 0,
            axisOD: prescriptionData.axisOD || 0,
            sphereOS: prescriptionData.sphereOS || 0,
            cylinderOS: prescriptionData.cylinderOS || 0,
            axisOS: prescriptionData.axisOS || 0,
            addOD: 0,
            addOS: 0,
            pd: prescriptionData.pd || 0
          }
        }]
      };

      const orderResponse = await createOrderNow(orderData);

      if (orderResponse && orderResponse.id) {
        setCreatedOrder(orderResponse);

        if (method === 'vnpay') {
          const paymentResponse = await createPaymentUrl(orderResponse.id);

          if (paymentResponse?.paymentUrl) {
            window.location.href = paymentResponse.paymentUrl;
          } else {
            throw new Error('Invalid payment URL');
          }
        } else {
          // Xử lý thanh toán tiền mặt
          const paymentDetails = await fetchPaymentByOrderId(orderResponse.id);
          setCreatedOrder({
            ...orderResponse,
            ...paymentDetails
          });
          setShowSuccessModal(true);
          toast.success('Order created successfully');
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create order';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleViewOrderDetails = () => {
    // router.push(`/staff/orders/${createdOrder?.id}`);
  };

  const handleStartNewOrder = () => {
    setSelectedProduct(null);
    setSelectedLens(null);
    setPrescriptionData(null);
    setSelectedCustomer(null);
    setCurrentStep(1);
    setShowSuccessModal(false);
    setCreatedOrder(null);
    setPaymentMethod('cash');
    setOrderId(`VIS-${new Date().getTime().toString().slice(-6)}`);
  };

  useEffect(() => {
    setOrderId(`VIS-${new Date().getTime().toString().slice(-6)}`);
  }, []);

  const StepHeader: React.FC = () => (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <h1>Create New Order</h1>
        <div className={styles.orderNumber}>
          Order #{orderId}
        </div>
      </div>

      <div className={styles.stepProgress}>
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = (() => {
            switch (step.id) {
              case 1: return !!selectedProduct;
              case 2: return !!selectedLens;
              case 3: return !!selectedCustomer;
              case 4: return false;
              default: return false;
            }
          })();

          return (
            <div key={step.id} className={styles.stepContainer}>
              <div
                className={`${styles.step} ${currentStep === step.id ? styles.active : ''} 
                           ${isCompleted ? styles.completed : ''}`}
              >
                <div className={styles.iconWrapper}>
                  <Icon className={styles.icon} />
                </div>
                <span>{step.title}</span>
              </div>
              {step.id !== steps.length && (
                <div className={`${styles.stepLine} ${isCompleted ? styles.completed : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={styles.staffOrderPage}>
      <StepHeader />

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Processing...
        </div>
      )}

      <div className={styles.content}>
        {currentStep === 1 && (
          <ProductGrid
            onProductSelect={(product: EyeGlass) => {
              setSelectedProduct(product);
              setCurrentStep(2);
            }}
          />
        )}

        {currentStep === 2 && selectedProduct && (
          <LensSelection
            selectedProduct={selectedProduct}
            onLensSelect={(lens: Lens, prescription: PrescriptionData) => {
              setSelectedLens(lens);
              setPrescriptionData(prescription);
              setCurrentStep(3);
            }}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <CustomerSearch
            onCustomerSelect={(customer: Customer) => {
              setSelectedCustomer(customer);
              setCurrentStep(4);
            }}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && selectedProduct && selectedLens && selectedCustomer && prescriptionData && (
          <OrderSummary
            product={selectedProduct}
            lens={selectedLens}
            customer={selectedCustomer}
            prescriptionData={prescriptionData}
            onBack={() => setCurrentStep(3)}
            onCreateOrder={handleCreateOrder}
            loading={loading}
            onVoucherSelect={(voucher) => setSelectedVoucher(voucher)}
          />
        )}
      </div>

      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={handleStartNewOrder}
        orderData={{
          orderID: createdOrder?.id || 0,
          code: createdOrder?.code || '',
          orderTime: createdOrder?.orderTime || new Date().toISOString(),
          totalAmount: createdOrder?.totalAmount || 0,
          isDeposit: createdOrder?.isDeposit || false,
          receiverAddress: createdOrder?.receiverAddress || null,
          kioskID: createdOrder?.kioskID,
          process: createdOrder?.process || 1,
          productGlass: createdOrder?.productGlass.map((item: any) => ({
            productGlassID: item.productGlassID,
            eyeGlass: {
              id: item.eyeGlass.id,
              name: item.eyeGlass.name,
              eyeGlassImage: item.eyeGlass.eyeGlassImage,
            },
            leftLen: {
              id: item.leftLen.id,
              lensName: item.leftLen.lensName,
              lensDescription: item.leftLen.lensDescription,
              leftLensImage: item.leftLen.leftLensImage || null,
            },
            rightLen: {
              id: item.rightLen.id,
              lensName: item.rightLen.lensName,
              lensDescription: item.rightLen.lensDescription,
              rightLensImage: item.rightLen.rightLensImage || null,
            },
          })) || [],
          totalPaid: createdOrder?.totalPaid || 0,
          remainingAmount: createdOrder?.remainingAmount || 0,
          voucher: createdOrder?.voucher || null,
          payments: createdOrder?.payments || [],
        }}
        onPrint={handlePrintReceipt}
        onViewDetails={handleViewOrderDetails}
        onNewOrder={handleStartNewOrder}
        companyInfo={COMPANY_INFO} // Pass companyInfo prop
      />
    </div>
  );
};

export default StaffOrderPage;