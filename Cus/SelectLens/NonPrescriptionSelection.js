import { useState } from 'react';
import styles from './styles/SelectLens.module.scss';
import { OrderNowButton } from './OrderNow/order-now-button';

// NonPrescriptionSelection.js
export const NonPrescriptionSelection = ({
  data,
  setStep,
  handleAddToCart,
  handleOrderNow,
  formatPrice
}) => {
  const [comment, setComment] = useState('');

  return (
    <div className={styles.nonPrescriptionSelection}>
      <button
        onClick={() => setStep(1)}
        className={styles.backButton}
      >
        &lt; Back to Lens Selection
      </button>

      <h2 className={styles.pageTitle}>Overview your Selection</h2>

      {/* Order Summary Section - Thiết kế mới */}
      <div className={styles.orderSummary}>
        <div className={styles.orderHeader}>
          <h3>Order Summary</h3>
          <div className={styles.headerPrice}>
            <span>Total:</span>
            <strong>{formatPrice(data.price + (data.lensData?.lensPrice || 0))} VND</strong>
          </div>
        </div>

        <div className={styles.summaryContent}>
          {/* Product và Lens Info */}
          <div className={styles.infoSection}>
            <div className={styles.detailsRow}>
              <div className={styles.detailItem}>
                <span>Product Name</span>
                <strong>{data.name}</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Product Price</span>
                <strong>{formatPrice(data.price)} VND</strong>
              </div>
            </div>

            <div className={styles.detailsRow}>
              <div className={styles.detailItem}>
                <span>Selected Size</span>
                <strong>{data.selectedSize}</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Lens Type</span>
                <strong>{data.lensData?.lensType.description.split('.')[0]}</strong>
              </div>
            </div>

            {/* Lens Details vẫn giữ nguyên */}
            {data.lensData && (
              <div className={styles.detailsRow}>
                <div className={styles.detailItem}>
                  <span>Selected Lens</span>
                  <strong>{data.lensData.lensName}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Lens Price</span>
                  <strong>{formatPrice(data.lensData.lensPrice)} VND</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comment Section */}
      <div className={styles.commentSection}>
        <h3>Your Comments</h3>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave your comments or notes here..."
          className={styles.commentInput}
        />
      </div>

      <div className={styles.actions}>
        <button
          onClick={handleAddToCart}
          className={`${styles.actionButton} ${styles.primary}`}
        >
          Add to Cart
        </button>
        <OrderNowButton onClick={handleOrderNow} />
      </div>
    </div>
  );
};