import React, { useState, useEffect } from 'react';
import { Camera, Plus, Search, ShoppingCart, User, Phone } from 'lucide-react';
import { useCart } from './context/CartContext';
import { useOrderService } from '../../../../Api/orderService';
import { usePaymentService } from '../../../../Api/paymentService';
import { useProductGlassService } from '../../../../Api/productGlassService';
import { EyeGlass, Lens } from './types/product';
import ProductGrid from './ProductSelection/ProductGrid';
import LensSelection from './LensSelection/index';
import CustomerSearch from './CustomerSelection/CustomerSearch';
import OrderSummary from './OrderSummary/OrderSummary';
import OrderSuccessModal from './Modals/OrderSuccessModal';
import CartModal from './cart/CartModal';
import { toast } from 'react-hot-toast';
import styles from './styles/StaffOrder.module.scss';
import { useRefractionRecordsService } from '../../../../Api/refractionRecordService';
import { useMeasurementService } from '../../../../Api/measurementService';


interface Customer {
  id: number;
  username: string;
  email: string;
  status: boolean;
  roleID: number;
  phoneNumber: string;
  role: {
    id: number;
    name: string;
    description: string;
    status: boolean;
  };
}

interface OrderData {
  accountID: number;
  receiverAddress?: string;
  kioskID?: number;
  isDeposit: boolean;
  voucherID?: number;
  shippingMethod: 'customer' | 'kiosk';
  paymentMethod: 'cash' | 'vnpay';
  totalAmount: number;
  depositAmount?: number;
  remainingAmount?: number;
  shippingCost: number;
}

interface VoucherInfo {
  id: number;
  name: string;
  code: string;
  discountType: string;
  discountValue: number;
  status: boolean;
  quantity: number;
}

const steps = [
  { id: 1, title: 'Select Customer', icon: User },
  { id: 2, title: 'Select Frame', icon: Camera },
  { id: 3, title: 'Add Lens', icon: Plus },
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
  const { state: cartState, dispatch: cartDispatch } = useCart();

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vnpay'>('cash');

  // Selection states
  const [selectedProduct, setSelectedProduct] = useState<EyeGlass | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Order states
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherInfo | null>(null);
  const userInfoString = localStorage.getItem('UserInfo');
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const accountID = userInfo?.user?.id || 0;

  // Services
  const { createOrderNow } = useOrderService();
  const { createPaymentUrl, fetchPaymentByOrderId } = usePaymentService();
  const { createProductGlass } = useProductGlassService();
  const { fetchRefractionRecordsByProfileId } = useRefractionRecordsService();
  const { fetchMeasurementsRecordId } = useMeasurementService();

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentStep(2);
    toast.success('Customer selected successfully');
  };

  const handleAddToCart = async (productData: any) => {
    const cartItemId = `${Date.now()}-${Math.random()}`;
    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        id: cartItemId,
        ...productData,
        quantity: 1
      }
    });
    toast.success('Added to cart');
    setSelectedProduct(null);
    setCurrentStep(2);
  };

  const handleCreateOrder = async (method: 'cash' | 'vnpay', orderData: OrderData) => {
    if (!selectedCustomer || cartState.items.length === 0) {
      setError('Missing required order information');
      return;
    }
  
    setLoading(true);
    try {
      // Prepare order details from cart items
      const orderDetails = cartState.items.map(item => ({
        quantity: item.quantity,
        productGlassRequest: {
          eyeGlassID: item.eyeGlass.id,
          leftLenID: item.leftLens.id,
          rightLenID: item.rightLens.id,
          accountID: selectedCustomer.id,
          sphereOD: item.prescriptionData?.sphereOD || undefined,
          cylinderOD: item.prescriptionData?.cylinderOD || undefined,
          axisOD: item.prescriptionData?.axisOD || undefined,
          sphereOS: item.prescriptionData?.sphereOS || undefined,
          cylinderOS: item.prescriptionData?.cylinderOS || undefined,
          axisOS: item.prescriptionData?.axisOS || undefined,
          addOD: item.prescriptionData?.addOD || undefined,
          addOS: item.prescriptionData?.addOS || undefined,
          pd: item.prescriptionData?.pd || undefined
        }
      }));
      console.log('Order details:', orderDetails);  
  
      // Prepare final order data with new structure
      const finalOrderData = {
        accountID: orderData.accountID,
        receiverAddress: orderData.receiverAddress,
        kioskID: orderData.kioskID,
        voucherID: orderData.voucherID,
        isDeposit: orderData.isDeposit,
        orderDetails: orderDetails
      };
  
      // Create order
      console.log('Creating order with data:', finalOrderData);
      const orderResponse = await createOrderNow(finalOrderData);
  
      if (!orderResponse || !orderResponse.id) {
        throw new Error('Failed to create order');
      }
  
      // Handle payment based on method
      if (method === 'vnpay') {
        try {
          const paymentData = {
            orderID: orderResponse.id
          };
          
          const paymentResponse = await createPaymentUrl(paymentData);
          console.log('Payment response:', paymentResponse);
          
          if (paymentResponse?.paymentUrl) {
            window.location.href = paymentResponse.paymentUrl;
          } else {
            throw new Error('Failed to create payment URL');
          }
        } catch (err) {
          console.error('Payment URL creation error:', err);
          throw new Error('Failed to create payment URL: ' + err.message);
        }
      } else {
        // For cash payment
        const paymentDetails = await fetchPaymentByOrderId(orderResponse.id);
        setCreatedOrder({
          ...orderResponse,
          ...paymentDetails
        });
        setShowSuccessModal(true);
        
        // Clear cart after successful order
        cartDispatch({ type: 'CLEAR_CART' });
        toast.success('Order created successfully');
      }
  
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create order';
      console.error('Order creation error:', err);
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewOrder = () => {
    setSelectedProduct(null);
    setSelectedCustomer(null);
    setSelectedVoucher(null);
    setOrderId('');
    setCurrentStep(1);
    setShowSuccessModal(false);
    setCreatedOrder(null);
    setPaymentMethod('cash');
    cartDispatch({ type: 'CLEAR_CART' });
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className={styles.staffOrderPage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Create New Order</h1>
          {selectedCustomer && (
            <div className={styles.customerInfo}>
              <span className={styles.name}>{selectedCustomer.username}</span>
              <span className={styles.detail}>
                <User size={16} />
                {selectedCustomer.email}
              </span>
              <span className={styles.detail}>
                <Phone size={16} />
                {selectedCustomer.phoneNumber}
              </span>
            </div>
          )}
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.cartButton}
            onClick={() => setShowCartModal(true)}
          >
            <ShoppingCart />
            <span className={styles.cartCount}>{cartState.items.length}</span>
          </button>
        </div>
      </header>

      <div className={styles.stepProgress}>
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = (() => {
            switch (step.id) {
              case 1: return !!selectedCustomer;
              case 2: return cartState.items.length > 0;
              case 3: return !!selectedProduct;
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

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      <div className={styles.content}>
        {currentStep === 1 && (
          <CustomerSearch
            onCustomerSelect={handleCustomerSelect}
            onBack={handleStartNewOrder}
          />
        )}

        {currentStep === 2 && selectedCustomer && (
          <ProductGrid
            onProductSelect={(product: EyeGlass) => {
              setSelectedProduct(product);
              setCurrentStep(3);
            }}
          />
        )}

        {currentStep === 3 && selectedProduct && (
          <LensSelection
            selectedProduct={selectedProduct}
            onLensSelect={(lensData) => {
              handleAddToCart({
                eyeGlass: selectedProduct,
                ...lensData
              });
            }}
            onBack={() => {
              setSelectedProduct(null);
              setCurrentStep(2);
            }}
            customer={selectedCustomer}
            refractionRecordService={fetchRefractionRecordsByProfileId}
            measurementResultService={fetchMeasurementsRecordId}
          />
        )}
        

        {currentStep === 4 && selectedCustomer && cartState.items.length > 0 && (
          <OrderSummary
            cartItems={cartState.items}
            customer={selectedCustomer}
            onBack={() => setCurrentStep(2)}
            onCreateOrder={handleCreateOrder}
            loading={loading}
            onVoucherSelect={(voucher) => setSelectedVoucher(voucher)}
          />
        )}
      </div>

      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        onCheckout={() => {
          setShowCartModal(false);
          setCurrentStep(4);
        }}
      />

      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={handleStartNewOrder}
        orderData={createdOrder}
        // onPrint={handlePrintReceipt}
        onNewOrder={handleStartNewOrder}
        companyInfo={COMPANY_INFO}
      />
    </div>
  );
};

export default StaffOrderPage;