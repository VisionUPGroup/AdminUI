import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Check } from 'lucide-react';
import { Lens } from '../types/lens.types';
import styles from './AddToCartModal.module.scss';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  selectedLenses: {
    left: Lens | null;
    right: Lens | null;
  };
  lensMode: 'same' | 'custom';
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedLenses,
  lensMode
}) => {
  const calculateTotal = () => {
    if (lensMode === 'same' && selectedLenses.left) {
      return selectedLenses.left.lensPrice * 2;
    }
    let total = 0;
    if (selectedLenses.left) total += selectedLenses.left.lensPrice;
    if (selectedLenses.right) total += selectedLenses.right.lensPrice;
    return total;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className={styles.modalContent}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <header className={styles.modalHeader}>
              <h2>Add to Cart</h2>
              <button className={styles.closeButton} onClick={onClose}>
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.cartIcon}>
                <ShoppingCart size={48} />
              </div>

              <div className={styles.lensDetails}>
                {lensMode === 'same' ? (
                  <div className={styles.sameLensMode}>
                    <h3>Same Lens for Both Eyes</h3>
                    <div className={styles.lensInfo}>
                      <span className={styles.lensName}>
                        {selectedLenses.left?.lensName}
                      </span>
                      <span className={styles.price}>
                        {(selectedLenses.left?.lensPrice || 0).toLocaleString('vi-VN')}₫ x 2
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.customLensMode}>
                    <div className={styles.eyeSection}>
                      <h3>Right Eye (OD)</h3>
                      {selectedLenses.right && (
                        <div className={styles.lensInfo}>
                          <span className={styles.lensName}>
                            {selectedLenses.right.lensName}
                          </span>
                          <span className={styles.price}>
                            {selectedLenses.right.lensPrice.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={styles.eyeSection}>
                      <h3>Left Eye (OS)</h3>
                      {selectedLenses.left && (
                        <div className={styles.lensInfo}>
                          <span className={styles.lensName}>
                            {selectedLenses.left.lensName}
                          </span>
                          <span className={styles.price}>
                            {selectedLenses.left.lensPrice.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.totalSection}>
                  <span className={styles.totalLabel}>Total Amount</span>
                  <span className={styles.totalPrice}>
                    {calculateTotal().toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              <div className={styles.message}>
                <p>Ready-to-wear lenses selected. No prescription needed.</p>
              </div>
            </div>

            <footer className={styles.modalFooter}>
  <button 
    className={styles.cancelButton} 
    onClick={onClose}
  >
    Cancel
  </button>
  <button 
    className={styles.confirmButton} 
    onClick={() => {
      // Tạo prescription data mặc định cho lens type 4
      const defaultPrescription = {
        sphereOD: 0, cylinderOD: 0, axisOD: 0,
        sphereOS: 0, cylinderOS: 0, axisOS: 0,
        addOD: 0, addOS: 0, pd: 0
      };

      onConfirm({
        leftLens: selectedLenses.left,
        rightLens: selectedLenses.right,
        prescriptionData: defaultPrescription // Thêm prescription data mặc định
      });
    }}
  >
    <ShoppingCart size={20} />
    <span>Add to Cart</span>
  </button>
</footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddToCartModal;