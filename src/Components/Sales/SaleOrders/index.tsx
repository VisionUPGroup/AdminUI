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
  FaFirstOrder,
  FaMoneyBill,
  FaTiktok,
  FaExclamationTriangle,
  FaBan,
  FaUser,
  FaClipboardCheck,
  FaArrowLeft,
} from "react-icons/fa";
import { useOrderService } from "../../../../Api/orderService";
import { useVoucherService } from "../../../../Api/voucherService";
import { useKioskService } from "../../../../Api/kioskService";
import { useLensService } from "../../../../Api/lensService";
import { usePaymentService } from "../../../../Api/paymentService";
import { useAccountService } from "../../../../Api/accountService";

import "./OrderStyle.scss";
import "./FilterStyle.scss";
import Pagination from "./Pagination";
import FilterSelects from "./FilterSelect";
import ReportManagement from "./ReportManagement";
import { useRouter, useSearchParams } from "next/navigation";

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
  interface OrderStatusStats {
    count: number;
    revenue: number;
  }
  interface AllOrderStats {
    pending: OrderStatusStats;
    processing: OrderStatusStats;
    shipping: OrderStatusStats;
    delivered: OrderStatusStats;
    completed: OrderStatusStats;
    cancelled: OrderStatusStats;
  }
  interface Order {
    id: number;
    accountID: number;
    username?: string; // Thêm trường này
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
  interface FilterOptions {
    fromDate: string;
    toDate: string;
    isDeposit: boolean | null;
    issueType: string;
    placedByKioskId?: string;
    shipperId?: string;
    kioskId?: string;
    orderId?: string;
  }
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountId = searchParams.get("accountId");
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<
    OrderDetail[]
  >([]);

  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>();
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
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<{
    totalPaid: number;
    remainingAmount: number;
  } | null>(null);
  // Thêm các state mới
  const [orderStats, setOrderStats] = useState({
    completed: {
      count: 0,
      revenue: 0,
    },
    canceled: {
      count: 0,
      revenue: 0,
    },
  });

  const [totalItems, setTotalItems] = useState(0);
  const [totalItemsCompleted, setTotalItemsCompleted] = useState(0);
  const [revenueCompleted, setRevenueCompleted] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [kioskFilter, setKioskFilter] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    fromDate: "",
    toDate: "",
    isDeposit: null,
    issueType: "",
    placedByKioskId: "",
    shipperId: "",
    kioskId: "",
    orderId: "",
  });
  const [revenueCanceled, setRevenueCanceled] = useState(0);

  const [totalItemsCanceled, setTotalItemsCanceled] = useState(0);
  const [orderUsernames, setOrderUsernames] = useState<{
    [key: number]: string;
  }>({});

  // Services
  const { fetchAllOrder, countOrder, deleteOrder, updateOrderProcess } =
    useOrderService();
  const { fetchVoucherById } = useVoucherService();
  const { fetchKioskById } = useKioskService();
  const { fetchLensById } = useLensService();
  const { fetchPaymentByOrderId } = usePaymentService();
  const { fetchAccountById } = useAccountService();

  // Fetch Initial Data
  useEffect(() => {
    if (accountId) {
      fetchCustomerInfo();
    }
  }, [accountId]);
  const fetchCustomerInfo = async () => {
    try {
      const customerData = await fetchAccountById(parseInt(accountId!));
      setCustomerInfo(customerData);
    } catch (error) {
      console.error("Error fetching customer info:", error);
      toast.error("Failed to fetch customer information");
    }
  };
  useEffect(() => {
    fetchData();
    fetchRevenueCompleted();
    totalOrderCounting();
  }, [searchTerm, statusFilter, currentPage, kioskFilter]);

  const handleKioskSelect = (kioskId: string) => {
    setKioskFilter(kioskId);
    setCurrentPage(1);
  };
  const totalOrderCounting = async () => {
    const data = await countOrder();
    try {
      setTotalItems(data);
    } catch (error) {
      console.error("Error counting order:", error);
    }
  };
  const fetchData = async () => {
    try {
      setIsLoading(true);
      let depositParam = undefined;
      if (filterOptions.isDeposit !== null) {
        depositParam = filterOptions.isDeposit ? "true" : "false";
      }

      // Fetch main orders data
      const data = await fetchAllOrder(
        filterOptions.fromDate,
        filterOptions.toDate,
        searchTerm || "",
        statusFilter || "",
        currentPage,
        accountId || "",
        filterOptions.kioskId || "",
        filterOptions.placedByKioskId || "",
        filterOptions.shipperId || "",
        depositParam,
        filterOptions.issueType || "",
        filterOptions.orderId || ""
      );

      // Fetch usernames for all orders
      const usernamePromises = data.items.map(
        async (order: { accountID: any; id: any }) => {
          try {
            const userData = await fetchAccountById(order.accountID);
            return { orderId: order.id, username: userData.username };
          } catch (error) {
            console.error(
              `Error fetching username for order ${order.id}:`,
              error
            );
            return { orderId: order.id, username: "Unknown User" };
          }
        }
      );

      const usernameResults = await Promise.all(usernamePromises);
      const usernameMap = usernameResults.reduce(
        (acc, { orderId, username }) => {
          acc[orderId] = username;
          return acc;
        },
        {}
      );

      // Fetch completed orders stats
      const completedData = await fetchAllOrder(
        filterOptions.fromDate,
        filterOptions.toDate,
        "",
        "4", // completed status
        1,
        accountId || "",
        filterOptions.kioskId || "",
        filterOptions.placedByKioskId || "",
        filterOptions.shipperId || "",
        depositParam,
        filterOptions.issueType || "",
        filterOptions.orderId || ""
      );

      // Fetch cancelled orders stats
      const canceledData = await fetchAllOrder(
        filterOptions.fromDate,
        filterOptions.toDate,
        "",
        "5", // cancelled status
        1,
        accountId || "",
        filterOptions.kioskId || "",
        filterOptions.placedByKioskId || "",
        filterOptions.shipperId || "",
        depositParam,
        filterOptions.issueType || "",
        filterOptions.orderId || ""
      );

      // Update all states
      setOrderUsernames(usernameMap);
      setOrderData(data.items);
      setTotalItems(data.totalItems || 0);

      setOrderStats({
        completed: {
          count: completedData.totalItems || 0,
          revenue: completedData.revenueCompleted || 0,
        },
        canceled: {
          count: canceledData.totalItems || 0,
          revenue: canceledData.revenueCompleted || 0,
        },
      });

      // Calculate total revenue
      const totalRevenue =
        (completedData.revenueCompleted || 0) +
        (canceledData.revenueCompleted || 0);

      // Update revenue states if you have them
      setRevenueCompleted(completedData.revenueCompleted || 0);
      setRevenueCanceled(canceledData.revenueCompleted || 0);

      // Update count states
      setTotalItemsCompleted(completedData.totalItems || 0);
      setTotalItemsCanceled(canceledData.totalItems || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Show error toast with more specific message
      if (error.response) {
        toast.error(`Failed to fetch orders: ${error.response.data.message}`);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to fetch orders. Please try again.");
      }

      // Reset states on error
      setOrderData([]);
      setTotalItems(0);
      setOrderStats({
        completed: { count: 0, revenue: 0 },
        canceled: { count: 0, revenue: 0 },
      });
      setOrderUsernames({});
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRevenueCompleted = async () => {
    try {
      setIsLoading(true);

      // Fetch completed orders data
      const [completedData, canceledData] = await Promise.all([
        fetchAllOrder(
          "", // fromDate
          "", // toDate
          "", // username
          "4", // process status - completed
          1, // pageIndex
          "", // accountId
          "", // kioskId
          "", // placedByKioskId
          "" // shipperId
        ),
        fetchAllOrder(
          "", // fromDate
          "", // toDate
          "", // username
          "5", // process status - canceled
          1, // pageIndex
          "", // accountId
          "", // kioskId
          "", // placedByKioskId
          "" // shipperId
        ),
      ]);

      setOrderStats({
        completed: {
          count: completedData.totalItems || 0,
          revenue: completedData.revenueCompleted || 0,
        },
        canceled: {
          count: canceledData.totalItems || 0,
          revenue: canceledData.revenueCompleted || 0,
        },
      });
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  // Handlers
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);
    setCurrentPage(1); // Reset về trang 1 khi search
  };
  const handleStatusFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi status
  };
  const handleDeleteOrder = async (orderId: number) => {
    try {
      await deleteOrder(orderId);

      // Cập nhật lại danh sách orders sau khi xóa
      setOrderData((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );

      // Cập nhật filtered orders
      setFilteredOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );

      // Giảm tổng số order
      setTotalItems((prev) => prev - 1);

      // Clear selected order nếu đang xem order bị xóa
      if (selectedOrderInfo?.orderId === orderId) {
        setSelectedOrderInfo(null);
        setSelectedOrderDetails([]);
        setLensInfo({});
        setPaymentInfo(null);
      }

      toast.success("Order deleted successfully", {
        icon: <FaBan />,
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order", {
        icon: <FaExclamationTriangle />,
      });
    }
  };

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orderData;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.code?.toLowerCase().includes(searchLower) || // Thêm optional chaining
          order.username?.toLowerCase().includes(searchLower) ||
          order.id.toString().includes(searchLower) ||
          order.receiverAddress?.toLowerCase().includes(searchLower)
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
    // Khi filter thay đổi, reset về trang 1
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
        {accountId && customerInfo && (
          <div className="customer-view-header">
            <button className="back-button" onClick={() => router.back()}>
              <FaArrowLeft /> Back to Users
            </button>
            <div className="customer-info">
              <h2>Orders for Customer: {customerInfo.username}</h2>
              <div className="customer-details">
                <span>
                  <FaUser /> ID: {customerInfo.id}
                </span>
                <span>Email: {customerInfo.email}</span>
                <span>Phone: {customerInfo.phoneNumber}</span>
              </div>
            </div>
          </div>
        )}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="title-wrapper">
              <h1>
                {accountId ? "Customer Orders" : "Orders Management"}
                <p>
                  {accountId
                    ? "View and manage customer specific orders"
                    : "Track and manage customer orders"}
                </p>
              </h1>
            </div>
          </div>
          <div className="header-actions">
            {/* <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by username"
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <FilterSelects
              onKioskSelect={handleKioskSelect}
              selectedKiosk={kioskFilter}
              onReset={() => {
                setKioskFilter("");
                setCurrentPage(1);
                toast.success("Filter has been reset");
              }}
            /> */}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{totalItems}</div>
              <div className="stat-label">Total Orders</div>
              <div className="stat-change">
                <FaFirstOrder />
                All Orders
              </div>
            </div>
            <FaShoppingCart className="stat-icon" />
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {formatCurrency(orderStats.completed.revenue)}
              </div>
              <div className="stat-label">Completed Orders Revenue</div>
              <div className="stat-change">
                <FaCheckCircle />
                {orderStats.completed.count} Orders completed
              </div>
            </div>
            <FaMoneyBillWave className="stat-icon" />
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {formatCurrency(orderStats.canceled.revenue)}
              </div>
              <div className="stat-label">Canceled Orders Revenue</div>
              <div className="stat-change">
                <FaTimesCircle />
                {orderStats.canceled.count} Orders canceled
              </div>
            </div>
            <FaMoneyBillWave className="stat-icon" />
          </div>
        </div>

        {selectedOrderId && (
          <ReportManagement
            orderId={selectedOrderId}
            isOpen={isReportModalOpen}
            onClose={() => {
              setIsReportModalOpen(false);
              setSelectedOrderId(0);
            }}
          />
        )}
        {/* Content Grid */}
        <div className="content-grid">
          {/* Orders Table */}

          <div className="content-section orders-table">
            <div className="search-filter-section">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by username"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
              <FilterSelects
                onFilterChange={(newFilters) => {
                  setFilterOptions({
                    ...filterOptions,
                    ...newFilters,
                  });
                  setCurrentPage(1); // Reset về trang 1 khi thay đổi filter
                }}
                selectedKiosk={kioskFilter}
                onReset={() => {
                  setKioskFilter("");
                  setFilterOptions({
                    fromDate: "",
                    toDate: "",
                    isDeposit: null,
                    issueType: "",
                  });
                  setCurrentPage(1);
                  toast.success("Filter has been reset");
                }}
              />
            </div>
            <div className="content-header">
              <h2>Recent Orders</h2>
              <div className="order-stats">
                <span className="total-orders">
                  Showing {orderData.length} of {totalItems} orders
                </span>
                <div className="filters">
                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="">All Orders</option>
                    <option value="0">Pending</option>
                    <option value="1">Processing</option>
                    <option value="2">Shipping</option>
                    <option value="3">Delivered</option>
                    <option value="4">Completed</option>
                    <option value="5">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="table-container">
              {isLoading ? (
                // Loading state
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading orders...</p>
                </div>
              ) : filteredOrders.length > 0 ? (
                // Table hiển thị data
                <>
                  <table>
                    <thead>
                      <tr>
                        <th>Order Info</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <div className="order-id">
                              {/* <span className="code">{order.code}</span> */}
                              <span className="order-number">
                                Order ID: {order.id}
                              </span>{" "}
                              {/* Thêm dòng này */}
                              <span className="username">
                                Account ID: {order.accountID}
                              </span>
                              <span className="username">
                                <FaUser />{" "}
                                {orderUsernames[order.id] || "Loading..."}
                              </span>
                              <span className="time">
                                {new Date(order.orderTime).toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="customer-info">
                              <span className="address">
                                <FaMapMarkerAlt />
                                {order.receiverAddress||"Kiosk Address"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                order.status ? "active" : "inactive"
                              }`}
                            >
                              {order.status ? "Active" : "Inactive"}
                            </span>
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
                                  router.push(
                                    `/en/sales/admin-orderdetail/${order.id}`
                                  )
                                }
                              >
                                View Details
                              </button>
                              <button
                                className="report-btn"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setIsReportModalOpen(true);
                                }}
                              >
                                View Reports
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / 20)}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                // Empty state khi không có data
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
        </div>
      </div>

      {/* Additional Features */}
      <div className="floating-actions">
        <button
          className="refresh-btn"
          onClick={() => {
            fetchData();
            // Thêm hiệu ứng toast khi refresh
            toast.success("Data refreshed successfully!", {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              icon: <FaSync />,
            });
          }}
          disabled={isLoading}
        >
          <FaSync className={`icon ${isLoading ? "spinning" : ""}`} />
          {isLoading ? "Refreshing..." : "Refresh Data"}
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
