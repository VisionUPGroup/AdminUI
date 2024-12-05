// OrderStatusTracker.tsx
import React from 'react';
import { toast } from 'react-toastify';
import {
  FaHourglassHalf,
  FaCog,
  FaTruck,
  FaBoxOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaArrowLeft,
  FaBan,
  FaSpinner,
  FaClock,
  FaExclamationTriangle,
  FaCreditCard,
  FaMoneyBillWave,
  FaInfoCircle
} from 'react-icons/fa';
import { useOrderService } from '../../../../Api/orderService';
import { usePaymentService } from '../../../../Api/paymentService';
import './OrderDetailStyle.scss';

interface OrderStatusTrackerProps {
  status: number;
  orderId: number;
  onStatusUpdate?: (newStatus: number) => void;
  onDeleteOrder?: (orderId: number) => void;
  totalAmount?: number;
  isDeposit?: boolean;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  status,
  orderId,
  onDeleteOrder,
  onStatusUpdate,
  totalAmount = 0,
  isDeposit = false
}) => {
  const { updateOrderProcess } = useOrderService();
  const { createPaymentUrl } = usePaymentService();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<number | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState<number>(totalAmount);

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
          paymentAmount
        }));
        
        window.location.href = response.paymentUrl;
      } else {
        throw new Error('Invalid payment URL received');
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Failed to create payment", {
        icon: <FaExclamationTriangle />
      });
    } finally {
      setIsUpdating(false);
      setShowPaymentDialog(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setIsUpdating(true);
      
      if (status !== 0) {
        toast.error("Only pending orders can be cancelled", {
          icon: <FaExclamationTriangle />
        });
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
      
      toast.success("Order cancelled successfully", {
        icon: <FaCheckCircle />
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order", {
        icon: <FaExclamationTriangle />
      });
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
      
      toast.success(`Order status updated to ${statusSteps[newStatus]?.label || 'Cancelled'}`, {
        icon: statusSteps[newStatus]?.icon || '🔄'
      });
      setShowConfirmation(false);
      setPendingStatus(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status", {
        icon: <FaExclamationTriangle />
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const initiateStatusUpdate = (newStatus: number) => {
    setPendingStatus(newStatus);
    setShowConfirmation(true);
  };

  // Kiểm tra xem trạng thái hiện tại có cho phép thanh toán không
  const isPaymentAllowed = status === 0 || status === 2;

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

      <div className="status-actions">
        {status < 4 && (
          <button
            className="action-btn next"
            onClick={() => initiateStatusUpdate(status + 1)}
            disabled={isUpdating}
          >
            Next Status
            <FaArrowRight />
          </button>
        )}
        
        {isPaymentAllowed && (
          <button
            className="action-btn payment"
            onClick={() => setShowPaymentDialog(true)}
            disabled={isUpdating}
          >
            <FaCreditCard />
            Make Payment
          </button>
        )}
        
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

      {/* Payment Confirmation Dialog */}
      {showPaymentDialog && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog payment-dialog">
            <h4>
              <FaMoneyBillWave className="dialog-icon" />
              Confirm Payment
            </h4>
            <div className="payment-details">
              <div className="amount-info">
                <span>Total Amount:</span>
                <span className="amount">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(totalAmount)}
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
                onClick={() => setShowPaymentDialog(false)}
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Confirmation Dialog */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
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
                {isUpdating ? <FaSpinner className="spinning" /> : 'Confirm'}
              </button>
              <button 
                className="dialog-btn cancel"
                onClick={() => {
                  setShowConfirmation(false);
                  setPendingStatus(null);
                }}
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTracker;