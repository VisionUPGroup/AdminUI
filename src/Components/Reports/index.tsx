import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  MdBugReport,
  MdLocalShipping,
  MdSupportAgent,
  MdPeople,
  MdMoreHoriz,
  MdAssignment,
  MdPending,
  MdCancel,
  MdCheckCircle,
  MdProductionQuantityLimits,
  MdEmail,
  MdPhone,
  MdDescription,
  MdFeedback,
} from "react-icons/md";
import {
  FaFileAlt,
  FaEdit,
  FaSpinner,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useReportService } from "../../../Api/reportService";
import "./ReportManagementStyle.scss";
import { useOrderService } from "../../../Api/orderService";
import AddExchangeRequestModal from "./AddExchangeRequestModal";

interface Role {
  id?: number;
  name?: string;
}

interface Handler {
  id: number;
  username: string;
  email: string;
  status: boolean;
  roleID: number;
  phoneNumber: string;
  role?: Role | null;
}

interface Report {
  id: number;
  orderID: number;
  handler: Handler;
  description: string;
  evidenceImage: string;
  feedback: string;
  status: number;
  type: number;
  createdTime?: string;
}
interface PaginationResponse {
  items: Report[];
  totalItems: number;
  currentPage: number;
}
interface NewReport {
  orderID: number;
  description: string;
  type: number;
  image?: File;
  productGlassId?: number; // Thêm trường này
}

const ReportList: React.FC = () => {
  // States
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [orderFilter, setOrderFilter] = useState<number | undefined>(undefined);
  // Pagination and Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [totalItems, setTotalItems] = useState(0);
  const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    undefined
  );
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [selectedProductGlass, setSelectedProductGlass] = useState<string>("");
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedProductForExchange, setSelectedProductForExchange] = useState<
    number | null
  >(null);
  const [reportForExchange, setReportForExchange] = useState<Report | null>(
    null
  );
  const [newReport, setNewReport] = useState<NewReport>({
    orderID: 0, // Thay đổi từ "" sang 0
    description: "",
    type: 0,
    productGlassId: undefined,
  });

  const [updateReport, setUpdateReport] = useState({
    feedback: "",
    status: 0,
  });
  // Thêm vào phần khai báo state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Services
  const {
    fetchReportByOrderId: fetchReports,
    createRePort,
    updateReportStatus,
  } = useReportService();
  const { fetchOrderById } = useOrderService();
  useEffect(() => {
    fetchReportsList();
  }, [currentPage, typeFilter, statusFilter, orderFilter]); // Thêm các dependencies
  useEffect(() => {
    if (showExchangeModal) {
      console.log("Modal State:", {
        isOpen: showExchangeModal,
        reportId: selectedReport?.id,
        productGlassId: selectedProductForExchange,
      });
    }
  }, [showExchangeModal, selectedReport, selectedProductForExchange]);
  const handleExchangeSubmit = async (data: {
    productGlassID: number | null;
    receiverAddress: string;
    kioskID: number | null;
    reason: string;
    quantity: number;
  }) => {
    try {
      // Xử lý logic exchange ở đây
      // Có thể gọi API để tạo exchange request
      toast.success("Exchange request created successfully");
    } catch (error) {
      console.error("Error creating exchange request:", error);
      toast.error("Failed to create exchange request");
    }
  };
  const fetchReportsList = async () => {
    try {
      setIsLoading(true);

      const response = await fetchReports(
        orderFilter || null, // Đảm bảo gửi null nếu không có filter
        statusFilter,
        typeFilter,
        currentPage // BE thường tính page từ 0, FE hiển thị từ 1
      );

      if (response) {
        setReports(response.items);
        setTotalItems(response.totalItems);

        // Nếu trang hiện tại lớn hơn tổng số trang và không có data
        const maxPage = Math.ceil(response.totalItems / 10);
        if (currentPage > maxPage && response.totalItems > 0) {
          setCurrentPage(maxPage);
        }
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
      setReports([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setTypeFilter(undefined);
    setStatusFilter(undefined);
    setOrderFilter(undefined);
    setCurrentPage(1); // Reset về trang 1
  };
  const clearForm = () => {
    setNewReport({
      orderID: 0, // Reset về 0 thay vì ""
      description: "",
      type: 0,
      productGlassId: undefined,
    });
    setOrderDetails(null);
    setSelectedProductGlass("");
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleOrderIdChange = async (value: number) => {
    try {
      setNewReport((prev) => ({ ...prev, orderID: value })); // Giữ nguyên là number

      if (value > 0) {
        const orderData = await fetchOrderById(value);
        console.log("Order data:", orderData);
        setOrderDetails(orderData);
      } else {
        setOrderDetails(null);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setOrderDetails(null);
    }
  };
  // Report Type and Status Label Functions
  const getReportTypeLabel = (type: number) => {
    switch (type) {
      case 0:
        return {
          label: "Product Issue",
          icon: <MdProductionQuantityLimits />,
          colorClass: "type-system",
        };
      case 1:
        return {
          label: "Shipping Issue",
          icon: <MdLocalShipping />,
          colorClass: "type-customer",
        };
      case 2:
        return {
          label: "Customer Issue",
          icon: <MdPeople />,
          colorClass: "type-product",
        };
      case 3:
        return {
          label: "Customer Service",
          icon: <MdSupportAgent />,
          colorClass: "type-service",
        };
      case 4:
        return {
          label: "Other",
          icon: <MdMoreHoriz />,
          colorClass: "type-staff",
        };
      default:
        return {
          label: "Unknown",
          icon: <MdAssignment />,
          colorClass: "type-unknown",
        };
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return {
          label: "Request",
          icon: <MdPending />,
          colorClass: "status-pending",
        };
      case 1:
        return {
          label: "Denied",
          icon: <MdCancel />,
          colorClass: "status-processing",
        };
      case 2:
        return {
          label: "Accepted",
          icon: <MdCheckCircle />,
          colorClass: "status-resolved",
        };
      default:
        return {
          label: "Unknown",
          icon: <MdAssignment />,
          colorClass: "status-unknown",
        };
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Kiểm tra file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Set file trực tiếp, không cần tạo File mới
      setSelectedImage(file);

      // Tạo preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  const clearImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    // Xóa image khỏi state newReport
    setNewReport((prev) => {
      const { image, ...rest } = prev;
      return rest;
    });
  };

  // CRUD Operations
  const handleCreateReport = async () => {
    try {
      if (!newReport.description.trim()) {
        toast.warning("Please enter a description");
        return;
      }

      // Không cần parse nữa vì orderID đã là number
      if (newReport.orderID <= 0) {
        toast.warning("Please enter a valid Order ID");
        return;
      }

      // Create FormData object
      const formData = new FormData();

      // Append các field theo đúng API spec - chuyển number sang string khi append
      formData.append("orderID", newReport.orderID.toString()); // Chuyển number sang string
      formData.append("description", newReport.description.trim());
      formData.append("type", newReport.type.toString());

      // Thêm productGlassId nếu có và type là Product Issue
      if (newReport.type === 0) {
        if (!selectedProductGlass) {
          toast.warning("Please select a product");
          return;
        }
        formData.append("productGlassId", selectedProductGlass);
      }

      // Append image nếu có
      if (selectedImage instanceof File) {
        formData.append("image", selectedImage);
      }

      const response = await createRePort(formData);
      console.log("Create report response:", response);

      toast.success("Report created successfully");
      setShowCreateModal(false);
      clearForm();
      fetchReportsList();
    } catch (error) {
      console.error("Create report error:", error);
      toast.error(error.response?.data?.[0] || "Failed to create report");
    }
  };
  const handleUpdateReport = async () => {
    try {
      if (!selectedReport) return;

      const updateData = {
        id: selectedReport.id,
        feedback: updateReport.feedback,
        status: updateReport.status,
      };

      await updateReportStatus(updateData);
      toast.success("Report updated successfully");
      setShowUpdateModal(false);
      setSelectedReport(null);
      setUpdateReport({ feedback: "", status: 0 });
      fetchReportsList();
    } catch (error) {
      toast.error(error.response.data[0]);
    }
  };

  // Pagination Controls
  const handlePageChange = (newPage: number) => {
    console.log("Changing to page:", newPage); // Debug
    const totalPages = Math.ceil(totalItems / 10);

    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const handleExchangeClick = (report: Report) => {
    console.log("Report clicked for exchange:", report); // Debug log

    if (!report || !report.description) {
      toast.error("Invalid report data");
      return;
    }

    setReportForExchange(report);
    setShowExchangeModal(true);
  };

  return (
    <div className="report-management">
      {/* Header Section with Filters */}
      <div className="report-header">
        <div className="header-content">
          <h2>Report Management</h2>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <div className="filter-item">
              <label htmlFor="orderFilter">Order ID</label>
              <input
                id="orderFilter"
                type="number"
                className="filter-input"
                value={orderFilter || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? parseInt(e.target.value)
                    : undefined;
                  setOrderFilter(value);
                }}
                placeholder="Filter by Order ID"
                min="1"
              />
            </div>

            <div className="filter-item">
              <label htmlFor="typeFilter">Type</label>
              <select
                id="typeFilter"
                value={typeFilter ?? ""} // Sử dụng nullish coalescing
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : Number(e.target.value);
                  setTypeFilter(value);
                }}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="0">Product Issue</option>
                <option value="1">Shipping Issue</option>
                <option value="2">Customer Issue</option>
                <option value="3">Customer Service</option>
                <option value="4">Other</option>
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="statusFilter">Status</label>
              <select
                id="statusFilter"
                value={statusFilter ?? ""} // Sử dụng nullish coalescing
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : Number(e.target.value);
                  setStatusFilter(value);
                }}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="0">Request</option>
                <option value="1">Denied</option>
                <option value="2">Accepted</option>
              </select>
            </div>
            <button className="reset-filters-btn" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>

          <button
            className="create-report-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus /> New Report
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="reports-container">
        {isLoading ? (
          <div className="loading-state">
            <FaSpinner className="spinning" />
            <p>Loading reports...</p>
          </div>
        ) : reports.length > 0 ? (
          <>
            <div className="reports-list">
              {reports.map((report) => {
                const typeInfo = getReportTypeLabel(report.type);
                const statusInfo = getStatusLabel(report.status);

                return (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <div className="report-ids">
                        <div className="report-id">
                          <strong>Report ID:</strong> #{report.id}
                        </div>
                        <div className="order-id">
                          <strong>Order ID:</strong> #{report.orderID}
                        </div>
                        <div className="report-type-status">
                          <div className={`report-type ${typeInfo.colorClass}`}>
                            {typeInfo.icon} {typeInfo.label}
                          </div>
                        </div>
                      </div>
                      <div className={`report-status ${statusInfo.colorClass}`}>
                        {statusInfo.label}
                      </div>
                    </div>

                    <div className="report-content">
                      <div className="order-info">
                        <strong>Order ID: </strong>
                        <span>{report.orderID}</span>
                      </div>

                      {report.handler && (
                        <div className="handler-info">
                          <div className="handler-title">
                            <MdSupportAgent />
                            <h4>Handler Information</h4>
                          </div>
                          <span className="handler-name">
                            <MdPeople /> {report.handler.username}
                          </span>
                          <span className="handler-contact">
                            <span className="handler-email">
                              <MdEmail /> {report.handler.email}
                            </span>
                            <span className="handler-phone">
                              <MdPhone /> {report.handler.phoneNumber}
                            </span>
                          </span>
                        </div>
                      )}

                      <div className="description-section">
                        <div className="description-title">
                          <MdDescription />
                          <h4>Issue Description</h4>
                        </div>
                        <p className="description">{report.description}</p>
                      </div>
                      {report.evidenceImage && (
                        <div className="evidence-image-section">
                          <h4>Evidence Image</h4>
                          <div className="image-container">
                            <img
                              src={report.evidenceImage}
                              alt="Report evidence"
                              className="evidence-image"
                              onClick={() =>
                                window.open(report.evidenceImage, "_blank")
                              }
                            />
                          </div>
                        </div>
                      )}

                      {report.feedback && (
                        <div className="feedback-section">
                          <div className="feedback-header">
                            <MdFeedback className="feedback-icon" />
                            <h4>Feedback from Handler</h4>
                          </div>
                          <div className="feedback-content">
                            <pre>{report.feedback}</pre>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="report-footer">
                      {report.status !== 2 && (
                        <button
                          className="update-btn"
                          onClick={() => {
                            setSelectedReport(report);
                            // Reset updateReport state với giá trị mới
                            setUpdateReport({
                              feedback: "", // Không lấy report.feedback nữa
                              status: 0, // Set về giá trị mặc định 0
                            });
                            setShowUpdateModal(true);
                          }}
                        >
                          <FaEdit /> Update
                        </button>
                      )}
                      {report.status === 2 && report.type === 0 && (
                        <button
                          className="exchange-btn"
                          onClick={() => handleExchangeClick(report)}
                        >
                          <MdLocalShipping /> Exchange Eyeglass
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {reports.length > 0 && totalItems > 10 && (
              <div className="pagination-controls">
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <FaChevronLeft />
                </button>

                <span className="page-info">
                  {`Page ${currentPage} of ${Math.ceil(totalItems / 10)}`}
                </span>

                <button
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalItems / 10)}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <FaFileAlt />
            <h3>No Reports Found</h3>
            <p>Create a new report to get started</p>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Report</h3>
            <div className="order-input-group">
              <label htmlFor="orderInput">Order ID</label>
              <input
                id="orderInput"
                type="number"
                className="order-input"
                value={newReport.orderID || ""} // Thêm || '' để tránh hiển thị 0
                onChange={(e) => {
                  // Chuyển đổi value thành number
                  const value =
                    e.target.value === "" ? 0 : parseInt(e.target.value);

                  // Cập nhật giá trị input
                  setNewReport((prev) => ({ ...prev, orderID: value }));

                  // Fetch order data nếu giá trị hợp lệ
                  if (value > 0) {
                    handleOrderIdChange(value);
                  } else {
                    setOrderDetails(null);
                  }
                }}
                placeholder="Enter Order ID"
                min="1"
              />
            </div>

            <div className="type-select-group">
              <label htmlFor="typeSelect">Report Type</label>
              <select
                id="typeSelect"
                value={newReport.type}
                onChange={(e) =>
                  setNewReport({ ...newReport, type: parseInt(e.target.value) })
                }
                required
              >
                <option value={0}>Product Issue</option>
                <option value={1}>Shipping Issue</option>
                <option value={2}>Customer Issue</option>
                <option value={3}>Customer Service</option>
                <option value={4}>Other</option>
              </select>
            </div>

            {/* New ProductGlass Dropdown */}
            {newReport.type === 0 &&
              orderDetails &&
              orderDetails.orderDetails && (
                <div className="product-select-group">
                  <label htmlFor="productSelect">Select Product</label>
                  <select
                    id="productSelect"
                    value={selectedProductGlass}
                    onChange={(e) => setSelectedProductGlass(e.target.value)}
                    required
                  >
                    <option value="">Select a product</option>
                    {orderDetails.orderDetails.map((detail: any) => (
                      <option
                        key={detail.productGlass.id}
                        value={detail.productGlass.id}
                      >
                        ID: {detail.productGlass.id} -{" "}
                        {detail.productGlass.eyeGlass.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            <div className="image-upload-group">
              <label htmlFor="imageInput">Upload Image (optional)</label>
              <div className="image-upload-container">
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-input"
                />
                {imagePreview && (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="clear-image-btn"
                      onClick={clearImage}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="description-input-group">
              <label htmlFor="descriptionInput">Description</label>
              <textarea
                id="descriptionInput"
                value={newReport.description}
                onChange={(e) =>
                  setNewReport({ ...newReport, description: e.target.value })
                }
                placeholder="Enter report description..."
                required
              />
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedReport(null);
                  // Reset form khi đóng
                  setUpdateReport({
                    feedback: "",
                    status: 0,
                  });
                }}
              >
                Cancel
              </button>
              <button className="submit-btn" onClick={handleCreateReport}>
                Create Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Report Modal */}
      {showUpdateModal && selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Report</h3>
            <select
              value={updateReport.status}
              onChange={(e) =>
                setUpdateReport({
                  ...updateReport,
                  status: Number(e.target.value),
                })
              }
            >
              <option value={0}>Request</option>
              <option value={1}>Denied</option>
              <option value={2}>Accepted</option>
            </select>
            <textarea
              value={updateReport.feedback}
              onChange={(e) =>
                setUpdateReport({ ...updateReport, feedback: e.target.value })
              }
              placeholder="Enter feedback..."
            />
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </button>
              <button className="submit-btn" onClick={handleUpdateReport}>
                Update Report
              </button>
            </div>
          </div>
        </div>
      )}
      <AddExchangeRequestModal
        isOpen={showExchangeModal}
        toggle={() => {
          setShowExchangeModal(false);
          setReportForExchange(null);
        }}
        reportId={reportForExchange?.id || null}
        productGlassId={
          selectedProductGlass ? parseInt(selectedProductGlass) : null
        }
      />
    </div>
  );
};

export default ReportList;
