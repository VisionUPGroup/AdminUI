import React, { useState } from 'react';
import { Row, Col } from 'reactstrap';
import { MdLocalOffer, MdPayment, MdCheck, MdError } from 'react-icons/md';
import { voucherService } from '../../../../../Api/voucherService';
import styles from './checkout.module.scss';

const CheckoutEnhancements = ({ 
  onVoucherApplied,
  onDepositChange,
  subTotal = 0,
  shippingCost = 0 
}) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState(null);
  const [isDeposit, setIsDeposit] = useState(true);

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
        const voucher = voucherData[0];
        const mappedVoucher = {
          id: voucher.id,
          name: voucher.name,
          code: voucher.code,
          discountType: 'PERCENTAGE',
          discountValue: voucher.sale,
          status: voucher.status
        };

        if (!mappedVoucher.status) {
          setVoucherError('This voucher is no longer active');
          setVoucherInfo(null);
          return;
        }

        setVoucherInfo(mappedVoucher);
        onVoucherApplied(mappedVoucher); // Thông báo lên component cha
      } else {
        setVoucherError('Invalid voucher code or voucher not found');
        setVoucherInfo(null);
        onVoucherApplied(null);
      }
    } catch (error) {
      // Xử lý các loại lỗi cụ thể
      if (error.response) {
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
        setVoucherError('Cannot connect to server. Please check your connection');
      } else {
        setVoucherError('Could not apply voucher. Please try again');
      }
      setVoucherInfo(null);
      onVoucherApplied(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleDepositToggle = (checked) => {
    setIsDeposit(checked);
    onDepositChange(checked);
  };

  const displayVoucherValue = (voucher) => {
    if (!voucher || typeof voucher.discountValue === 'undefined') return '0';
    return `${voucher.discountValue}%`;
  };

  const calculateDiscount = () => {
    if (!voucherInfo || !voucherInfo.discountValue) return 0;
    const discountAmount = (subTotal * voucherInfo.discountValue) / 100;
    return Math.min(discountAmount, subTotal);
  };

  return (
    <div className={styles.checkoutEnhancements}>
      <Row>
        <Col md={6}>
          <div className={styles.enhancementSection}>
            <div className={styles.voucherSection}>
              <div className={styles.sectionTitle}>
                <MdLocalOffer />
                <span>Apply Voucher</span>
              </div>
              <div className={styles.voucherContent}>
                <div className={styles.voucherInput}>
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Enter voucher code"
                    className={`${voucherError ? styles.error : ''} ${
                      voucherInfo ? styles.success : ''
                    }`}
                    disabled={voucherLoading || voucherInfo}
                  />
                  {voucherInfo ? (
                    <button
                      type="button"
                      onClick={() => {
                        setVoucherInfo(null);
                        setVoucherCode('');
                        onVoucherApplied(null);
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
          </div>
        </Col>
        <Col md={6}>
          <div className={styles.enhancementSection}>
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
                    onChange={(e) => handleDepositToggle(e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
              {isDeposit && (
                <div className={styles.depositDetails}>
                  <div className={styles.depositBreakdown}>
                    <div className={styles.depositRow}>
                      <span>Subtotal</span>
                      <span>{(subTotal + shippingCost).toLocaleString()} VND</span>
                    </div>
                    <div className={styles.depositRow}>
                      <span>Deposit (30%)</span>
                      <span>
                        {Math.round((subTotal + shippingCost - calculateDiscount()) * 0.3).toLocaleString()} VND
                      </span>
                    </div>
                    <div className={styles.depositRow}>
                      <span>Remaining Payment</span>
                      <span>
                        {Math.round((subTotal + shippingCost - calculateDiscount()) * 0.7).toLocaleString()} VND
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutEnhancements;