import React, { useState, useEffect } from 'react';
import { Camera, Plus, Search, ShoppingCart } from 'lucide-react';
import { useCart } from './context/CartContext';
import { useEyeGlassService } from '../../../../Api/eyeGlassService';
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

// interface Customer {
//   id: number;
//   email: string;
//   phoneNumber: string;
//   profiles: Array<{
//     fullName: string;
//     address: string;
//   }>;
// }

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
    setCurrentStep(1);
  };

  const handleCreateOrder = async (method: 'cash' | 'vnpay') => {
    if (!selectedCustomer || cartState.items.length === 0) {
      setError('Missing required order information');
      return;
    }

    setLoading(true);
    try {
      // Create ProductGlass entries first
      const productGlassIds = await Promise.all(
        cartState.items.map(async (item) => {
          const productGlassData = {
            eyeGlassID: item.eyeGlass.id,
            leftLenID: item.leftLens.id,
            rightLenID: item.rightLens.id,
            accountID: selectedCustomer.id,
            sphereOD: item.prescriptionData.sphereOD || 0,
            cylinderOD: item.prescriptionData.cylinderOD || 0,
            axisOD: item.prescriptionData.axisOD || 0,
            sphereOS: item.prescriptionData.sphereOS || 0,
            cylinderOS: item.prescriptionData.cylinderOS || 0,
            axisOS: item.prescriptionData.axisOS || 0,
            addOD: 0,
            addOS: 0,
            pd: item.prescriptionData.pd || 0
          };

          const response = await createProductGlass(productGlassData);
          return response.id;
        })
      );

      // Create the order
      const orderData = {
        accountID: selectedCustomer.id,
        // receiverAddress: selectedCustomer.profiles[0]?.address || '',
        receiverAddress: 'Kisok 1, 123 Vision Street, District 1, HCMC',
        // kioskID: 19,
        isDeposit: true,
        listProductGlassID: productGlassIds
      };

      console.log(orderData);

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
          const paymentDetails = await fetchPaymentByOrderId(orderResponse.id);
          setCreatedOrder({
            ...orderResponse,
            ...paymentDetails
          });
          setShowSuccessModal(true);
          cartDispatch({ type: 'CLEAR_CART' });
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

  const handleStartNewOrder = () => {
    setSelectedProduct(null);
    setSelectedCustomer(null);
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
              case 1: return cartState.items.length > 0;
              case 2: return !!selectedProduct;
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

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          {error}
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
            onLensSelect={(lensData) => {
              handleAddToCart({
                eyeGlass: selectedProduct,
                ...lensData
              });
            }}
            onBack={() => {
              setSelectedProduct(null);
              setCurrentStep(1);
            }}
          />
        )}

        {currentStep === 3 && (
          <CustomerSearch
            onCustomerSelect={(customer: Customer) => {
              setSelectedCustomer(customer);
              setCurrentStep(4);
            }}
            onBack={() => setCurrentStep(cartState.items.length > 0 ? 1 : 2)}
          />
        )}

        {currentStep === 4 && selectedCustomer && cartState.items.length > 0 && (
          <OrderSummary
            cartItems={cartState.items}
            customer={selectedCustomer}
            onBack={() => setCurrentStep(3)}
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
          setCurrentStep(3);
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