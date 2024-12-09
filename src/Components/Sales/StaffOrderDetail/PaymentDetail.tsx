import React, { useEffect, useState } from 'react';
import { FaTag, FaMoneyBillWave, FaPercent } from 'react-icons/fa';
import { useLensService } from '../../../../Api/lensService';
import { useEyeGlassService } from '../../../../Api/eyeGlassService';

import './PaymentDetailStyle.scss';

interface Payment {
  id: number;
  totalAmount: number;
  date: string;
  paymentMethod: string;
  code: string; // Thêm field code
 }

interface LensPrice {
  [key: string]: number;
}

interface EyeGlassPrice {
  [key: string]: number;
}

const PaymentHistory: React.FC<{ payments: Payment[] }> = ({ payments }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };
 
  if (!payments || payments.length === 0) {
    return <div className="no-payments">No payment history available</div>;
  }
 
  return (
    <div className="history-list">
      {payments.map((payment) => (
        <div key={payment.id} className="history-item">
          <div className="payment-info">
            <span className="code">{payment.code}</span>
            <span className="date">
              {new Date(payment.date).toLocaleString('vi-VN')}
            </span>
            <span className="method">{payment.paymentMethod}</span>
          </div>
          <span className="amount">{formatCurrency(payment.totalAmount)}</span>
        </div>
      ))}
    </div>
  );
 };

const PaymentDetails: React.FC<{ paymentInfo: any }> = ({ paymentInfo }) => {
  const { fetchLensById } = useLensService();
  const { fetchEyeGlassById } = useEyeGlassService();
  const [lensPrices, setLensPrices] = useState<LensPrice>({});
  const [glassFramePrices, setGlassFramePrices] = useState<EyeGlassPrice>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllPrices = async () => {
      setIsLoading(true);
      const lensPrice: LensPrice = {};
      const glassPrice: EyeGlassPrice = {};
      
      try {
        for (const item of paymentInfo.productGlass) {
          // Fetch eyeglass price
          const eyeGlassData = await fetchEyeGlassById(item.eyeGlass.id);
          if (eyeGlassData && eyeGlassData.price) {
            glassPrice[item.productGlassID] = eyeGlassData.price;
          }

          if (item.leftLen?.id) {
            const leftLensData = await fetchLensById(item.leftLen.id);
            if (leftLensData && leftLensData.lensPrice) {
              lensPrice[`left-${item.productGlassID}`] = leftLensData.lensPrice;
            }
          }

          if (item.rightLen?.id) {
            const rightLensData = await fetchLensById(item.rightLen.id);
            if (rightLensData && rightLensData.lensPrice) {
              lensPrice[`right-${item.productGlassID}`] = rightLensData.lensPrice;
            }
          }
        }
        setLensPrices(lensPrice);
        setGlassFramePrices(glassPrice);
      } catch (error) {
        console.error('Error fetching prices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPrices();
  }, [paymentInfo.productGlass]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (isLoading) {
    return <div className="loading">Loading prices...</div>;
  }

  return (
    <div className="payment-details">
    {/* Payment Summary */}
<section className="payment-summary">
  <h2 className="section-title">
    <FaMoneyBillWave className="section-icon" />
    Payment Summary
  </h2>
  <div className="summary-grid">
    <div className="summary-item">
      <span className="label">Total Amount</span>
      <span className="value">{formatCurrency(paymentInfo.totalAmount)}</span>
    </div>
    <div className="summary-item">
      <span className="label">Total Paid</span>
      <span className="value success">{formatCurrency(paymentInfo.totalPaid)}</span>
    </div>
    <div className="summary-item">
      <span className="label">Remaining Amount</span>
      <span className="value warning">{formatCurrency(paymentInfo.remainingAmount)}</span>
    </div>

    {/* Thêm hiển thị trạng thái đặt cọc */}
    <div className="summary-item">
      <span className="label">Payment Status</span>
      <span className={`value ${paymentInfo.isDeposit ? 'deposit' : 'full-payment'}`}>
        {paymentInfo.isDeposit ? 'Deposit Payment' : 'Full Payment'}
      </span>
    </div>

    {/* Hiển thị thông tin voucher */}
    <div className="summary-item voucher">
      <span className="label">
        <FaTag /> Voucher
      </span>
      <span className="value">
        {paymentInfo.voucher ? (
          <span className="tag">
            {paymentInfo.voucher.code}
            <span className="discount">
              <FaPercent /> {paymentInfo.voucher.discountValue}
            </span>
          </span>
        ) : (
          <span className="no-voucher">No voucher applied</span>
        )}
      </span>
    </div>
  </div>
</section>

      <section className="product-section">
        <h2 className="section-title">Product Details</h2>
        <div className="product-grid">
          {paymentInfo.productGlass.map((item: any) => (
            <div key={item.productGlassID} className="product-card">
              <div className="product-image">
                <img 
                  src={item.eyeGlass.eyeGlassImage} 
                  alt={item.eyeGlass.name} 
                />
              </div>
              <div className="product-info">
                <h3 className="product-name">{item.eyeGlass.name}</h3>
                
                <div className="eyeglass-price">
                  <span>Frame Price:</span>
                  <span className="price">
                    {formatCurrency(glassFramePrices[item.productGlassID] || 0)}
                  </span>
                </div>

                <div className="lens-prices">
                  {item.leftLen && (
                    <div className="lens-info">
                      <h4>Left Lens - {item.leftLen.lensName}</h4>
                      <div className="lens-price">
                        Price: {formatCurrency(lensPrices[`left-${item.productGlassID}`] || 0)}
                      </div>
                    </div>
                  )}
                  
                  {item.rightLen && (
                    <div className="lens-info">
                      <h4>Right Lens - {item.rightLen.lensName}</h4>
                      <div className="lens-price">
                        Price: {formatCurrency(lensPrices[`right-${item.productGlassID}`] || 0)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="total-price">
                  <span>Total Price:</span>
                  <span className="price">
                    {formatCurrency(
                      (glassFramePrices[item.productGlassID] || 0) +
                      (lensPrices[`left-${item.productGlassID}`] || 0) + 
                      (lensPrices[`right-${item.productGlassID}`] || 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="payment-history">
        <h2 className="section-title">Payment History</h2>
        <PaymentHistory payments={paymentInfo.payments} />
      </section>
    </div>
  );
};

export default PaymentDetails;