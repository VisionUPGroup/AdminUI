import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
  FaHourglassHalf,
  FaCog,
  FaTruck,
  FaBoxOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaBan,
  FaSpinner,
  FaClock,
  FaExclamationTriangle,
  FaCreditCard,
  FaMoneyBillWave,
  FaInfoCircle,
  FaUpload,
  FaImage,
  FaChevronDown,
} from 'react-icons/fa';
import { useOrderService } from '../../../../Api/orderService';
import { usePaymentService } from '../../../../Api/paymentService';
import './OrderStatusTracker.scss';

interface OrderStatusTrackerProps {
  status: number;
  orderId: number;
  onStatusUpdate?: (newStatus: number) => void;
  onDeleteOrder?: (orderId: number) => void;
  totalAmount?: number;
  remainingAmount?: number; // Thêm remainingAmount
  isDeposit?: boolean;
  isHomeDelivery?: boolean;
  hasKioskInfo?: boolean;
  deliveryConfirmationImage?: string | null;
  isPaid?: boolean; // Flag để kiểm tra trạng thái thanh toán
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  status,
  orderId,
  onDeleteOrder,
  onStatusUpdate,
  totalAmount = 0,
  remainingAmount = 0,
  isDeposit = false,
  isHomeDelivery = false,
  hasKioskInfo = false,
  deliveryConfirmationImage = null,
  isPaid = false
}) => {
  const { updateOrderProcess, confirmDelivery } = useOrderService();
  const { createPaymentUrl } = usePaymentService();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<number | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const statusSteps = [
    {
      label: 'Pending',
      subLabel: 'Awaiting confirmation',
      icon: <FaHourglassHalf />,
      color: '#c79816',
      estimate: '1-2 hours',
      allowPayment: true
    },
    {
      label: 'Processing',
      subLabel: 'Order is being prepared',
      icon: <FaCog />,
      color: '#2563eb',
      estimate: '1-2 days',
      allowPayment: false
    },
    {
      label: 'Shipping',
      subLabel: 'Order in transit',
      icon: <FaTruck />,
      color: '#c79816',
      estimate: '2-3 days',
      allowPayment: true
    },
    {
      label: 'Delivered',
      subLabel: 'Package delivered',
      icon: <FaBoxOpen />,
      color: '#8b5cf6',
      estimate: 'Pending confirmation',
      allowPayment: false
    },
    {
      label: 'Completed',
      subLabel: 'Order fulfilled',
      icon: <FaCheckCircle />,
      color: '#10b981',
      estimate: null,
      allowPayment: false
    }
  ];

  const handleCreatePayment = async () => {
    try {
      setIsUpdating(true);
      const response = await createPaymentUrl(orderId);

      if (response && response.paymentUrl) {
        // Save current order state to session storage before redirecting
        sessionStorage.setItem('lastOrderState', JSON.stringify({
          orderId,
          status,
          totalAmount
        }));

        window.location.href = response.paymentUrl;
      } else {
        throw new Error('Invalid payment URL received');
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Failed to create payment");
    } finally {
      setIsUpdating(false);
      setShowPaymentDialog(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) return;

    try {
      setIsUpdating(true);
      await confirmDelivery(orderId, selectedImage);
      toast.success('Delivery confirmation image uploaded successfully');
      setShowImageUpload(false);

      // Reload order data to get updated status
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload delivery confirmation image');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setIsUpdating(true);

      if (status !== 0) {
        toast.error("Only pending orders can be cancelled");
        return;
      }

      if (onDeleteOrder) {
        await onDeleteOrder(orderId);
      }

      if (onStatusUpdate) {
        onStatusUpdate(5);
      }

      setShowConfirmation(false);
      setPendingStatus(null);

      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmAction = async () => {
    if (pendingStatus === 5) {
      await handleCancelOrder();
    } else {
      await handleStatusUpdate(pendingStatus!);
    }
  };

  const handleStatusUpdate = async (newStatus: number) => {
    try {
      setIsUpdating(true);
      await updateOrderProcess(orderId, newStatus);

      if (onStatusUpdate) {
        onStatusUpdate(newStatus);
      }

      toast.success(`Order status updated to ${statusSteps[newStatus]?.label || 'Cancelled'}`);
      setShowConfirmation(false);
      setPendingStatus(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const initiateStatusUpdate = (newStatus: number) => {
    setPendingStatus(newStatus);
    setShowConfirmation(true);
  };

  const renderOverlay = () => {
    if (!showPaymentDialog && !showImageUpload && !showConfirmation) return null;

    const closeDialog = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
      event.stopPropagation();
      setShowPaymentDialog(false);
      setShowImageUpload(false);
      setShowConfirmation(false);
    };

    function handleOverlayClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
      event.stopPropagation();
      setShowPaymentDialog(false);
      setShowImageUpload(false);
      setShowConfirmation(false);
    }

    return createPortal(
      <div className="global-confirmation-overlay" onClick={handleOverlayClick}>
        {/* Payment Dialog */}
        {showPaymentDialog && (
          <div className="global-dialog payment-dialog" onClick={e => e.stopPropagation()}>
            <h4>
              <FaMoneyBillWave className="dialog-icon" />
              Confirm Payment
            </h4>
            <div className="payment-details">
              <div className="amount-info">
                <span>Remaining Amount:</span>
                <span className="amount">
                  {formatCurrency(remainingAmount || 0)}
                </span>
              </div>
              {isDeposit && (
                <div className="deposit-note">
                  <FaInfoCircle />
                  <span>This is a deposit payment</span>
                </div>
              )}
            </div>
            <p>Are you sure you want to proceed with the payment?</p>
            <div className="dialog-actions">
              <button 
                className="dialog-btn confirm"
                onClick={handleCreatePayment}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <FaSpinner className="spinning" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    Proceed to Payment
                  </>
                )}
              </button>
              <button 
                className="dialog-btn cancel"
                onClick={closeDialog}
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Image Upload Dialog */}
        {showImageUpload && (
          <div className="global-dialog upload-dialog" onClick={e => e.stopPropagation()}>
            <h4>Upload Delivery Confirmation</h4>
            <div className="upload-content">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Preview" />
                </div>
              )}
            </div>
            <div className="dialog-actions">
              <button 
                className="dialog-btn confirm"
                onClick={handleUploadImage}
                disabled={!selectedImage || isUpdating}
              >
                {isUpdating ? (
                  <>
                    <FaSpinner className="spinning" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload />
                    Upload Image
                  </>
                )}
              </button>
              <button 
                className="dialog-btn cancel"
                onClick={closeDialog}
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Status Update Confirmation Dialog */}
        {showConfirmation && (
          <div className="global-dialog confirmation-dialog" onClick={e => e.stopPropagation()}>
            <h4>{pendingStatus === 5 ? 'Cancel Order' : 'Update Order Status'}</h4>
            <p>
              {pendingStatus === 5 
                ? 'Are you sure you want to cancel this order? This action cannot be undone.'
                : `Are you sure you want to change the order status to ${statusSteps[pendingStatus!]?.label}?`
              }
            </p>
            <div className="dialog-actions">
              <button 
                className="dialog-btn confirm"
                onClick={handleConfirmAction}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <FaSpinner className="spinning" />
                    Processing...
                  </>
                ) : (
                  <>
                    {pendingStatus === 5 ? <FaBan /> : <FaCheckCircle />}
                    {pendingStatus === 5 ? 'Cancel Order' : 'Confirm Update'}
                  </>
                )}
              </button>
              <button 
                className="dialog-btn cancel"
                onClick={closeDialog}
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>,
      document.body
    );
  };



  // Render actions based on conditions
  const renderActions = () => {
    if (isHomeDelivery) {
      return null;
    }
    if (hasKioskInfo) {
      return (
        <div className="status-actions">
          {/* Show Next Status button for non-shipping states */}
          {status < 4 && status !== 2 && (
            <button
              className="action-btn next"
              onClick={() => initiateStatusUpdate(status + 1)}
              disabled={isUpdating}
            >
              <FaArrowRight />
              Next Status
            </button>
          )}

          {/* Show Payment button for deposit orders in shipping state */}
          {status === 2 && isDeposit && !isPaid && remainingAmount > 0 && (
            <button
              className="action-btn payment"
              onClick={() => setShowPaymentDialog(true)}
              disabled={isUpdating}
            >
              <FaCreditCard />
              Pay Remaining: {formatCurrency(remainingAmount)}
            </button>
          )}

          {/* Show Upload button after payment or for non-deposit orders */}
          {status === 2 && !deliveryConfirmationImage && 
           ((isDeposit && isPaid) || !isDeposit || remainingAmount === 0) && (
            <button
              className="action-btn upload"
              onClick={() => setShowImageUpload(true)}
              disabled={isUpdating}
            >
              <FaUpload />
              Upload Delivery Image
            </button>
          )}

          {/* Show Next Status after image upload in shipping state */}
          {status === 2 && deliveryConfirmationImage && (
            <button
              className="action-btn next"
              onClick={() => initiateStatusUpdate(status + 1)}
              disabled={isUpdating}
            >
              <FaArrowRight />
              Next Status
            </button>
          )}

          {/* Show Cancel button only for pending orders */}
          {status === 0 && (
            <button
              className="action-btn cancel"
              onClick={() => initiateStatusUpdate(5)}
              disabled={isUpdating}
            >
              <FaBan />
              Cancel Order
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  // Render delivery confirmation section
  const renderDeliveryConfirmation = () => {
    return (
      <div className="delivery-confirmation-section">
        <div className="section-header" onClick={() => setIsExpanded(!isExpanded)}>
          <h4>
            <FaImage />
            Delivery Confirmation
          </h4>
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            <FaChevronDown />
          </span>
        </div>

        {isExpanded && (
          <div className="section-content">
            {deliveryConfirmationImage ? (
              <div className="image-preview">
                <img
                  src={deliveryConfirmationImage}
                  alt="Delivery Confirmation"
                  onClick={() => window.open(deliveryConfirmationImage, '_blank')}
                />
              </div>
            ) : (
              <div className="no-image">
                <FaImage />
                <p>No delivery confirmation image available</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (status === 5) {
    return (
      <div className="status-tracker cancelled">
        <div className="cancelled-content">
          <div className="cancelled-icon">
            <FaTimesCircle />
          </div>
          <div className="cancelled-info">
            <h4>Order Cancelled</h4>
            <p>This order has been cancelled and cannot be processed further</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="status-tracker">
      <div className="tracker-header">
        <h3>Order Progress</h3>
        <div className="estimated-time">
          <FaClock />
          <span>
            {status < 4 ? `Estimated: ${statusSteps[status].estimate}` : 'Order Complete'}
          </span>
        </div>
      </div>

      <div className="status-timeline">
        {statusSteps.map((step, index) => {
          const isActive = status === index;
          const isCompleted = status > index;

          return (
            <div
              key={step.label}
              className={`
                timeline-step 
                ${isActive ? 'active' : ''} 
                ${isCompleted ? 'completed' : ''}
              `}
              style={{ '--step-color': step.color } as React.CSSProperties}
            >
              <div className="step-indicator">
                <div className="step-icon">
                  {isCompleted ? <FaCheckCircle /> : step.icon}
                </div>
                <div className="step-line" />
              </div>

              <div className="step-content">
                <h4>{step.label}</h4>
                <p>{step.subLabel}</p>
                {isActive && (
                  <span className="current-status">Current Status</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {renderActions()}
      {renderDeliveryConfirmation()}

      {/* Payment Confirmation Dialog */}
      {renderOverlay()}
    </div>
  );
};

export default OrderStatusTracker;