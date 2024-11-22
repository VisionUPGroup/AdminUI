import styles from '../styles/SelectLens.module.scss';

export const OrderNowButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className={`${styles.actionButton} ${styles.orderNow}`}
  >
    Order Now
  </button>
);