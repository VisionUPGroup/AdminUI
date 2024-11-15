// PaymentInfo.tsx
import React, { useMemo } from 'react';
import { 
  FaMoneyBillWave, 
  FaRegCreditCard, 
  FaExclamationCircle,
  FaCheckCircle,
  FaPercentage,
  FaHistory,
  FaArrowUp,
  FaInfoCircle
} from 'react-icons/fa';

interface PaymentInfoProps {
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  isDeposit: boolean;
}

const PaymentInfo: React.FC<PaymentInfoProps> = ({
  totalAmount,
  totalPaid,
  remainingAmount,
  isDeposit
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const paymentProgress = useMemo(() => {
    return (totalPaid / totalAmount) * 100;
  }, [totalPaid, totalAmount]);

  const paymentStatus = useMemo(() => {
    if (remainingAmount === 0) return 'completed';
    if (isDeposit) return 'partial';
    return 'pending';
  }, [remainingAmount, isDeposit]);

  return (
    <div className="payment-info">
      <div className="info-header">
        <div className="header-icon">
          <FaRegCreditCard />
        </div>
        <div className="header-content">
          <h3>Payment Information</h3>
          <p>Payment status and transaction details</p>
        </div>
      </div>

      <div className="info-content">
        {/* Payment Progress */}
    

        {/* Payment Details */}
        <div className="payment-details">
          <div className="detail-item">
            <div className="label">
              <FaMoneyBillWave />
              <span>Total Amount</span>
            </div>
            <div className="value">{formatCurrency(totalAmount)}</div>
          </div>

          <div className="detail-item highlight">
            <div className="label">
              <FaRegCreditCard />
              <span>Amount Paid</span>
            </div>
            <div className="value success">
              {formatCurrency(totalPaid)}
              {isDeposit && <span className="badge">Deposit</span>}
            </div>
          </div>

          <div className="detail-item">
            <div className="label">
              <FaExclamationCircle />
              <span>Remaining</span>
            </div>
            <div className="value warning">{formatCurrency(remainingAmount)}</div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="payment-status">
          {paymentStatus === 'completed' ? (
            <div className="status-box completed">
              <div className="status-icon">
                <FaCheckCircle />
              </div>
              <div className="status-content">
                <h4>Payment Completed</h4>
                <p>All payments have been processed successfully</p>
              </div>
            </div>
          ) : paymentStatus === 'partial' ? (
            <div className="status-box partial">
              <div className="status-icon">
                <FaPercentage />
              </div>
              <div className="status-content">
                <h4>Partial Payment</h4>
                <p>Initial deposit received, awaiting final payment</p>
                <div className="deposit-note">
                  <FaInfoCircle />
                  Deposit has been confirmed
                </div>
              </div>
            </div>
          ) : (
            <div className="status-box pending">
              <div className="status-icon">
                <FaHistory />
              </div>
              <div className="status-content">
                <h4>Payment Pending</h4>
                <p>Awaiting payment confirmation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;