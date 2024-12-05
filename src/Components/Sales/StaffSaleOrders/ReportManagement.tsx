import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaFileAlt,
  FaEdit,
  FaExclamationTriangle,
  FaBug,
  FaQuestionCircle,
  FaCommentDots,
  FaUserCog,
  FaTimes,
  FaSearch,
  FaSpinner,
  FaPlus,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaPencilAlt,
} from "react-icons/fa";
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
} from "react-icons/md";
import { useReportService } from "../../../../Api/reportService";
import "./ReportManagementStyle.scss";

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
  profiles?: any[];
  orders?: any[];
  payments?: any[];
  ratingEyeGlasses?: any[];
  ratingLens?: any[];
}
interface Report {
  id: number;
  orderID: number;
  handler: Handler;
  description: string;
  feedback: string;
  status: number;
  type: number;
  createdTime?: string;
}

interface ReportManagementProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ReportManagement: React.FC<ReportManagementProps> = ({
  orderId,
  isOpen,
  onClose,
}) => {
  // States
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Pagination and Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    undefined
  );

  // Form states
  const [newReport, setNewReport] = useState({
    description: "",
    type: 0,
  });

  const [updateReport, setUpdateReport] = useState({
    feedback: "",
    status: 0,
  });

  // Services
  const { fetchReportByOrderId, createRePort, updateReportStatus } =
    useReportService();

  useEffect(() => {
    if (orderId) {
      fetchReports();
    }
  }, [orderId, currentPage, typeFilter, statusFilter]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetchReportByOrderId(
        orderId,
        statusFilter,
        typeFilter,
        currentPage
      );

      setReports(response.items);
      setTotalPages(Math.ceil(response.totalItems / 10)); // Assuming 10 items per page
    } catch (error) {
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setTypeFilter(undefined);
    setStatusFilter(undefined);
    setCurrentPage(1);
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
  // CRUD Operations
  const handleCreateReport = async () => {
    try {
      if (!newReport.description.trim()) {
        toast.warning("Please enter a description");
        return;
      }

      const reportData = {
        orderID: orderId,
        description: newReport.description,
        type: newReport.type,
      };

      await createRePort(reportData);
      toast.success("Report created successfully");
      setShowCreateModal(false);
      setNewReport({ description: "", type: 0 });
      fetchReports();
    } catch (error) {
      toast.error("Failed to create report");
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
      fetchReports();
    } catch (error) {
      toast.error("Failed to update report");
    }
  };

  // Pagination Controls
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={`report-management ${isOpen ? "open" : ""}`}>
      {/* Header Section with Filters */}
      <div className="report-header">
        <div className="header-content">
          <h2>Report Management</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <select
              value={typeFilter || ""}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="0">Product Issue</option>
              <option value="1">Shipping Issue</option>
              <option value="2">Customer Issue</option>
              <option value="3">Customer Service</option>
              <option value="4">Other</option>
            </select>

            <select
              value={statusFilter || ""}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="0">Request</option>
              <option value="1">Denied</option>
              <option value="2">Accepted</option>
            </select>

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
                      <div className={`report-type ${typeInfo.colorClass}`}>
                        {typeInfo.icon}
                        <span>{typeInfo.label}</span>
                      </div>
                      <div className={`report-status ${statusInfo.colorClass}`}>
                        {statusInfo.label}
                      </div>
                    </div>

                    <div className="report-content">
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
                      {report.feedback && (
                        <div className="feedback">
                          <strong>Feedback:</strong>
                          <p>{report.feedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="report-footer">
                      {report.status !== 2 && (
                        <button
                          className="update-btn"
                          onClick={() => {
                            setSelectedReport(report);
                            setUpdateReport({
                              feedback: report.feedback || "",
                              status: report.status,
                            });
                            setShowUpdateModal(true);
                          }}
                        >
                          <FaEdit /> Update
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls">
              <button
                className="page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>

              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FaChevronRight />
              </button>
            </div>
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
            <select
              value={newReport.type}
              onChange={(e) =>
                setNewReport({ ...newReport, type: Number(e.target.value) })
              }
            >
              <option value={0}>Product Issue</option>
              <option value={1}>Shipping Issue</option>
              <option value={2}>Customer Issue</option>
              <option value={3}>Customer Service</option>
              <option value={4}>Other</option>
            </select>
            <textarea
              value={newReport.description}
              onChange={(e) =>
                setNewReport({ ...newReport, description: e.target.value })
              }
              placeholder="Enter report description..."
            />
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
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
    </div>
  );
};

export default ReportManagement;
