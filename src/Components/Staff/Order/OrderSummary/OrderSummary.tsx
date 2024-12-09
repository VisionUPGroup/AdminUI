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
  Loader,
  Truck,
  Clock,
  Lock,
  Building
} from 'lucide-react';
import { useVoucherService } from '../../../../../Api/voucherService';
import { CartItem } from '../context/CartContext';
import ShippingInformation from './ShippingInformation';
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

interface OrderSummaryProps {
  cartItems: CartItem[];
  customer: Customer;
  onBack: () => void;
  onCreateOrder: (method: 'cash' | 'vnpay', orderData: OrderData) => Promise<void>;
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
  // Payment & Voucher States
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vnpay'>('cash');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherInfo, setVoucherInfo] = useState<VoucherInfo | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isDeposit, setIsDeposit] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shipping States
  const [shippingMethod, setShippingMethod] = useState<'customer' | 'kiosk'>('customer');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [selectedKioskId, setSelectedKioskId] = useState<number | null>(null);

  const { fetchVoucherByCode } = useVoucherService();

  // Calculation Functions
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = (
        item.eyeGlass.price +
        item.leftLens.lensPrice +
        item.rightLens.lensPrice
      ) * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const calculateDiscount = () => {
    if (!voucherInfo || !voucherInfo.discountValue) return 0;
    const discountAmount = (calculateSubtotal() * voucherInfo.discountValue) / 100;
    return Math.min(discountAmount, calculateSubtotal());
  };

  const calculateAmountAfterDiscount = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const calculateShippingCost = () => {
    return shippingMethod === 'kiosk' ? 0 : 30000;
  };

  const calculateDepositAmount = () => {
    const amountAfterDiscount = calculateAmountAfterDiscount();
    return isDeposit ? Math.round(amountAfterDiscount * 0.3) : amountAfterDiscount;
  };

  const calculateFinalAmount = () => {
    const depositAmount = calculateDepositAmount();
    const shipping = calculateShippingCost();
    return depositAmount + shipping;
  };

  const calculateRemainingPayment = () => {
    if (!isDeposit) return 0;
    return calculateAmountAfterDiscount() * 0.7;
  };

  // Voucher Handlers
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
        if (voucherData.quantity === 0) {
          setVoucherError('This voucher has been fully redeemed');
          return;
        }

        if (!voucherData.status) {
          setVoucherError('This voucher is no longer active');
          return;
        }

        const mappedVoucher = {
          id: voucherData.id,
          name: voucherData.name,
          code: voucherData.code,
          discountType: 'PERCENTAGE',
          discountValue: voucherData.sale,
          status: voucherData.status,
          quantity: voucherData.quantity
        };

        setVoucherInfo(mappedVoucher);
        onVoucherSelect(mappedVoucher);
      } else {
        setVoucherError('Invalid voucher code');
      }
    } catch (error: any) {
      setVoucherError(error.message || 'Could not apply voucher');
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

  // Order Submission
  const handleSubmit = async () => {
    try {
      setError(null);

      // Validate required fields
      if (shippingMethod === 'customer' && !shippingAddress) {
        throw new Error('Please complete shipping address');
      }

      if (shippingMethod === 'kiosk' && !selectedKioskId) {
        throw new Error('Please select a kiosk');
      }

      if (!paymentMethod) {
        throw new Error('Please select a payment method');
      }

      const orderData: OrderData = {
        accountID: customer.id,
        receiverAddress: shippingMethod === 'customer' ? shippingAddress : undefined,
        kioskID: shippingMethod === 'kiosk' ? (selectedKioskId ?? undefined) : undefined,
        voucherID: voucherInfo?.id,
        isDeposit,
        shippingMethod,
        paymentMethod,
        totalAmount: calculateAmountAfterDiscount(),
        depositAmount: isDeposit ? calculateDepositAmount() : undefined,
        remainingAmount: isDeposit ? calculateRemainingPayment() : undefined,
        shippingCost: calculateShippingCost()
      };

      // Log for debugging
      console.log('Sending order data:', {
        orderData,
        customer,
        cartItems,
        voucherInfo,
        shippingMethod,
        paymentMethod
      });

      await onCreateOrder(paymentMethod, orderData);

    } catch (err: any) {
      console.error('Order creation error:', err);
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
            <div className={styles.productsWrapper}>
              <div className={styles.products}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.productCard}>
                    <img src={item.eyeGlass.eyeGlassImages[0]?.url} alt={item.eyeGlass.name} />
                    <div className={styles.productInfo}>
                      {/* Frame Information */}
                      <div className={styles.frameInfo}>
                        <h4>{item.eyeGlass.name}</h4>
                        <span className={styles.price}>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(item.eyeGlass.price)}
                        </span>
                      </div>

                      {/* Lens Information */}
                      <div className={styles.lensDetails}>
                        {/* Left Lens */}
                        <div className={styles.lensItem}>
                          <div className={styles.lensHeader}>
                            <span className={styles.lensTitle}>Left Lens</span>
                            <span className={styles.lensPrice}>
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(item.leftLens.lensPrice)}
                            </span>
                          </div>
                          <span className={styles.lensName}>{item.leftLens.lensName}</span>
                        </div>

                        {/* Right Lens */}
                        <div className={styles.lensItem}>
                          <div className={styles.lensHeader}>
                            <span className={styles.lensTitle}>Right Lens</span>
                            <span className={styles.lensPrice}>
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(item.rightLens.lensPrice)}
                            </span>
                          </div>
                          <span className={styles.lensName}>{item.rightLens.lensName}</span>
                        </div>
                      </div>

                      {/* Prescription Details */}
                      <div className={styles.prescriptionDetails}>
                        <div className={styles.prescriptionRow}>
                          <div className={styles.prescriptionValue}>
                            <span>Right Eye (OD)</span>
                            <small>SPH: {item.prescriptionData.sphereOD}, CYL: {item.prescriptionData.cylinderOD}, AXIS: {item.prescriptionData.axisOD}°</small>
                          </div>
                          <div className={styles.prescriptionValue}>
                            <span>Left Eye (OS)</span>
                            <small>SPH: {item.prescriptionData.sphereOS}, CYL: {item.prescriptionData.cylinderOS}, AXIS: {item.prescriptionData.axisOS}°</small>
                          </div>
                        </div>
                        <div className={styles.prescriptionFooter}>
                          <span>PD: {item.prescriptionData.pd}mm</span>
                          <span>Quantity: {item.quantity}</span>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className={styles.totalPrice}>
                        <span>Total:</span>
                        <span className={styles.amount}>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format((item.eyeGlass.price + item.leftLens.lensPrice + item.rightLens.lensPrice) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Customer Information */}
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
                <strong className={customer.status ? styles.activeStatus : styles.inactiveStatus}>
                  {customer.status ? 'Active' : 'Inactive'}
                </strong>
              </div>
            </div>
          </section>

          {/* Shipping Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Truck size={20} />
              <h3>Shipping Information</h3>
            </div>
            <ShippingInformation
              selectedMethod={shippingMethod}
              onMethodSelect={setShippingMethod}
              onAddressSelect={setShippingAddress}
              onKioskSelect={setSelectedKioskId}
            />
          </section>
        </div>

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

          {/* Payment Methods */}
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

          {/* Order Summary */}
          <section className={`${styles.section} ${styles.orderSummary}`}>
            {/* Subtotal */}
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(calculateSubtotal())}</span>
            </div>

            {/* Voucher Discount if applicable */}
            {voucherInfo && (
              <div className={`${styles.summaryRow} ${styles.discount}`}>
                <span>Voucher Discount ({voucherInfo.discountValue}%)</span>
                <span>-{new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(calculateDiscount())}</span>
              </div>
            )}

            {/* Amount after discount */}
            <div className={`${styles.summaryRow} ${styles.subtotalRow}`}>
              <span>Amount After Discount</span>
              <span>{new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(calculateAmountAfterDiscount())}</span>
            </div>

            {/* Deposit Amount if selected */}
            {isDeposit && (
              <div className={styles.summaryRow}>
                <span>Deposit Amount (30%)</span>
                <span>{new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(calculateDepositAmount())}</span>
              </div>
            )}

            {/* Shipping Fee */}
            <div className={styles.summaryRow}>
              <span>Shipping Fee</span>
              <span>
                {shippingMethod === 'kiosk' ? 'Free' : new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(calculateShippingCost())}
              </span>
            </div>

            {/* Final Total */}
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total Amount</span>
              <span>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(calculateFinalAmount())}
                {isDeposit && (
                  <span className={styles.totalNote}>
                    Remaining: {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(calculateRemainingPayment())}
                  </span>
                )}
              </span>
            </div>
          </section>

          {/* Additional Information */}
          <section className={`${styles.section} ${styles.additionalInfo}`}>
            <div className={styles.deliveryEstimate}>
              <Clock size={16} />
              <span>Estimated delivery: 5-7 business days</span>
            </div>

            <div className={styles.storeInfo}>
              <Building size={16} />
              <span>Store: Vision Store - District 1</span>
            </div>
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
              `Confirm ${isDeposit ? 'Deposit' : 'Full'} Payment • ${new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(calculateFinalAmount())
              }`
            )}
          </button>

          <div className={styles.securePayment}>
            <Lock size={16} />
            <span>Secure Payment by VNPAY</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;