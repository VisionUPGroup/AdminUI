import React, { useEffect, useState } from "react";
import { useOrderService } from "../../../../Api/orderService";
import { FaList } from "react-icons/fa";
import "./KioskStyle.scss";

interface ProcessStatus {
  label: string;
  color: string;
}

interface OrderDetail {
  id: number;
  orderID: number;
  quantity: number;
  status: boolean;
  productGlass: any; // Add specific type if needed
}

interface Order {
  id: number;
  accountID: number;
  orderTime: string;
  status: boolean;
  receiverAddress: string;
  total: number;
  voucherID: number | null;
  code: string;
  process: number;
  kiosks: number;
  isDeposit: boolean;
  orderDetails: OrderDetail[];
}

interface OrderListModalProps {
  isOpen: boolean;
  toggle: () => void;
  kioskId: number | null;
  kioskName: string | null;
}

const OrderListModal: React.FC<OrderListModalProps> = ({
  isOpen,
  toggle,
  kioskId,
  kioskName,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { fetchAllOrder } = useOrderService();

  const getProcessStatus = (process: number): ProcessStatus => {
    const statuses: { [key: number]: ProcessStatus } = {
      0: { label: "Pending", color: "#f0ad4e" },
      1: { label: "Processing", color: "#5bc0de" },
      2: { label: "Shipping", color: "#0275d8" },
      3: { label: "Delivered", color: "#5cb85c" },
      4: { label: "Canceled", color: "#d9534f" },
    };
    return statuses[process] || { label: "Unknown", color: "#777" };
  };

  useEffect(() => {
    const loadOrders = async () => {
      if (!kioskId) return;

      setLoading(true);
      try {
        const response = await fetchAllOrder(
          "",
          "",
          "",
          "",
          kioskId
        );
        setOrders(response.items);
        setTotalPages(Math.ceil(response.totalItems / 20));
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [kioskId, currentPage]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Orders for {kioskName}</h2>
            <button onClick={toggle} className="close-btn">
              &times;
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Order Code</th>
                    <th>Order Time</th>
                    <th>Total</th>
                    <th>Process</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const processStatus = getProcessStatus(order.process);
                    return (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.code}</td>
                        <td>{formatDate(order.orderTime)}</td>
                        <td>{order.total.toLocaleString()} đ</td>
                        <td>
                          <span
                            className="process-badge"
                            style={{
                              backgroundColor: `${processStatus.color}15`,
                              color: processStatus.color,
                            }}
                          >
                            {processStatus.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No orders found for this kiosk</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderListModal;
