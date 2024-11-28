import React from 'react';
import {
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaStore,
  FaMoneyBillWave,
  FaTimes
} from "react-icons/fa";
import OrderStatusTracker from "./OderTracker";
import LensInformation from "./LensInformation";
import PaymentInfo from "./PaymentInfomation";

const OrderDetailModal = ({
  isOpen,
  onClose,
  orderInfo,
  paymentInfo,
  lensInfo,
  orderDetails,
  onStatusUpdate,
  onDeleteOrder,
  formatCurrency
}) => {
  if (!isOpen || !orderInfo) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Order Details</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          <div className="modal-body">
            <div className="info-section total-section">
              <div className="total-amount">
                {formatCurrency(orderInfo.total)}
              </div>
            </div>

            <div className="info-section">
              <div className="info-label">
                <FaMapMarkerAlt /> Delivery Address
              </div>
              <div className="info-value">{orderInfo.receiverAddress}</div>
            </div>

            <div className="info-section">
              <div className="info-label">
                <FaTag /> Voucher Applied
              </div>
              <div className="info-value">
                {orderInfo.voucherName || "No voucher applied"}
              </div>
            </div>

            <div className="info-section">
              <div className="info-label">
                <FaStore /> Kiosk Location
              </div>
              <div className="info-value">{orderInfo.kioskName}</div>
            </div>

            <div className="info-section">
              <div className="info-label">
                <FaMoneyBillWave /> Payment Status
              </div>
              <div className="status-wrapper">
                <span className={`status ${orderInfo.isDeposit ? "success" : "pending"}`}>
                  {orderInfo.isDeposit ? (
                    <>
                      <FaCheckCircle /> Deposited
                    </>
                  ) : (
                    <>
                      <FaTimesCircle /> Not Deposited
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="info-section">
              <OrderStatusTracker
                status={orderInfo.process}
                orderId={orderInfo.orderId}
                onStatusUpdate={onStatusUpdate}
                onDeleteOrder={onDeleteOrder}
              />
            </div>

            {orderInfo && paymentInfo && (
              <div className="info-section payment-details">
                <PaymentInfo
                  totalAmount={orderInfo.total}
                  totalPaid={paymentInfo.totalPaid}
                  remainingAmount={paymentInfo.remainingAmount}
                  isDeposit={orderInfo.isDeposit}
                />
              </div>
            )}

            <div className="info-section">
              <LensInformation
                leftLens={{
                  name: lensInfo.leftLens?.lensName,
                  price: lensInfo.leftLens?.lensPrice,
                }}
                rightLens={{
                  name: lensInfo.rightLens?.lensName,
                  price: lensInfo.rightLens?.lensPrice,
                }}
              />
            </div>

            <div className="products-section">
              <div className="section-header">
                <h3>Products</h3>
                <span className="item-count">
                  {orderDetails.length} items
                </span>
              </div>
              <div className="product-list">
                {orderDetails.map((detail: { id: React.Key | null | undefined; productGlass: { eyeGlass: { eyeGlassImages: { url: any; }[]; name: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<React.AwaitedReactNode> | null | undefined; price: any; }; }; quantity: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | Iterable<React.ReactNode> | null | undefined; status: any; }) => (
                  <div className="product-item" key={detail.id}>
                    <div className="product-content">
                      <div className="product-image">
                        <img
                          src={detail.productGlass?.eyeGlass?.eyeGlassImages[0]?.url || "/placeholder-image.jpg"}
                          alt={detail.productGlass?.eyeGlass?.name}
                        />
                      </div>
                      <div className="product-info">
                        <h4 title={detail.productGlass?.eyeGlass?.name}>
                          {detail.productGlass?.eyeGlass?.name}
                        </h4>
                        <div className="price">
                          {formatCurrency(detail.productGlass?.eyeGlass?.price || 0)}
                        </div>
                        <div className="product-meta">
                          <span className="quantity">
                            Quantity: {detail.quantity}
                          </span>
                          <span className={`stock-status ${detail.status ? "success" : "pending"}`}>
                            {detail.status ? (
                              <>
                                <FaCheckCircle /> In Stock
                              </>
                            ) : (
                              <>
                                <FaTimesCircle /> Out of Stock
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;