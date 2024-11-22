import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, CreditCard, Wallet, AlertCircle, DollarSign } from 'lucide-react';
import styles from '../styles/PaymentProcessingModal.module.scss';

interface PaymentProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (method: 'cash' | 'vnpay') => Promise<void>;
  orderData: {
    code: string;
    total: number;
    isDeposit: boolean;
    products: Array<{
      name: string;
      type: 'frame' | 'lens';
      price: number;
      quantity: number;
      image?: string;
    }>;
  };
}

const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
  isOpen,
  onClose,
  onConfirmPayment,
  orderData
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'vnpay'>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setShowConfirmation(false);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirmPayment(selectedMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className={styles.overlay}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={overlayVariants}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        variants={modalVariants}
        onClick={e => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose} disabled={loading}>
          <X size={24} />
        </button>

        <div className={styles.header}>
          <h2>{showConfirmation ? 'Confirm Payment' : 'Select Payment Method'}</h2>
          <div className={styles.orderInfo}>
            <span>Order #{orderData.code}</span>
            <span className={styles.amount}>
              {orderData.isDeposit ? '30% Deposit: ' : 'Total: '}
              {orderData.total.toLocaleString()} VND
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showConfirmation ? (
            <motion.div
              key="payment-methods"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={styles.content}
            >
              <div className={styles.methods}>
                <label className={`${styles.method} ${selectedMethod === 'cash' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={selectedMethod === 'cash'}
                    onChange={() => setSelectedMethod('cash')}
                  />
                  <div className={styles.methodContent}>
                    <div className={`${styles.methodIcon} ${styles.cashIcon}`}>
                      <DollarSign size={24} />
                    </div>
                    <div className={styles.methodInfo}>
                      <h3>Cash Payment</h3>
                      <p>Accept cash payment from customer</p>
                    </div>
                    <Check className={styles.checkmark} />
                  </div>
                </label>

                <label className={`${styles.method} ${selectedMethod === 'vnpay' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={selectedMethod === 'vnpay'}
                    onChange={() => setSelectedMethod('vnpay')}
                  />
                  <div className={styles.methodContent}>
                    <div className={`${styles.methodIcon} ${styles.vnpayIcon}`}>
                      <CreditCard size={24} />
                    </div>
                    <div className={styles.methodInfo}>
                      <h3>VNPay</h3>
                      <p>Secure online payment via VNPay</p>
                    </div>
                    <Check className={styles.checkmark} />
                  </div>
                </label>
              </div>

              <div className={styles.products}>
                <h3>Order Summary</h3>
                <div className={styles.productList}>
                  {orderData.products.map((product, index) => (
                    <div key={index} className={styles.productItem}>
                      {product.image && (
                        <div className={styles.productImage}>
                          <img src={product.image} alt={product.name} />
                        </div>
                      )}
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>{product.name}</span>
                        <span className={styles.productType}>{product.type}</span>
                      </div>
                      <div className={styles.productPrice}>
                        <span className={styles.quantity}>x{product.quantity}</span>
                        <span>{product.price.toLocaleString()} VND</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.confirmation}
            >
              <div className={styles.confirmationContent}>
                <div className={styles.selectedMethod}>
                  <div className={`${styles.methodIcon} ${styles[selectedMethod]}`}>
                    {selectedMethod === 'cash' ? <DollarSign size={24} /> : <CreditCard size={24} />}
                  </div>
                  <div className={styles.methodDetails}>
                    <h3>{selectedMethod === 'cash' ? 'Cash Payment' : 'VNPay'}</h3>
                    <p>
                      {orderData.isDeposit ? 'Deposit Amount: ' : 'Total Amount: '}
                      <strong>{orderData.total.toLocaleString()} VND</strong>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className={styles.error}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.backButton}
            onClick={() => showConfirmation ? setShowConfirmation(false) : onClose()}
            disabled={loading}
          >
            {showConfirmation ? 'Back' : 'Cancel'}
          </button>
          <button
            className={styles.confirmButton}
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>{showConfirmation ? 'Confirm Payment' : 'Continue'}</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentProcessingModal;