import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MdClose, MdLocalShipping, MdStorefront, MdShoppingBag, MdLocationOn, MdCheck, MdError, MdLocalOffer, MdPayment } from 'react-icons/md';
import styles from './styles/OrderNowModal.module.scss';
import { voucherService } from '../../../../../../Api/voucherService';

const OrderNowModal = ({
  isOpen,
  onClose,
  onSubmit,
  data,
  loading,
  kiosks = [] // Thêm prop kiosks với default là array rỗng
}) => {
  const [shippingMethod, setShippingMethod] = useState('customer');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState(null);
  const [isDeposit, setIsDeposit] = useState(true);
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();


  // Reset form khi modal đóng/mở
  useEffect(() => {
    if (isOpen) {
      reset();
      setShippingMethod('customer');
      setVoucherCode('');
      setVoucherInfo(null);
      setVoucherError(null);
      setIsDeposit(true);
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (formData) => {

    if (!data || !data.lensData) {
      console.error('Missing lens data');
      return;
    }

    const orderDetails = {
      quantity: 1,
      productGlassRequest: {
        eyeGlassID: data?.eyeGlassID || 0,
        leftLenID: data?.lensData?.id || 0,
        rightLenID: data?.lensData?.id || 0,
        accountID: 0,
        sphereOD: data.sphereOD || 0,
        cylinderOD: data.cylinderOD || 0,
        axisOD: data.axisOD || 0,
        sphereOS: data.sphereOS || 0,
        cylinderOS: data.cylinderOS || 0,
        axisOS: data.axisOS || 0,
        addOD: data.addOD || 0,
        addOS: data.addOS || 0,
        pd: data.pd || 0
      }
    };

    const orderData = {
      receiverAddress: shippingMethod === 'customer'
        ? `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}`
        : undefined,
      orderDate: new Date().toISOString(),
      kioskID: shippingMethod === 'kiosk' ? parseInt(formData.kioskId) : undefined,
      voucherID: voucherInfo?.id || undefined,
      isDeposit: isDeposit,
      orderDetails: [orderDetails]
    };

    onSubmit(orderData);
  };


  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Please enter a voucher code');
      return;
    }

    setVoucherLoading(true);
    setVoucherError(null);

    try {
      const voucherData = await voucherService().getVoucherByCode(voucherCode);
      if (voucherData && voucherData.length > 0) {
        // Lấy voucher đầu tiên từ mảng response
        const voucher = voucherData[0];
        // Map lại cấu trúc voucher để phù hợp với logic hiện tại
        const mappedVoucher = {
          id: voucher.id,
          name: voucher.name,
          code: voucher.code,
          discountType: 'PERCENTAGE',  // API trả về sale là phần trăm
          discountValue: voucher.sale, // Sử dụng giá trị sale từ API
          status: voucher.status
        };

        if (!mappedVoucher.status) {
          setVoucherError('This voucher is no longer active');
          setVoucherInfo(null);
          return;
        }

        setVoucherInfo(mappedVoucher);
        setValue('voucherId', mappedVoucher.id);
      } else {
        setVoucherError('Invalid voucher code or voucher not found');
        setVoucherInfo(null);
      }
    } catch (error) {
      // Xử lý các loại lỗi cụ thể
      if (error.response) {
        // Nếu server trả về response với status code lỗi
        switch (error.response.status) {
          case 404:
            setVoucherError('Voucher not found');
            break;
          case 400:
            setVoucherError('Invalid voucher code');
            break;
          case 401:
            setVoucherError('Please login to use this voucher');
            break;
          case 403:
            setVoucherError('You are not eligible to use this voucher');
            break;
          case 410:
            setVoucherError('This voucher has expired');
            break;
          default:
            setVoucherError('Could not verify voucher. Please try again');
        }
      } else if (error.request) {
        // Lỗi không nhận được response
        setVoucherError('Cannot connect to server. Please check your connection');
      } else {
        // Các lỗi khác
        setVoucherError('Could not apply voucher. Please try again');
      }

      setVoucherInfo(null);
      setValue('voucherId', '');
    } finally {
      setVoucherLoading(false);
    }
  };
  const shippingCost = shippingMethod === 'kiosk' ? 0 : 30000;
  const subtotal = data.price + (data.lensData?.lensPrice || 0);
  const total = subtotal + shippingCost;

  const calculateDiscount = () => {
    if (!voucherInfo || !voucherInfo.discountValue) return 0;

    // Tính giảm giá dựa trên phần trăm
    const discountAmount = (subtotal * voucherInfo.discountValue) / 100;
    return Math.min(discountAmount, subtotal); // Đảm bảo giảm giá không vượt quá tổng tiền
  };

  // Tính toán giá với voucher
  const calculateTotal = () => {
    const discount = calculateDiscount();
    const totalBeforeDeposit = Math.max(subtotal + shippingCost - discount, 0);
    return isDeposit ? totalBeforeDeposit * 0.3 : totalBeforeDeposit;
  };

  const formatNumber = (number) => {
    return typeof number === 'number' ? number.toLocaleString() : '0';
  };

  const displayVoucherValue = (voucher) => {
    if (!voucher || typeof voucher.discountValue === 'undefined') return '0';
    return `${voucher.discountValue}%`;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Quick Order</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <MdClose />
          </button>
        </div>

        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Shipping Methods */}
            <div className={styles.shippingMethods}>
              <h3>Select Shipping Method</h3>
              <div className={styles.methodsContainer}>
                <div className={`${styles.methodOption} ${shippingMethod === 'customer' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    id="delivery"
                    value="customer"
                    checked={shippingMethod === 'customer'}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  />
                  <label htmlFor="delivery" className={styles.methodContent}>
                    <span className={styles.checkmark}></span>
                    <div className={styles.methodInfo}>
                      <div className={styles.methodTitle}>
                        <MdLocalShipping /> Home Delivery
                      </div>
                      <div className={styles.methodDescription}>
                        Delivered right to your doorstep (30,000 VND)
                      </div>
                    </div>
                  </label>
                </div>

                <div className={`${styles.methodOption} ${shippingMethod === 'kiosk' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    id="kiosk"
                    value="kiosk"
                    checked={shippingMethod === 'kiosk'}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  />
                  <label htmlFor="kiosk" className={styles.methodContent}>
                    <span className={styles.checkmark}></span>
                    <div className={styles.methodInfo}>
                      <div className={styles.methodTitle}>
                        <MdStorefront /> Kiosk Pickup
                      </div>
                      <div className={styles.methodDescription}>
                        Pick up from our nearest kiosk (Free)
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className={styles.formSection}>
              {shippingMethod === 'customer' ? (
                <div className={styles.formGrid}>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Shipping Address</label>
                    <input
                      type="text"
                      {...register('address', { required: 'Address is required' })}
                      className={errors.address ? styles.error : ''}
                      placeholder="Enter your delivery address"
                    />
                    {errors.address && <span className={styles.errorMessage}>{errors.address.message}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>City</label>
                    <input
                      type="text"
                      {...register('city', { required: 'City is required' })}
                      className={errors.city ? styles.error : ''}
                      placeholder="Enter city"
                    />
                    {errors.city && <span className={styles.errorMessage}>{errors.city.message}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>State/Province</label>
                    <input
                      type="text"
                      {...register('state', { required: 'State is required' })}
                      className={errors.state ? styles.error : ''}
                      placeholder="Enter state/province"
                    />
                    {errors.state && <span className={styles.errorMessage}>{errors.state.message}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>ZIP Code</label>
                    <input
                      type="text"
                      {...register('zipCode', { required: 'ZIP code is required' })}
                      className={errors.zipCode ? styles.error : ''}
                      placeholder="Enter ZIP code"
                    />
                    {errors.zipCode && <span className={styles.errorMessage}>{errors.zipCode.message}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
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
                      placeholder="Enter phone number"
                    />
                    {errors.phone && <span className={styles.errorMessage}>{errors.phone.message}</span>}
                  </div>
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label>Select Kiosk Location</label>
                  <select
                    {...register('kioskId', { required: 'Please select a kiosk' })}
                    className={errors.kioskId ? styles.error : ''}
                  >
                    <option value="">Choose a kiosk...</option>
                    {kiosks.map(kiosk => (
                      <option key={kiosk.id} value={kiosk.id}>
                        {kiosk.name} - {kiosk.address}
                      </option>
                    ))}
                  </select>
                  {errors.kioskId && <span className={styles.errorMessage}>{errors.kioskId.message}</span>}
                </div>
              )}


              {/* Voucher Section */}
              <div className={styles.formGroup}>
                <label>Voucher Code</label>
                <div className={styles.voucherInput}>
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Enter voucher code"
                    className={`${voucherError ? styles.error : ''} ${voucherInfo ? styles.success : ''}`}
                    disabled={voucherLoading || voucherInfo}
                  />
                  {voucherInfo ? (
                    <button
                      type="button"
                      onClick={() => {
                        setVoucherInfo(null);
                        setVoucherCode('');
                        setValue('voucherId', '');
                        setVoucherError(null);
                      }}
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
                      {voucherLoading ? (
                        <span className={styles.spinner} />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  )}
                </div>
                {voucherError && (
                  <div className={styles.voucherError}>
                    <MdError /> {voucherError}
                  </div>
                )}
                {voucherInfo && (
                  <div className={styles.voucherSuccess}>
                    <MdCheck /> Voucher applied: {displayVoucherValue(voucherInfo)} off
                  </div>
                )}
              </div>
            </div>

            <div className={styles.depositSection}>
              <div className={styles.depositToggle}>
                <div className={styles.depositInfo}>
                  <MdPayment className={styles.depositIcon} />
                  <div>
                    <h4>Deposit Payment</h4>
                    <p>Pay 30% deposit now, rest upon delivery</p>
                  </div>
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

            {/* Order Summary */}
            <div className={styles.orderSummary}>
              <h3>Order Summary</h3>
              {/* Product Info */}
              <div className={styles.summaryRow}>
                <span className={styles.label}>
                  <MdShoppingBag /> Product
                </span>
                <span className={styles.value}>{data.name}</span>
              </div>

              {/* Product Price */}
              <div className={styles.summaryRow}>
                <span className={styles.label}>Product Price</span>
                <span className={styles.value}>{data.price.toLocaleString()} VND</span>
              </div>

              {/* Lens Info */}
              <div className={styles.summaryRow}>
                <span className={styles.label}>Selected Lens</span>
                <span className={styles.value}>{data.lensData?.lensName}</span>
              </div>

              {/* Lens Price */}
              <div className={styles.summaryRow}>
                <span className={styles.label}>Lens Price</span>
                <span className={styles.value}>{(data.lensData?.lensPrice || 0).toLocaleString()} VND</span>
              </div>

              {/* Shipping Fee */}
              <div className={styles.summaryRow}>
                <span className={styles.label}>
                  <MdLocationOn /> Shipping Fee
                </span>
                <span className={styles.value}>
                  {shippingMethod === 'kiosk' ? 'Free' : '30,000 VND'}
                </span>
              </div>

              {/* Voucher Discount - Chỉ hiển thị khi có voucher */}
              {voucherInfo && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span className={styles.label}>
                    <MdLocalOffer /> Voucher Discount
                  </span>
                  <span className={`${styles.value} ${styles.discount}`}>
                    -{displayVoucherValue(voucherInfo)}
                  </span>
                </div>
              )}

              {/* Subtotal before discount */}
              <div className={styles.summaryRow}>
                <span className={styles.label}>Subtotal</span>
                <span className={styles.value}>{(subtotal + shippingCost).toLocaleString()} VND</span>
              </div>

              {/* Total after discount */}
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span className={styles.label}>Total Amount</span>
                <span className={styles.value}>{calculateTotal().toLocaleString()} VND</span>
              </div>
            </div>

            {isDeposit && (
              <div className={`${styles.summaryRow} ${styles.depositInfo}`}>
                <span className={styles.label}>
                  <MdPayment /> Deposit Amount (30%)
                </span>
                <span className={styles.value}>
                  {formatNumber(calculateTotal())} VND
                </span>
              </div>
            )}
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span className={styles.label}>
                {isDeposit ? 'Deposit Payment' : 'Full Payment'}
              </span>
              <span className={styles.value}>
                {formatNumber(calculateTotal())} VND
                {isDeposit && (
                  <small className={styles.totalNote}>
                    (Total order: {formatNumber(calculateTotal() / 0.3)} VND)
                  </small>
                )}
              </span>
            </div>


            {/* Action Buttons */}
            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Processing...
                  </>
                ) : (
                  <>
                    {isDeposit ? 'Pay Deposit' : 'Pay Full Amount'} ({formatNumber(calculateTotal())} VND)
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderNowModal;