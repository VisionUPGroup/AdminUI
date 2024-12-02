import React, { useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Check,
  ShoppingBag,
  User,
  Receipt,
  Tag,
  AlertCircle,
  Percent,
  Loader
} from 'lucide-react';
import { useVoucherService } from '../../../../../Api/voucherService';
import { CartItem } from '../context/CartContext';
import styles from '../styles/OrderSummary.module.scss';

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

interface OrderSummaryProps {
  cartItems: CartItem[];
  customer: Customer;
  onBack: () => void;
  onCreateOrder: (method: 'cash' | 'vnpay') => Promise<void>;
  loading: boolean;
  onVoucherSelect: (voucher: VoucherInfo | null) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  customer,
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

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = (item.eyeGlass.price + item.leftLens.lensPrice + item.rightLens.lensPrice) * item.quantity;
      return total + itemTotal;
    }, 0);
  };

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
      if (voucherData) {
        const voucher = voucherData;
        
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

  return (
    <div className={styles.staffOrderSummary}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h2>Order Summary</h2>
      </div>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          {/* Products Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <ShoppingBag size={20} />
              <h3>Items ({cartItems.length})</h3>
            </div>
            <div className={styles.products}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.productCard}>
                  <img src={item.eyeGlass.eyeGlassImages[0]?.url} alt={item.eyeGlass.name} />
                  <div className={styles.productInfo}>
                    <h4>{item.eyeGlass.name}</h4>
                    <div className={styles.lensInfo}>
                      <span>Lens: {item.leftLens.lensName}</span>
                      <div className={styles.prescriptionDetails}>
                        <div className={styles.prescriptionValue}>
                          <span>Right Eye</span>
                          <small>SPH: {item.prescriptionData.sphereOD}, CYL: {item.prescriptionData.cylinderOD}, AXIS: {item.prescriptionData.axisOD}°</small>
                        </div>
                        <div className={styles.prescriptionValue}>
                          <span>Left Eye</span>
                          <small>SPH: {item.prescriptionData.sphereOS}, CYL: {item.prescriptionData.cylinderOS}, AXIS: {item.prescriptionData.axisOS}°</small>
                        </div>
                        <div className={styles.prescriptionValue}>
                          <span>PD: {item.prescriptionData.pd}mm</span>
                          <span>Quantity: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.price}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                        .format((item.eyeGlass.price + item.leftLens.lensPrice) * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
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
                <span>Username</span>
                <strong>{customer.username}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Phone</span>
                <strong>{customer.phoneNumber || 'Not provided'}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Email</span>
                <strong>{customer.email}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Status</span>
                <strong>{customer.status ? 'Active' : 'Inactive'}</strong>
              </div>
            </div>
          </section>
        </div>

        {/* Checkout Sidebar */}
        <div className={styles.checkoutSidebar}>
          {/* Voucher Section */}
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

          {/* Deposit Toggle */}
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
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                .format(calculateSubtotal())}</span>
            </div>

            {voucherInfo && (
              <div className={`${styles.summaryRow} ${styles.discount}`}>
                <span>Voucher Discount</span>
                <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                  .format(calculateDiscount())}</span>
              </div>
            )}

            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>{isDeposit ? 'Deposit Amount (30%)' : 'Total Amount'}</span>
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                .format(calculateTotal())}</span>
            </div>

            {isDeposit && (
              <div className={styles.totalNote}>
                Full payment: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                  .format(calculateTotal() / 0.3)}
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
              `Confirm ${isDeposit ? 'Deposit' : 'Full'} Payment • ${
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                  .format(calculateTotal())
              }`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;