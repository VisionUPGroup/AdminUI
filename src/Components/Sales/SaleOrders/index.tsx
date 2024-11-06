import React, { Fragment, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  FaShoppingCart,
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaStore,
  FaSearch,
  FaArrowUp,
  FaTruck,
  FaBox,
  FaExclamationCircle,
  FaSync,
} from "react-icons/fa";
import { useOrderService } from "../../../../Api/orderService";
import { useVoucherService } from "../../../../Api/voucherService";
import { useKioskService } from "../../../../Api/kioskService";
import { useLensService } from "../../../../Api/lensService";
import { usePaymentService } from "../../../../Api/paymentService";
import OrderStatusTracker from "./OderTracker";
import LensInformation from "./LensInformation";
import PaymentInfo from "./PaymentInfomation";
import "./OrderStyle.scss";

const SalesOrders: React.FC = () => {
  // States
  interface EyeGlassImage {
    id: number;
    eyeGlassID: number;
    angleView: number;
    url: string;
  }

  interface EyeGlass {
    id: number;
    eyeGlassTypeID: number;
    name: string;
    price: number;
    eyeGlassImages: EyeGlassImage[];
  }

  interface ProductGlass {
    id: number;
    eyeGlassID: number;
    leftLenID: number;
    rightLenID: number;
    accountID: number;
    total: number;
    status: boolean;
    eyeGlass: EyeGlass;
  }

  interface OrderDetail {
    id: number;
    orderID: number;
    quantity: number;
    status: boolean;
    productGlass?: ProductGlass;
  }
  interface Order {
    id: number;
    accountID: number;
    orderTime: string;
    status: boolean;
    receiverAddress: string;
    total: number;
    voucherID: number | null;
    voucherName: string | null;
    code: string;
    process: number;
    kiosks: number;
    isDeposit: boolean;
    totalPaid: number; // Thêm thuộc tính mới
    remainingAmount: number; // Thêm thuộc tính mới
    orderDetails: OrderDetail[];
  }
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<
    OrderDetail[]
  >([]);
  const [selectedOrderInfo, setSelectedOrderInfo] = useState<{
    orderId: number;
    voucherName: string | null;
    process: number;
    isDeposit: boolean;
    kiosks: number;
    kioskName?: string;
    total: number;
    receiverAddress: string;
  } | null>(null);
  const [lensInfo, setLensInfo] = useState<{ leftLens?: any; rightLens?: any }>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<{
    totalPaid: number;
    remainingAmount: number;
  } | null>(null);

  // Services
  const { fetchAllOrder } = useOrderService();
  const { fetchVoucherById } = useVoucherService();
  const { fetchKioskById } = useKioskService();
  const { fetchLensById } = useLensService();
  const { fetchPaymentByOrderId } = usePaymentService();

  // Fetch Initial Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllOrder();
      const formattedData = await Promise.all(
        data.map(async (order: any) => {
          const voucherResponse = order.voucherID
            ? await fetchVoucherById(order.voucherID)
            : null;
          const voucherName = voucherResponse ? voucherResponse.name : null;

          return {
            id: order.id,
            accountID: order.accountID,
            orderTime: new Date(order.orderTime).toLocaleString(),
            status: order.status,
            receiverAddress: order.receiverAddress,
            total: order.total,
            code: order.code,
            process: order.process,
            kiosks: order.kiosks,
            isDeposit: order.isDeposit,
            voucherID: order.voucherID,
            voucherName,
            totalPaid: order.totalPaid,
            remainingAmount: order.remainingAmount,
            orderDetails: order.orderDetails.map((detail: any) => ({
              ...detail,
              productGlass: detail.productGlass,
            })),
          };
        })
      );
      setOrderData(formattedData);
      setFilteredOrders(formattedData);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);
  };

  const handleStatusFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(event.target.value);
  };

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orderData;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.code.toLowerCase().includes(searchLower) ||
          order.id.toString().includes(searchLower) ||
          order.receiverAddress.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => {
        switch (statusFilter) {
          case "pending":
            return order.process === 0;
          case "processing":
            return order.process === 1 || order.process === 2;
          case "completed":
            return order.process === 4;
          case "cancelled":
            return order.process === 5;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orderData]);

  const handleOrderSelect = async (
    orderId: number,
    orderDetails: OrderDetail[],
    voucherName: string | null,
    process: number,
    isDeposit: boolean,
    kiosks: number,
    total: number,
    receiverAddress: string
  ) => {
    try {
      const kioskData = await fetchKioskById(kiosks);
      const paymentData = await fetchPaymentByOrderId(orderId);
      const leftLenID = orderDetails[0]?.productGlass?.leftLenID;
      const rightLenID = orderDetails[0]?.productGlass?.rightLenID;

      const [leftLens, rightLens] = await Promise.all([
        leftLenID ? await fetchLensById(leftLenID) : null,
        rightLenID ? await fetchLensById(rightLenID) : null,
      ]);

      setSelectedOrderDetails(orderDetails);
      setSelectedOrderInfo({
        orderId,
        voucherName,
        process,
        isDeposit,
        kiosks,
        kioskName: kioskData?.name || "Unknown Kiosk",
        total,
        receiverAddress,
      });
      setPaymentInfo({
        totalPaid: paymentData.totalPaid,
        remainingAmount: paymentData.remainingAmount,
      });
      setLensInfo({ leftLens, rightLens });
    } catch (error) {
      toast.error("Failed to load order details");
      console.error("Error loading order details:", error);
    }
  };

  // Utility Functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getOrderStatusColor = (process: number) => {
    switch (process) {
      case 0:
        return "#f59e0b"; // Pending
      case 1:
      case 2:
        return "#2563eb"; // Processing
      case 3:
        return "#8b5cf6"; // Delivered
      case 4:
        return "#10b981"; // Completed
      case 5:
        return "#ef4444"; // Cancelled
      default:
        return "#6b7280";
    }
  };

  const getOrderStatusLabel = (process: number) => {
    switch (process) {
      case 0:
        return "Pending";
      case 1:
        return "Processing";
      case 2:
        return "Shipping";
      case 3:
        return "Delivered";
      case 4:
        return "Completed";
      case 5:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="orders-dashboard">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="title-wrapper">
              <h1>
                Orders Management
                <p>Track and manage customer orders</p>
              </h1>
            </div>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by order code, address..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{orderData.length}</div>
              <div className="stat-label">Total Orders</div>
              <div className="stat-change">
                <FaArrowUp />
                12% from last month
              </div>
            </div>
            <FaShoppingCart className="stat-icon" />
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {formatCurrency(
                  orderData.reduce((sum, order) => sum + order.total, 0)
                )}
              </div>
              <div className="stat-label">Total Revenue</div>
              <div className="stat-change">
                <FaArrowUp />
                8% from last month
              </div>
            </div>
            <FaMoneyBillWave className="stat-icon" />
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {orderData.filter((order) => order.process === 4).length}
              </div>
              <div className="stat-label">Completed Orders</div>
              <div className="stat-change">
                <FaArrowUp />
                5% from last month
              </div>
            </div>
            <FaCheckCircle className="stat-icon" />
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Orders Table */}
          <div className="content-section orders-table">
            <div className="content-header">
              <h2>Recent Orders</h2>
              <div className="filters">
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="table-container">
              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading orders...</p>
                </div>
              ) : filteredOrders.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Order Info</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div className="order-id">
                            <span className="code">{order.code}</span>
                            <span className="time">
                              {new Date(order.orderTime).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="customer-info">
                            <span className="address">
                              <FaMapMarkerAlt />
                              {order.receiverAddress}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              background: `${getOrderStatusColor(
                                order.process
                              )}15`,
                              color: getOrderStatusColor(order.process),
                            }}
                          >
                            {getOrderStatusLabel(order.process)}
                          </span>
                        </td>
                        <td>
                          <div className="order-amount">
                            <span className="amount">
                              {formatCurrency(order.total)}
                            </span>
                            {order.isDeposit && (
                              <span className="deposit-badge">
                                <FaCheckCircle /> Deposited
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              className="view-btn"
                              onClick={() =>
                                handleOrderSelect(
                                  order.id,
                                  order.orderDetails,
                                  order.voucherName,
                                  order.process,
                                  order.isDeposit,
                                  order.kiosks,
                                  order.total,
                                  order.receiverAddress
                                )
                              }
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <FaExclamationCircle className="empty-icon" />
                  <h3>No Orders Found</h3>
                  <p>
                    {searchTerm
                      ? "No orders match your search criteria"
                      : "There are no orders to display"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Details Panel */}
          <div className="content-section order-details">
            {selectedOrderInfo ? (
              <>
                <div className="details-header">
                  <h2>Order Details</h2>
                  <div className="total-amount">
                    {formatCurrency(selectedOrderInfo.total)}
                  </div>
                </div>

                <div className="details-content">
                  <div className="info-section">
                    <div className="info-label">
                      <FaMapMarkerAlt /> Delivery Address
                    </div>
                    <div className="info-value">
                      {selectedOrderInfo.receiverAddress}
                    </div>
                  </div>

                  <div className="info-section">
                    <div className="info-label">
                      <FaTag /> Voucher Applied
                    </div>
                    <div className="info-value">
                      {selectedOrderInfo.voucherName || "No voucher applied"}
                    </div>
                  </div>

                  <div className="info-section">
                    <div className="info-label">
                      <FaStore /> Kiosk Location
                    </div>
                    <div className="info-value">
                      {selectedOrderInfo.kioskName}
                    </div>
                  </div>

                  <div className="info-section">
                    <div className="info-label">
                      <FaClock /> Order Status
                    </div>
                    <OrderStatusTracker
                      status={selectedOrderInfo.process}
                      orderId={selectedOrderInfo.orderId}
                      onStatusUpdate={(newStatus) => {
                        // Update local state after status change
                        setSelectedOrderInfo((prev) =>
                          prev
                            ? {
                                ...prev,
                                process: newStatus,
                              }
                            : null
                        );

                        // Update main orders list
                        setOrderData((prevOrders) =>
                          prevOrders.map((order) =>
                            order.id === selectedOrderInfo.orderId
                              ? { ...order, process: newStatus }
                              : order
                          )
                        );
                      }}
                    />
                  </div>

                  <div className="info-section">
                    <div className="info-label">
                      <FaMoneyBillWave /> Payment Status
                    </div>
                    <div className="status-wrapper">
                      <span
                        className={`status ${
                          selectedOrderInfo.isDeposit ? "success" : "pending"
                        }`}
                      >
                        {selectedOrderInfo.isDeposit ? (
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

                  {selectedOrderInfo && paymentInfo && (
                    <div className="info-section payment-details">
                      <PaymentInfo
                        totalAmount={selectedOrderInfo.total}
                        totalPaid={paymentInfo.totalPaid}
                        remainingAmount={paymentInfo.remainingAmount}
                        isDeposit={selectedOrderInfo.isDeposit}
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
                        {selectedOrderDetails.length} items
                      </span>
                    </div>
                    <div className="product-list">
                      {selectedOrderDetails.map((detail) => (
                        // Trong phần product items
                        <div className="product-item">
                          <div className="product-content">
                            <div className="product-image">
                              <img
                                src={
                                  detail.productGlass?.eyeGlass
                                    ?.eyeGlassImages[0]?.url ||
                                  "/placeholder-image.jpg"
                                }
                                alt={detail.productGlass?.eyeGlass?.name}
                              />
                            </div>
                            <div className="product-info">
                              <h4 title={detail.productGlass?.eyeGlass?.name}>
                                {detail.productGlass?.eyeGlass?.name}
                              </h4>
                              <div className="price">
                                {formatCurrency(
                                  detail.productGlass?.eyeGlass?.price || 0
                                )}
                              </div>
                              <div className="product-meta">
                                <span className="quantity">
                                  Qty: {detail.quantity}
                                </span>
                                <span
                                  className={`stock-status ${
                                    detail.status ? "success" : "pending"
                                  }`}
                                >
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
              </>
            ) : (
              <div className="no-selection">
                <FaShoppingCart className="icon" />
                <h3>No Order Selected</h3>
                <p>Select an order to view its details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="floating-actions">
  <button 
    className="refresh-btn"
    onClick={() => {
      fetchData();
      // Thêm hiệu ứng toast khi refresh
      toast.success('Data refreshed successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        icon: <FaSync />
      });
    }}
    disabled={isLoading}
  >
    <FaSync className={`icon ${isLoading ? 'spinning' : ''}`} />
    {isLoading ? 'Refreshing...' : 'Refresh Data'}
  </button>
</div>

      {/* Toast Container for Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default SalesOrders;
