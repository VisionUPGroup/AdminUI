// cart-page.js
import React, { useState, useContext, useEffect } from "react";
import Link from "next/link";
import CartContext from "../../../../../helpers/cart";
import { Container, Row, Col } from "reactstrap";
import { CurrencyContext } from "../../../../../helpers/Currency/CurrencyContext";
import cart from "../../../../../public/assets/images/icon-empty-cart.png";
import { cartService } from "../../../../../Api/cartService";
import CartItem from "./CartItem";
import styles from "./cart-page.module.scss";
import { MdOutlineLock, MdShoppingBag } from "react-icons/md";

const CartPage = () => {
  const context = useContext(CartContext);
  const curContext = useContext(CurrencyContext);
  const symbol = curContext.state.symbol;
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [total, setTotal] = useState(0);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const { fetchCartByAccountID } = cartService();

  useEffect(() => {
    const fetchCartData = async () => {
      const cartData = await fetchCartByAccountID();
      if (cartData) {
        setCartItems(cartData.cartDetails);
        setTotal(cartData.totalPrice);
        // Initialize all items as unselected
        const initialSelected = {};
        cartData.cartDetails.forEach(item => {
          initialSelected[item.productGlassID] = false;
        });
        setSelectedItems(initialSelected);
      }
    };
    fetchCartData();
  }, []);

  useEffect(() => {
    // Calculate total for selected items
    const newTotal = cartItems.reduce((acc, item) => {
      if (selectedItems[item.productGlassID]) {
        return acc + (item.eyeGlassPrice + (item.lensPrice * 2));
      }
      return acc;
    }, 0);
    setSelectedTotal(newTotal);
  }, [selectedItems, cartItems]);

  const handleDeleteItem = (productGlassID) => {
    setCartItems(cartItems.filter(item => item.productGlassID !== productGlassID));
    const { [productGlassID]: removed, ...remainingItems } = selectedItems;
    setSelectedItems(remainingItems);
  };

  const handleSelectItem = (productGlassID) => {
    setSelectedItems(prev => ({
      ...prev,
      [productGlassID]: !prev[productGlassID]
    }));
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelectedItems = {};
    cartItems.forEach(item => {
      newSelectedItems[item.productGlassID] = isChecked;
    });
    setSelectedItems(newSelectedItems);
  };

  const getSelectedItemsCount = () => {
    return Object.values(selectedItems).filter(Boolean).length;
  };

  const handleCheckout = () => {
    const selectedCartItems = cartItems.filter(item => selectedItems[item.productGlassID]);
    // Lưu các item đã chọn vào localStorage
    localStorage.setItem('selectedCartItems', JSON.stringify(selectedCartItems));
    localStorage.setItem('selectedTotalAmount', selectedTotal);
  };

  return (
    <div className={`${styles["cart-page"]} ${styles["fade-in"]}`}>
      {cartItems && cartItems.length > 0 ? (
        <section className={styles["cart-section"]}>
          <Container>
            <Row>
              <Col md="8" className={styles["cart-items"]}>
                <div className={styles["select-all-container"]}>
                  <label className={styles["select-all-label"]}>
                    <input
                      type="checkbox"
                      checked={Object.values(selectedItems).every(Boolean) && cartItems.length > 0}
                      onChange={handleSelectAll}
                      className={styles["select-all-checkbox"]}
                    />
                    Select All ({getSelectedItemsCount()} of {cartItems.length} items)
                  </label>
                </div>
                <div className={styles["cart-items-list"]}>
                  {cartItems.map((item, index) => (
                    <div 
                      key={item.productGlassID}
                      className={styles["slide-in"]}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CartItem
                        item={item}
                        onDelete={handleDeleteItem}
                        isSelected={selectedItems[item.productGlassID]}
                        onSelect={() => handleSelectItem(item.productGlassID)}
                      />
                    </div>
                  ))}
                </div>
              </Col>
              <Col md="4">
                <div className={`${styles["order-summary"]} ${styles["slide-in-right"]}`}>
                  <h2 className={styles["order-summary__title"]}>Order Summary</h2>
                  <div className={styles["order-summary__item"]}>
                    <label className={styles["order-summary__font"]}>
                      Selected Items:
                      <span>{getSelectedItemsCount()}</span>
                    </label>
                    <label className={styles["order-summary__font"]}>
                      Subtotal:
                      <span>{selectedTotal.toLocaleString()} VND</span>
                    </label>
                    <label className={styles["order-summary__font"]}>
                      Shipping:
                      <span>Free</span>
                    </label>
                  </div>
                  <div className={styles["order-summary__total"]}>
                    <label className={styles["order-summary__font"]}>
                      Total:
                      <span>{selectedTotal.toLocaleString()} VND</span>
                    </label>
                  </div>
                  <div className={styles["cart-buttons"]}>
                    <Link 
                      href={getSelectedItemsCount() > 0 ? `/page/account/checkout` : '#'}
                      className={`${styles["btn-custom"]} ${styles["btn-checkout"]} ${getSelectedItemsCount() === 0 ? styles["btn-disabled"] : ''}`}
                      onClick={handleCheckout}
                    >
                      <MdOutlineLock className={styles["btn-icon"]} />
                      Proceed to checkout
                    </Link>
                    <Link 
                      href={`/shop/no_sidebar`} 
                      className={`${styles["btn-custom"]} ${styles["btn-continue"]}`}
                    >
                      <MdShoppingBag className={styles["btn-icon"]} />
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      ) : (
        <section className={`${styles["cart-section"]} ${styles["empty-cart"]} ${styles["fade-in"]}`}>
          <Container>
            <Row>
              <Col sm="12">
                <div className={styles["empty-cart-content"]}>
                  <img src={cart} className={styles["empty-cart-icon"]} alt="Empty Cart" />
                  <h3>Your Cart is Empty</h3>
                  <p>Explore more shortlist some items.</p>
                  <Link href="/shop/no_sidebar" className={styles["btn-start-shopping"]}>
                    Start Shopping
                  </Link>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </div>
  );
};

export default CartPage;