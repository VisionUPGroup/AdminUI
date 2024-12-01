import React from 'react';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from './CartModal.module.scss';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onCheckout }) => {
  const { state, dispatch } = useCart();

  if (!isOpen) return null;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id, quantity: newQuantity },
    });
  };

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <ShoppingBag />
            <h2>Shopping Cart ({state.items.length})</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {state.items.length === 0 ? (
          <div className={styles.emptyCart}>
            <ShoppingBag size={48} />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className={styles.itemList}>
              {state.items.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.productImage}>
                    <img src={item.eyeGlass.eyeGlassImages[0]?.url} alt={item.eyeGlass.name} />
                  </div>
                  
                  <div className={styles.itemInfo}>
                    <h3>{item.eyeGlass.name}</h3>
                    <div className={styles.lensInfo}>
                      <p>Lens: {item.leftLens.lensName}</p>
                      {item.prescriptionData.pd && (
                        <span className={styles.prescription}>
                          PD: {item.prescriptionData.pd}mm
                        </span>
                      )}
                    </div>
                    
                    <div className={styles.priceQuantity}>
                      <div className={styles.price}>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(item.eyeGlass.price + item.leftLens.lensPrice)}
                      </div>
                      
                      <div className={styles.quantityControls}>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className={styles.quantityButton}
                        >
                          <Minus size={16} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className={styles.quantityButton}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className={styles.removeButton}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.total}>
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(state.total)}
                </span>
              </div>
              
              <button
                className={styles.checkoutButton}
                onClick={onCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;