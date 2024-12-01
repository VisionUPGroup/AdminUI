import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { 
  Check, 
  Printer, 
  ArrowRight, 
  CreditCard,
  Clock,
  Package
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import styles from '../styles/OrderSuccessModal.module.scss';
import PrintReceipt from './PrintReceipt';

interface OrderProduct {
  productGlassID: number;
  eyeGlass: {
    id: number;
    name: string;
    eyeGlassImage: string;
  };
  leftLen: {
    id: number;
    lensName: string;
    lensDescription: string;
    leftLensImage: string | null;
  };
  rightLen: {
    id: number;
    lensName: string;
    lensDescription: string;
    rightLensImage: string | null;
  };
}

interface OrderSuccessData {
  orderID: number;
  code: string;
  orderTime: string;
  totalAmount: number;
  isDeposit: boolean;
  receiverAddress: string | null;
  kioskID?: number;
  process: number;
  productGlass: OrderProduct[];
  totalPaid: number;
  remainingAmount: number;
  voucher: null | {
    id: number;
    code: string;
    discountValue: number;
  };
  payments: Array<{
    id: number;
    totalAmount: number;
    date: string;
    paymentMethod: string;
  }>;
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  taxId: string;
  website: string;
}

interface OrderSuccessModalProps {
  isOpen: boolean;
  orderData: OrderSuccessData | null;
  onClose: () => void;
  onNewOrder: () => void;
  companyInfo: CompanyInfo;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  orderData,
  onClose,
  onNewOrder,
  companyInfo
}) => {
  const printComponentRef = useRef<HTMLDivElement>(null);

  const getOrderStatus = useCallback((process: number) => {
    switch (process) {
      case 1: return { label: 'Processing', className: 'processing' };
      case 2: return { label: 'Ready for Pickup', className: 'ready' };
      case 3: return { label: 'Completed', className: 'completed' };
      default: return { label: 'Unknown', className: 'unknown' };
    }
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,  // Sử dụng contentRef thay vì content
    documentTitle: `Receipt-${orderData?.code || 'receipt'}`,
    bodyClass: 'print-receipt',
    onBeforePrint: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onAfterPrint: () => {
      console.log('Print completed');
    },
    onPrintError: (errorLocation, error) => {
      console.error(`Print failed during ${errorLocation}:`, error);
    },
    pageStyle: `
      @media print {
        @page {
          size: 80mm 297mm;
          margin: 0;
        }
        body {
          margin: 10mm;
        }
      }
    `,
  });
  
  const printReceipt = useCallback(() => {
    handlePrint();
  }, [handlePrint]);

  if (!isOpen || !orderData) return null;

  const status = getOrderStatus(orderData.process);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <motion.div 
        className={styles.modalContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Visible Content */}
        <div className={styles.visibleContent}>
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
            <p className={styles.orderId}>Order #{orderData.code}</p>
            <div className={`${styles.orderStatus} ${styles[status.className]}`}>
              <Clock size={16} />
              <span>{status.label}</span>
            </div>
            <p className={styles.orderTime}>
              {formatDate(orderData.orderTime)}
            </p>
          </div>

          {/* Payment Summary */}
          <div className={styles.paymentSummary}>
            <div className={styles.totalAmount}>
              <span>Total Amount</span>
              <h3>{formatCurrency(orderData.totalAmount)}</h3>
            </div>
            
            {orderData.isDeposit && (
              <div className={styles.paymentDetails}>
                <div className={styles.paid}>
                  <span>Deposit Paid (30%)</span>
                  <p>{formatCurrency(orderData.totalPaid)}</p>
                </div>
                <div className={styles.remaining}>
                  <span>Remaining Balance</span>
                  <p>{formatCurrency(orderData.remainingAmount)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Product List */}
          <div className={styles.productList}>
            <div className={styles.sectionHeader}>
              <Package size={20} />
              <h3>Products ({orderData.productGlass.length})</h3>
            </div>
            
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
                      <span>Lens Type</span>
                      <p>{item.leftLen.lensName}</p>
                      <small>{item.leftLen.lensDescription}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment History */}
          {orderData.payments.length > 0 && (
            <div className={styles.paymentHistory}>
              <div className={styles.sectionHeader}>
                <CreditCard size={20} />
                <h3>Payment History</h3>
              </div>
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
          )}

          <div className={styles.actions}>
            <button 
              onClick={printReceipt}
              className={styles.secondaryButton}
            >
              <Printer size={18} />
              <span>Print Receipt</span>
            </button>
            <button 
              onClick={onNewOrder}
              className={styles.primaryButton}
            >
              <ArrowRight size={18} />
              <span>New Order</span>
            </button>
          </div>
        </div>

        {/* Hidden Print Content */}
        <div style={{ display: 'none' }}>
          <div ref={printComponentRef}>
            <PrintReceipt
              orderData={orderData}
              companyInfo={companyInfo}
              staffName="Staff Member"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccessModal;