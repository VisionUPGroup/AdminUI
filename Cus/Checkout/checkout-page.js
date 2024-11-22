import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import CartContext from '../../../../../helpers/cart';
import { CurrencyContext } from '../../../../../helpers/Currency/CurrencyContext';
import styles from './checkout.module.scss';
import { MdOutlineLock, MdExpandMore, MdCheck } from 'react-icons/md';
import CardInput from '../Cart/CartHelper/CartInput';
import ShippingInformation from './ShippingInformation';
import { accountService } from '../../../../../Api/accountService'; // Im  port accountService
import { cartService } from '../../../../../Api/cartService'; // Import cartService
import { orderService } from '../../../../../Api/orderService';
import { paymentService } from '../../../../../Api/paymentService';
import CheckoutEnhancements from './CheckoutEnhancements';


const CheckoutSection = ({ title, isOpen, isCompleted, onToggle, children }) => (
  <div className={`${styles.checkoutSection} ${isCompleted ? styles.completed : ''}`}>
    <div className={styles.sectionHeader} onClick={onToggle}>
      <div className={styles.sectionTitle}>
        {isCompleted && <MdCheck className={styles.checkIcon} />}
        <h3>{title}</h3>
      </div>
      <MdExpandMore className={`${styles.expandIcon} ${isOpen ? styles.open : ''}`} />
    </div>
    {isOpen && <div className={styles.sectionContent}>{children}</div>}
  </div>
);

const CheckoutPage = () => {
  const [activeSection, setActiveSection] = useState('customerInfo');
  const [completedSections, setCompletedSections] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingMethod, setShippingMethod] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [isDeposit, setIsDeposit] = useState(true);
  const router = useRouter();
  const { state: { symbol } } = useContext(CurrencyContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      shippingMethod: 'customer',
    }
  });

  useEffect(() => {
    // Lấy các item đã chọn từ localStorage
    const selectedItems = JSON.parse(localStorage.getItem('selectedCartItems') || '[]');
    const selectedTotal = parseFloat(localStorage.getItem('selectedTotalAmount') || '0');

    if (selectedItems.length === 0) {
      // Redirect về trang cart nếu không có item nào được chọn
      router.push('/page/account/cart');
      return;
    }

    setCartItems(selectedItems);
    setTotal(selectedTotal);
  }, [router]);

  // Fetch account info and fill in customer information
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const accountData = await accountService().fetchAccountInfo();
        setValue('firstName', accountData.username.split(' ')[0]);
        setValue('lastName', accountData.username.split(' ')[1] || '');
        setValue('email', accountData.email);
        setValue('phone', accountData.phoneNumber);
        console.log('Account data:', accountData);
      } catch (error) {
        console.log('Error fetching account info:', error);
        console.error('Error fetching account info:', error);
      }
    };
    fetchAccountData();
  }, [setValue]);

  useEffect(() => {
    const fetchKiosksData = async () => {
      try {
        const kioskData = await kioskService().fetchKiosks();
        setKiosks(kioskData);
      } catch (error) {
        console.error('Error fetching kiosks:', error);
      }
    };
    fetchKiosksData();
  }, []);

  // Fetch cart items and fill in order items
  // useEffect(() => {
  //   const fetchCartData = async () => {
  //     try {
  //       const cartData = await cartService().fetchCartByAccountID();
  //       if (cartData) {
  //         setCartItems(cartData.cartDetails);
  //         setTotal(cartData.totalPrice);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching cart data:', error);
  //     }
  //   };
  //   fetchCartData();
  // }, []);



  useEffect(() => {
    const shippingCost = shippingMethod === 'kiosk' ? 0 : 30000;
    setTotal(prevTotal => {
      // Subtract old shipping cost and add new one
      const subtotal = prevTotal - (shippingMethod === 'kiosk' ? 30000 : 0);
      return subtotal + shippingCost;
    });
  }, [shippingMethod]);


  // Handling section completion with validation
  const handleSectionComplete = async (section, nextSection) => {
    let isValid = false;

    switch (section) {
      case 'customerInfo':
        isValid = await trigger(['firstName', 'lastName', 'email', 'phone']);
        break;
      // case 'shippingInfo':
      //   if (shippingMethod === 'customer') {
      //     isValid = await trigger(['address', 'city', 'state', 'zipCode', 'country']);
      //   } else {
      //     isValid = await trigger(['kioskId']);
      //   }
      //   break;
      case 'shippingInfo':
        if (shippingMethod === 'customer') {
          isValid = await trigger([
            'customerAddress',
            'customerCity',
            'customerState',
            'customerZipCode',
            'customerCountry'
          ]);
        } else {
          isValid = await trigger(['kioskId']);
        }
        break;
      case 'payment':
        if (paymentMethod === 'card') {
          isValid = await trigger(['cardNumber', 'expiryDate', 'cvv']);
        } else {
          isValid = true; // For PayPal, we'll handle validation differently
        }
        break;
      default:
        isValid = false;
    }

    if (isValid) {
      if (!completedSections.includes(section)) {
        setCompletedSections([...completedSections, section]);
      }
      setActiveSection(nextSection);
    }
  };

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const orderData = {
        receiverAddress: shippingMethod === 'customer'
          ? `${data.address}, ${data.city}, ${data.state}, ${data.zipCode}, ${data.country}`
          : undefined,
        kioskID: shippingMethod === 'kiosk' ? parseInt(data.kioskId) : undefined,
        voucherID: voucherInfo?.id,
        isDeposit: isDeposit,
        listProductGlassID: cartItems.map(item => item.productGlassID)
      };

      console.log('Order data:', orderData);
      const createdOrder = await orderService().createOrder(orderData);

      if (createdOrder) {
        const paymentData = {
          amount: isDeposit ? calculateTotal() : calculateTotal() / 0.3,
          accountID: createdOrder.accountID,
          orderID: createdOrder.id
        };
        console.log('Payment data:', paymentData);

        const paymentResponse = await paymentService().createPaymentUrl(paymentData);

        if (paymentResponse && paymentResponse.paymentUrl) {
          // Xóa dữ liệu selected items sau khi tạo order thành công
          localStorage.removeItem('selectedCartItems');
          localStorage.removeItem('selectedTotalAmount');
          console.log('Payment URL:', paymentResponse.paymentUrl);

          window.location.href = paymentResponse.paymentUrl;
        } else {
          throw new Error('Failed to create payment URL');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing payment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    // Reset payment related fields when changing methods
    if (method === 'paypal') {
      setValue('cardNumber', '');
      setValue('expiryDate', '');
      setValue('cvv', '');
    }
  };

  const handleVoucherApplied = (voucher) => {
    setVoucherInfo(voucher);
  };

  const handleDepositChange = (isDepositEnabled) => {
    setIsDeposit(isDepositEnabled);
  };

  const calculateDiscount = () => {
    if (!voucherInfo || !voucherInfo.discountValue) return 0;
    const discountAmount = (subtotal * voucherInfo.discountValue) / 100;
    return Math.min(discountAmount, subtotal);
  };

  const calculateTotal = () => {
    const discount = calculateDiscount();
    const totalBeforeDeposit = Math.max(subtotal + shippingCost - discount, 0);
    return isDeposit ? totalBeforeDeposit * 0.3 : totalBeforeDeposit;
  };

  // Calculate totals
  const shippingCost = shippingMethod === 'kiosk' ? 0 : 30000; // Free for kiosk pickup
  const subtotal = total;
  const tax = 0;
  const totalAmount = subtotal + shippingCost + tax;

  return (
    <div className={styles.checkoutPage}>
      <Container>
        <div className={styles.header}>
          <h1>Checkout</h1>
          <div className={styles.steps}>
            <span className={styles.stepCompleted}>Cart</span>
            <span className={styles.stepActive}>Payment</span>
            <span>Confirmation</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md="8">
              <div className={styles.bookingStatus}>
                <div className={styles.statusIcon}>
                  <MdOutlineLock size={20} />
                </div>
                <div className={styles.statusText}>
                  <h3>Your Booking is on Hold</h3>
                  <p>We hold your booking until {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, 23:59 PM. If your reserve change, we will get back to you.</p>
                </div>
              </div>

              {/* Customer Information Section */}
              <CheckoutSection
                title="1. Customer Information"
                isOpen={activeSection === 'customerInfo'}
                isCompleted={completedSections.includes('customerInfo')}
                onToggle={() => setActiveSection(activeSection === 'customerInfo' ? '' : 'customerInfo')}
              >
                <Row>
                  <Col md="6">
                    <div className={styles.formGroup}>
                      <label>First Name *</label>
                      <input
                        type="text"
                        {...register('firstName', { required: 'First name is required' })}
                        className={errors.firstName ? styles.error : ''}
                      />
                      {errors.firstName && <span className={styles.errorMessage}>{errors.firstName.message}</span>}
                    </div>
                  </Col>
                  <Col md="6">
                    <div className={styles.formGroup}>
                      <label>Last Name *</label>
                      <input
                        type="text"
                        {...register('lastName', { required: 'Last name is required' })}
                        className={errors.lastName ? styles.error : ''}
                      />
                      {errors.lastName && <span className={styles.errorMessage}>{errors.lastName.message}</span>}
                    </div>
                  </Col>
                  <Col md="6">
                    <div className={styles.formGroup}>
                      <label>Email Address *</label>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className={errors.email ? styles.error : ''}
                      />
                      {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
                    </div>
                  </Col>
                  <Col md="6">
                    <div className={styles.formGroup}>
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        {...register('phone', {
                          required: 'Phone number is required',
                          pattern: {
                            value: /^[0-9+\-\s()]+$/,
                            message: 'Invalid phone number'
                          }
                        })}
                        className={errors.phone ? styles.error : ''}
                      />
                      {errors.phone && <span className={styles.errorMessage}>{errors.phone.message}</span>}
                    </div>
                  </Col>
                </Row>
                <div className={styles.sectionActions}>
                  <button
                    type="button"
                    className={styles.continueBtn}
                    onClick={() => handleSectionComplete('customerInfo', 'shippingInfo')}
                  >
                    Continue to Shipping
                  </button>
                </div>
              </CheckoutSection>

              {/* Shipping Information Section */}
              <CheckoutSection
                title="2. Shipping Information"
                isOpen={activeSection === 'shippingInfo'}
                isCompleted={completedSections.includes('shippingInfo')}
                onToggle={() => setActiveSection(activeSection === 'shippingInfo' ? '' : 'shippingInfo')}
              >
                <ShippingInformation
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  shippingMethod={shippingMethod}
                  setShippingMethod={setShippingMethod}
                />
                <div className={styles.sectionActions}>
                  <button
                    type="button"
                    className={styles.continueBtn}
                    onClick={() => handleSectionComplete('shippingInfo', 'payment')}
                  >
                    Continue to Payment
                  </button>
                </div>
              </CheckoutSection>


              {/* Payment Section */}
              <CheckoutSection
                title="3. Payment Method"
                isOpen={activeSection === 'payment'}
                isCompleted={completedSections.includes('payment')}
                onToggle={() => setActiveSection(activeSection === 'payment' ? '' : 'payment')}
              >
                <div className={styles.paymentMethods}>
                  <div
                    className={`${styles.paymentMethod} ${paymentMethod === 'card' ? styles.active : ''}`}
                    onClick={() => handlePaymentMethodChange('card')}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => handlePaymentMethodChange('card')}
                    />
                    <div className={styles.methodDetails}>
                      <span>Credit/Debit Card</span>
                      <small>Pay securely with your card</small>
                    </div>
                  </div>

                  <div
                    className={`${styles.paymentMethod} ${paymentMethod === 'paypal' ? styles.active : ''}`}
                    onClick={() => handlePaymentMethodChange('paypal')}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => handlePaymentMethodChange('paypal')}
                    />
                    <div className={styles.methodDetails}>
                      <span>VNPAY</span>
                      <small>Safe payment with VNPAY</small>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className={styles.cardDetails}>
                    <Row>
                      <Col md="12">
                        <CardInput register={register} errors={errors} />
                      </Col>
                      <Col md="6">
                        <div className={styles.formGroup}>
                          <label>Expiration Date *</label>
                          <input
                            type="text"
                            {...register('expiryDate', {
                              required: 'Expiry date is required',
                              pattern: {
                                value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                                message: 'Invalid expiry date (MM/YY)'
                              }
                            })}
                            placeholder="MM/YY"
                            className={errors.expiryDate ? styles.error : ''}
                          />
                          {errors.expiryDate && <span className={styles.errorMessage}>{errors.expiryDate.message}</span>}
                        </div>
                      </Col>
                      <Col md="6">
                        <div className={styles.formGroup}>
                          <label>CVV *</label>
                          <input
                            type="text"
                            {...register('cvv', {
                              required: 'CVV is required',
                              pattern: {
                                value: /^[0-9]{3,4}$/,
                                message: 'Invalid CVV'
                              }
                            })}
                            placeholder="123"
                            className={errors.cvv ? styles.error : ''}
                          />
                          {errors.cvv && <span className={styles.errorMessage}>{errors.cvv.message}</span>}
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </CheckoutSection>
              <CheckoutEnhancements
                onVoucherApplied={handleVoucherApplied}
                onDepositChange={handleDepositChange}
                subTotal={subtotal}
                shippingCost={shippingCost}
              />
            </Col>

            <Col md="4">
              <div className={styles.summary}>
                <div className={styles.summaryDetails}>
                  <div className={styles.summaryRow}>
                    <span>Order Price</span>
                    <span>{total.toLocaleString()} VND</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Shipping Fee</span>
                    <span>
                      {shippingMethod === 'kiosk' ? 'Free' : '30,000 VND'}
                    </span>
                  </div>
                  {voucherInfo && (
                    <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                      <span>Voucher Discount ({voucherInfo.discountValue}%)</span>
                      <span className={styles.discount}>
                        -{calculateDiscount().toLocaleString()} VND
                      </span>
                    </div>
                  )}
                  <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>Total Amount</span>
                    <span>
                      {calculateTotal().toLocaleString()} VND
                      {isDeposit && (
                        <span className={styles.totalNote}>
                          Full price: {(calculateTotal() / 0.3).toLocaleString()} VND
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className={styles.termsCheckbox}>
                  <input
                    type="checkbox"
                    {...register('terms', { required: 'You must accept the terms' })}
                  />
                  <label>
                    By clicking this, I agree to Terms & Conditions and Privacy Policy
                  </label>
                  {errors.terms && <span className={styles.errorMessage}>{errors.terms.message}</span>}
                </div>

                <button
                  type="submit"
                  className={`${styles.payButton} ${loading ? styles.loading : ''}`}
                  disabled={loading}
                >
                  <MdOutlineLock size={20} />
                  {loading ? 'Processing...' : `Pay ${isDeposit ? 'Deposit' : 'Full Amount'} (${calculateTotal().toLocaleString()} VND)`}
                </button>

                <div className={styles.securePayment}>
                  <MdOutlineLock size={16} />
                  <span>Secure Payment by Stripe</span>
                </div>

                <div className={styles.orderNotes}>
                  <h3>Order Notes (Optional)</h3>
                  <textarea
                    {...register('orderNotes')}
                    placeholder="Notes about your order, e.g. special instructions for delivery"
                    className={styles.notesTextarea}
                  />
                </div>

                {/* Order Items Section */}
                <div className={styles.orderItems}>
                  <h3>Selected Items ({cartItems.length})</h3>
                  {cartItems.map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <div className={styles.itemImage}>
                        <img src={item.eyeGlassImages[0].url} alt={item.eyeGlassName} />
                      </div>
                      <div className={styles.itemDetails}>
                        <h4>{item.eyeGlassName}</h4>
                        <p className={styles.variant}>
                          {item.lensName}
                          {item.quantity && <span className={styles.quantity}>x{item.quantity}</span>}
                        </p>
                        <div className={styles.priceQuantity}>
                          <span className={styles.itemPrice}>
                            {(item.eyeGlassPrice + (item.lensPrice * 2)).toLocaleString()} VND
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Method Summary */}
                <div className={styles.shippingSummary}>
                  <h3>Shipping Method</h3>
                  <div className={styles.selectedMethod}>
                    {shippingMethod === 'kiosk' ? (
                      <>
                        <span className={styles.methodName}>Kiosk Pickup</span>
                        <span className={styles.methodPrice}>Free</span>
                      </>
                    ) : (
                      <>
                        <span className={styles.methodName}>Home Delivery</span>
                        <span className={styles.methodPrice}>30.000 VND</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className={styles.estimatedDelivery}>
                  <h3>Estimated Delivery</h3>
                  <div className={styles.deliveryDate}>
                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </form>

        {/* Loading Overlay */}
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default CheckoutPage;