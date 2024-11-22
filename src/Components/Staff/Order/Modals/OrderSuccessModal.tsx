// components/OrderSuccessModal/OrderSuccessModal.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Check, 
  Printer, 
  FileText, 
  ArrowRight, 
  CreditCard,
  Clock
} from 'lucide-react';
import { OrderSuccessData } from '../types/orderSuccess';
import { formatCurrency, formatDate, getOrderStatus } from '../utils/formatters';
import styles from '../styles/OrderSuccessModal.module.scss';
import { CompanyInfo } from '../types/company';

interface OrderSuccessModalProps {
  isOpen: boolean;
  orderData: OrderSuccessData;
  onClose: () => void;
  onPrint: () => void;
  onViewDetails: () => void;
  onNewOrder: () => void;
  companyInfo: CompanyInfo; // Add companyInfo prop
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  orderData,
  onClose,
  onPrint,
  onViewDetails,
  onNewOrder,
  companyInfo // Destructure companyInfo
}) => {
  if (!isOpen) return null;

  const status = getOrderStatus(orderData.process);

  return (
    <div className={styles.modalOverlay}>
      <motion.div 
        className={styles.modalContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        {/* Header Section */}
        <div className={styles.header}>
          <motion.div 
            className={styles.successIcon}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Check />
          </motion.div>
          <h2>Order Completed!</h2>
          <p className={styles.orderId}>Order #{orderData.orderID}</p>
          <div className={`${styles.orderStatus} ${styles[status.className]}`}>
            <Clock size={16} />
            <span>{status.label}</span>
          </div>
        </div>

        {/* Company Information */}
        {/* <div className={styles.companyInfo}>
          <img src={companyInfo.logo} alt="Company Logo" className={styles.companyLogo} />
          <div className={styles.companyDetails}>
            <h1>{companyInfo.name}</h1>
            <p>{companyInfo.address}</p>
            <p>Tel: {companyInfo.phone}</p>
            <p>Email: {companyInfo.email}</p>
            <p>Tax ID: {companyInfo.taxId}</p>
            <p>Website: <a href={companyInfo.website} target="_blank" rel="noopener noreferrer">{companyInfo.website}</a></p>
          </div>
        </div> */}

        {/* Payment Summary */}
        <div className={styles.paymentSummary}>
          <div className={styles.totalAmount}>
            <span>Total Amount</span>
            <h3>{formatCurrency(orderData.totalAmount)}</h3>
          </div>
          
          {orderData.isDeposit && (
            <div className={styles.paymentDetails}>
              <div className={styles.paid}>
                <span>Paid Amount</span>
                <p>{formatCurrency(orderData.totalPaid)}</p>
              </div>
              <div className={styles.remaining}>
                <span>Remaining</span>
                <p>{formatCurrency(orderData.remainingAmount)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Product List */}
        <div className={styles.productList}>
          <h3>Product Details</h3>
          {orderData.productGlass.map((item, index) => (
            <div key={index} className={styles.productCard}>
              <img 
                src={item.eyeGlass.eyeGlassImage} 
                alt={item.eyeGlass.name}
                className={styles.productImage}
              />
              <div className={styles.productInfo}>
                <h4>{item.eyeGlass.name}</h4>
                <div className={styles.lensDetails}>
                  <div className={styles.lens}>
                    <span>Left Lens</span>
                    <p>{item.leftLen.lensName}</p>
                    <small>{item.leftLen.lensDescription}</small>
                  </div>
                  <div className={styles.lens}>
                    <span>Right Lens</span>
                    <p>{item.rightLen.lensName}</p>
                    <small>{item.rightLen.lensDescription}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment History */}
        <div className={styles.paymentHistory}>
          <h3>Payment History</h3>
          {orderData.payments.map((payment, index) => (
            <div key={index} className={styles.paymentItem}>
              <div className={styles.paymentInfo}>
                <CreditCard size={16} />
                <span>{payment.paymentMethod}</span>
                <span className={styles.separator}>•</span>
                <span>{formatDate(payment.date)}</span>
              </div>
              <span className={styles.amount}>
                {formatCurrency(payment.totalAmount)}
              </span>
            </div>
          ))}
        </div>

        {/* QR Code */}
        <div className={styles.qrCode}>
          <QRCodeCanvas
            value={`VISION_STORE_ORDER_${orderData.orderID}`}
            size={120}
            level="H"
          />
          <p>Scan to view digital receipt</p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={onPrint} className={styles.secondaryButton}>
            <Printer size={18} />
            <span>Print</span>
          </button>
          <button onClick={onViewDetails} className={styles.secondaryButton}>
            <FileText size={18} />
            <span>Details</span>
          </button>
          <button onClick={onNewOrder} className={styles.primaryButton}>
            <ArrowRight size={18} />
            <span>New Order</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccessModal;