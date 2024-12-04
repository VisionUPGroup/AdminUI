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
import { useRouter } from "next/navigation";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<{
    totalPaid: number;
    remainingAmount: number;
  } | null>(null);
  // Thêm các state mới

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
  orderId: ""
  });
  
  // Services
  const { fetchStaffOrder, countOrder, deleteOrder, updateOrderProcess } =
    useOrderService();
  const { fetchVoucherById } = useVoucherService();
  const { fetchKioskById } = useKioskService();
  const { fetchLensById } = useLensService();
  const { fetchPaymentByOrderId } = usePaymentService();
  const { fetchAccountById } = useAccountService();
  const router = useRouter();

  // Fetch Initial Data
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
      // Gọi API với các params filter
      const data = await fetchStaffOrder(
        filterOptions.fromDate, // Đã được format YYYY-MM-DD từ FilterSelects
        filterOptions.toDate,   // Đã được format YYYY-MM-DD từ FilterSelects
        searchTerm || '',
        statusFilter || '',
        currentPage,
        '', // accountId
        filterOptions.kioskId || '',
        filterOptions.placedByKioskId || '',
        filterOptions.shipperId || '',
        depositParam, // Sử dụng depositParam đã được xử lý
        filterOptions.issueType || '',
        filterOptions.orderId ||''
        
      );

      // Cập nhật tổng số items
      setTotalItems(data.totalItems || 0);

      // Format và xử lý data từ API
      const formattedData = await Promise.all(
        data.items.map(async (order: any) => {
          // Fetch thông tin voucher nếu có
          const voucherResponse = order.voucherID
            ? await fetchVoucherById(order.voucherID)
            : null;
          const voucherName = voucherResponse ? voucherResponse.name : null;

          // Fetch thông tin username
          let username = "Unknown";
          try {
            const accountResponse = await fetchAccountById(order.accountID);
            username = accountResponse?.username || "Unknown";
          } catch (error) {
            console.error(
              `Error fetching username for account ${order.accountID}:`,
              error
            );
          }

          // Format order data
          return {
            id: order.id,
            accountID: order.accountID,
            username,
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
              id: detail.id,
              orderID: detail.orderID,
              quantity: detail.quantity,
              status: detail.status,
              productGlass: detail.productGlass
                ? {
                    id: detail.productGlass.id,
                    eyeGlassID: detail.productGlass.eyeGlassID,
                    leftLenID: detail.productGlass.leftLenID,
                    rightLenID: detail.productGlass.rightLenID,
                    accountID: detail.productGlass.accountID,
                    total: detail.productGlass.total,
                    status: detail.productGlass.status,
                    eyeGlass: detail.productGlass.eyeGlass
                      ? {
                          id: detail.productGlass.eyeGlass.id,
                          eyeGlassTypeID:
                            detail.productGlass.eyeGlass.eyeGlassTypeID,
                          name: detail.productGlass.eyeGlass.name,
                          price: detail.productGlass.eyeGlass.price,
                          eyeGlassImages:
                            detail.productGlass.eyeGlass.eyeGlassImages?.map(
                              (image: any) => ({
                                id: image.id,
                                eyeGlassID: image.eyeGlassID,
                                angleView: image.angleView,
                                url: image.url,
                              })
                            ) || [],
                        }
                      : null,
                  }
                : null,
            })),
          };
        })
      );

      // Cập nhật state với data đã format
      setOrderData(formattedData);

      // Apply filters
      let filtered = formattedData;

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (order) =>
            (order.code?.toLowerCase().includes(searchLower)) ||  
            order.username?.toLowerCase().includes(searchLower) ||
            order.id.toString().includes(searchLower) ||
            order.receiverAddress?.toLowerCase().includes(searchLower)
        );
      }

      if (statusFilter !== "all") {
        filtered = filtered.filter((order) => {
          switch (statusFilter) {
            case "0":
              return order.process === 0; // Pending
            case "1":
              return order.process === 1; // Processing
            case "2":
              return order.process === 2; // Shipping
            case "3":
              return order.process === 3; // Delivered
            case "4":
              return order.process === 4; // Completed
            case "5":
              return order.process === 5; // Cancelled
            default:
              return true;
          }
        });
      }

      if (filterOptions.isDeposit !== null) {
        filtered = filtered.filter(
          (order) => order.isDeposit === filterOptions.isDeposit
        );
      }

      if (filterOptions.fromDate && filterOptions.toDate) {
        filtered = filtered.filter((order) => {
          const orderDate = new Date(order.orderTime);
          const fromDate = new Date(filterOptions.fromDate);
          const toDate = new Date(filterOptions.toDate);
          return orderDate >= fromDate && orderDate <= toDate;
        });
      }

      if (filterOptions.issueType) {
        filtered = filtered.filter((order) =>
          order.orderDetails.some(
            (detail: { issueType: string; }) => detail.issueType === filterOptions.issueType
          )
        );
      }

      setFilteredOrders(filtered);

      // Cập nhật revenue cho các đơn completed
      if (data.revenueCompleted) {
        setRevenueCompleted(data.revenueCompleted);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchRevenueCompleted = async () => {
    try {
      setIsLoading(true);

      const data = await fetchStaffOrder("", "4", "");
      setRevenueCompleted(data.revenueCompleted);
      setTotalItemsCompleted(data.totalItems);
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
          (order.code?.toLowerCase().includes(searchLower)) ||  // Thêm optional chaining
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
                All order
              </div>
            </div>
            <FaShoppingCart className="stat-icon" />
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {formatCurrency(revenueCompleted)}
              </div>
              <div className="stat-label">Total Revenue</div>
              <div className="stat-change">
                <FaMoneyBill />
                Revenue of order completed
              </div>
            </div>
            <FaMoneyBillWave className="stat-icon" />
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{totalItemsCompleted}</div>
              <div className="stat-label">Completed Orders</div>
              <div className="stat-change">
                <FaCheckCircle />
                Order completed
              </div>
            </div>
            <FaCheckCircle className="stat-icon" />
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
                                ID: {order.id}
                              </span>{" "}
                              {/* Thêm dòng này */}
                              <span className="username">
                                <FaUser /> {order.username}
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
                                {order.receiverAddress}
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
                                  router.push(`/en/sales/${order.id}`)
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
