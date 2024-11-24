import React, { useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Check,
  ShoppingBag,
  Eye,
  User,
  Receipt,
  Tag,
  AlertCircle,
  Percent,
  Loader
} from 'lucide-react';
import { useVoucherService } from '../../../../../Api/voucherService';
import styles from '../styles/OrderSummary.module.scss';

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
  quantity: number; // Added quantity field
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

interface OrderSummaryProps {
  product: {
    id: number;
    name: string;
    price: number;
    eyeGlassImages: Array<{ url: string }>;
  };
  lens: {
    id: number;
    lensName: string;
    lensPrice: number;
    lensImages: Array<{ url: string }>;
  };
  customer: Customer;
  prescriptionData: PrescriptionData;
  onBack: () => void;
  onCreateOrder: (method: 'cash' | 'vnpay') => Promise<void>;
  loading: boolean;
  onVoucherSelect: (voucher: VoucherInfo | null) => void;
}

const StaffOrderSummary: React.FC<OrderSummaryProps> = ({
  product,
  lens,
  customer,
  prescriptionData,
  onBack,
  onCreateOrder,
  loading,
  onVoucherSelect
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vnpay'>('cash');
  const [error, setError] = useState<string | null>(null);
  const [isDeposit, setIsDeposit] = useState(true);

  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherInfo, setVoucherInfo] = useState<VoucherInfo | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  const { fetchVoucherByCode } = useVoucherService();

  const calculateSubtotal = () => product.price + lens.lensPrice;

  const calculateDiscount = () => {
    if (!voucherInfo || !voucherInfo.discountValue) return 0;
    const discountAmount = (calculateSubtotal() * voucherInfo.discountValue) / 100;
    return Math.min(discountAmount, calculateSubtotal());
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const totalBeforeDeposit = Math.max(subtotal - discount, 0);
    return isDeposit ? totalBeforeDeposit * 0.3 : totalBeforeDeposit;
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Please enter a voucher code');
      return;
    }

    setVoucherLoading(true);
    setVoucherError(null);

    try {
      const voucherData = await fetchVoucherByCode(voucherCode);
      if (voucherData && voucherData.length > 0) {
        const voucher = voucherData[0];
        
        // Check voucher quantity
        if (voucher.quantity === 0) {
          setVoucherError('This voucher has been fully redeemed');
          setVoucherInfo(null);
          onVoucherSelect(null);
          return;
        }

        const mappedVoucher = {
          id: voucher.id,
          name: voucher.name,
          code: voucher.code,
          discountType: 'PERCENTAGE',
          discountValue: voucher.sale,
          status: voucher.status,
          quantity: voucher.quantity
        };

        if (!mappedVoucher.status) {
          setVoucherError('This voucher is no longer active');
          setVoucherInfo(null);
          onVoucherSelect(null);
          return;
        }

        setVoucherInfo(mappedVoucher);
        onVoucherSelect(mappedVoucher);
        console.log("Voucher", mappedVoucher);
      } else {
        setVoucherError('Invalid voucher code');
        setVoucherInfo(null);
        onVoucherSelect(null);
      }
    } catch (error: any) {
      setVoucherError(error.message || 'Could not apply voucher');
      setVoucherInfo(null);
      onVoucherSelect(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherInfo(null);
    setVoucherCode('');
    setVoucherError(null);
    onVoucherSelect(null);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      await onCreateOrder(paymentMethod);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    }
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  return (
    <div className={styles.staffOrderSummary}>
      {/* Header Section */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Customer Selection</span>
        </button>
        <div className={styles.orderInfo}>
          <h2>Order Summary</h2>
        </div>
      </div>

      <div className={styles.content}>
        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Products Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <ShoppingBag size={20} />
              <h3>Selected Products</h3>
            </div>
            <div className={styles.products}>
              <div className={styles.productCard}>
                <img src={product.eyeGlassImages[0]?.url} alt={product.name} />
                <div className={styles.productInfo}>
                  <h4>{product.name}</h4>
                  <span className={styles.type}>Frame</span>
                  <span className={styles.price}>{formatPrice(product.price)}</span>
                </div>
              </div>
              <div className={styles.productCard}>
                <img src={lens.lensImages[0]?.url} alt={lens.lensName} />
                <div className={styles.productInfo}>
                  <h4>{lens.lensName}</h4>
                  <span className={styles.type}>Lens</span>
                  <span className={styles.price}>{formatPrice(lens.lensPrice)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Prescription Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Eye size={20} />
              <h3>Prescription Details</h3>
            </div>
            <div className={styles.prescriptionGrid}>
              <div className={styles.prescriptionColumn}>
                <h4>Right Eye (OD)</h4>
                <div className={styles.prescriptionDetails}>
                  <div className={styles.prescriptionValue}>
                    <span>Sphere</span>
                    <strong>{prescriptionData.sphereOD}</strong>
                  </div>
                  <div className={styles.prescriptionValue}>
                    <span>Cylinder</span>
                    <strong>{prescriptionData.cylinderOD}</strong>
                  </div>
                  <div className={styles.prescriptionValue}>
                    <span>Axis</span>
                    <strong>{prescriptionData.axisOD}°</strong>
                  </div>
                </div>
              </div>
              <div className={styles.prescriptionColumn}>
                <h4>Left Eye (OS)</h4>
                <div className={styles.prescriptionDetails}>
                  <div className={styles.prescriptionValue}>
                    <span>Sphere</span>
                    <strong>{prescriptionData.sphereOS}</strong>
                  </div>
                  <div className={styles.prescriptionValue}>
                    <span>Cylinder</span>
                    <strong>{prescriptionData.cylinderOS}</strong>
                  </div>
                  <div className={styles.prescriptionValue}>
                    <span>Axis</span>
                    <strong>{prescriptionData.axisOS}°</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.pdValue}>
              <span>Pupillary Distance (PD)</span>
              <strong>{prescriptionData.pd}mm</strong>
            </div>
          </section>

          {/* Customer Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <User size={20} />
              <h3>Customer Information</h3>
            </div>
            <div className={styles.customerInfo}>
              <div className={styles.infoRow}>
                <span>Full Name</span>
                <strong>{customer.profiles[0]?.fullName}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Phone</span>
                <strong>{customer.phoneNumber}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Email</span>
                <strong>{customer.email}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Address</span>
                <strong>{customer.profiles[0]?.address}</strong>
              </div>
            </div>
          </section>
        </div>

        {/* Checkout Sidebar */}
        <div className={styles.checkoutSidebar}>
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Tag size={20} />
              <h3>Apply Voucher</h3>
            </div>
            <div className={styles.voucherInput}>
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Enter voucher code"
                className={`${voucherError ? styles.error : ''} ${voucherInfo ? styles.success : ''}`}
                disabled={voucherLoading || !!voucherInfo}
              />
              {voucherInfo ? (
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className={styles.removeVoucherBtn}
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className={styles.applyVoucherBtn}
                  disabled={!voucherCode.trim() || voucherLoading}
                >
                  {voucherLoading ? <Loader className={styles.spinner} /> : 'Apply'}
                </button>
              )}
            </div>
            {voucherError && (
              <div className={styles.voucherError}>
                <AlertCircle size={16} />
                {voucherError}
              </div>
            )}
            {voucherInfo && (
              <div className={styles.voucherSuccess}>
                <Check size={16} />
                Voucher applied: {voucherInfo.discountValue}% off
                <span className={styles.voucherQuantity}>
                  ({voucherInfo.quantity} remaining)
                </span>
              </div>
            )}
          </section>

          {/* Deposit Toggle Section */}
          <section className={styles.section}>
            <div className={styles.depositToggle}>
              <div className={styles.depositInfo}>
                <Percent size={20} />
                <div>
                  <h4>Deposit Payment</h4>
                  <p>Pay 30% deposit now, rest upon delivery</p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={isDeposit}
                    onChange={(e) => setIsDeposit(e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </section>
          {/* Payment Method Selection */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Receipt size={20} />
              <h3>Payment Method</h3>
            </div>
            <div className={styles.paymentMethods}>
              <button
                className={`${styles.paymentMethod} ${paymentMethod === 'cash' ? styles.active : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <Wallet size={20} />
                <div className={styles.methodInfo}>
                  <span>Cash Payment</span>
                  <small>Pay at store</small>
                </div>
                {paymentMethod === 'cash' && <Check className={styles.checkIcon} />}
              </button>

              <button
                className={`${styles.paymentMethod} ${paymentMethod === 'vnpay' ? styles.active : ''}`}
                onClick={() => setPaymentMethod('vnpay')}
              >
                <CreditCard size={20} />
                <div className={styles.methodInfo}>
                  <span>VNPay</span>
                  <small>Online payment</small>
                </div>
                {paymentMethod === 'vnpay' && <Check className={styles.checkIcon} />}
              </button>
            </div>
          </section>

          {/* Order Summary Section */}
          <section className={`${styles.section} ${styles.orderSummary}`}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatPrice(calculateSubtotal())}</span>
            </div>
            {voucherInfo && (
              <div className={`${styles.summaryRow} ${styles.discount}`}>
                <span>Voucher Discount</span>
                <span>-{formatPrice(calculateDiscount())}</span>
              </div>
            )}
            {/* <div className={styles.summaryRow}>
              <span>VAT (10%)</span>
              <span>{formatPrice(calculateVAT())}</span>
            </div> */}
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>{isDeposit ? 'Deposit Amount (30%)' : 'Total Amount'}</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
            {isDeposit && (
              <div className={styles.totalNote}>
                Full payment: {formatPrice(calculateTotal() / 0.3)}
              </div>
            )}
          </section>

          {error && (
            <div className={styles.error}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            className={styles.confirmButton}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className={styles.spinner} />
                Processing...
              </>
            ) : (
              `Confirm ${isDeposit ? 'Deposit' : 'Full'} Payment • ${formatPrice(calculateTotal())}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffOrderSummary;