import React, { Fragment, useEffect, useState } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Alert,
  Input,
} from "reactstrap";
import { useExchangeEyeGlassService } from "../../../../Api/exchangeEyeGlassService";
import CheckProductGlassModal from "./CheckProductGlassModal";
import ViewExchangeDetailModal from "./ViewExchangeDetailModal";
import AddExchangeRequestModal from "./AddExchangeRequestModal";
import DeleteModal from "./DeleteModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ExchangeEyeGlass.scss";
import {
  CheckCircle,
  CheckSquare,
  Eye,
  PlusCircle,
  Search,
  Trash2,
} from "react-feather";
import { FaArrowUp, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ExchangeEyeGlass: React.FC = () => {
  const {
    fetchAllExchangeEyeGlass,
    createExchangeEyeGlass,
    deleteExchangeEyeGlass,
  } = useExchangeEyeGlassService();

  // State Management
  const [exchangeData, setExchangeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [isAddRequestModalOpen, setIsAddRequestModalOpen] = useState(false);
  const [accountID, setAccountID] = useState<string | null>(null);
  const [productGlassID, setProductGlassID] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [selectedExchangeDetail, setSelectedExchangeDetail] = useState<
    any | null
  >(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { items, totalItems } = await fetchAllExchangeEyeGlass(
        accountID,
        productGlassID,
        pageIndex
      );
      if (items && items.length > 0) {
        setExchangeData(items);
        setTotalPages(Math.ceil(totalItems / 20));
        setSuccess(true);
      } else {
        setSuccess(false);
        setExchangeData([]);
      }
    } catch (error) {
      setError("Failed to load exchange data. Please try again later.");
      setSuccess(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex]);

  // Event Handlers
  const handleAddRequestSubmit = async (data: {
    productGlassID: number | null;
    receiverAddress: string;
    kioskID: number | null;
    reason: string;
    quantity: number;
  }) => {
    try {
      const response = await createExchangeEyeGlass(data);
      if (response) {
        toast.success("Exchange request created successfully!");
        fetchData();
        setIsAddRequestModalOpen(false);
      } else if (response.errors && Array.isArray(response.errors)) {
        response.errors.forEach((error: string) => toast.error(error));
      } else {
        toast.error("Failed to create exchange request.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the request.");
    }
  };

  const handleSearch = () => {
    setPageIndex(1);
    fetchData();
  };

  const handleViewDetail = (exchangeId: string) => {
    const exchangeDetail = exchangeData.find((item) => item.id === exchangeId);
    setSelectedExchangeDetail(exchangeDetail);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await deleteExchangeEyeGlass(deleteId);
      if (response) {
        toast.success("Delete successful!");
        fetchData();
      } else {
        toast.error("Failed to delete exchange request.");
      }
    } catch (error) {
      toast.error("Failed to delete. Please try again.");
    } finally {
      setDeleteId(null);
      setIsDeleteModalOpen(false);
    }
  };

  const activeExchanges = exchangeData.filter((item) => item.status).length;

  return (
    <Fragment>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        className="toast-container"
      />

      <div className="exchange-eyeglass-container">
        <div className="management-container">
          {/* Header Section */}
          <div className="management-header">
            <div className="header-content">
              <div className="title-wrapper">
                <h1>Exchange Eye Glass</h1>
                <p>Manage and monitor your exchange requests</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{exchangeData.length}</div>
                <div className="stat-label">Total Exchanges</div>
                <div className="stat-change">
                  <FaArrowUp />
                  All exchanges included
                </div>
              </div>
              <CheckSquare className="stat-icon" />
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{activeExchanges}</div>
                <div className="stat-label">Active Exchanges</div>
                <div className="stat-change">
                  <FaArrowUp />
                  Currently active exchanges
                </div>
              </div>
              <CheckCircle className="stat-icon" />
            </div>
          </div>

          {/* Main Content */}
          <Card className="main-card">
            <CardBody className="p-0">
              {/* Action Buttons */}
              <div className="action-buttons-container">
                <Button
                  className="action-button add-button"
                  onClick={() => setIsAddRequestModalOpen(true)}
                >
                  <PlusCircle />
                  New Exchange
                </Button>

                <Button
                  className="action-button check-button"
                  onClick={() => setIsCheckModalOpen(true)}
                >
                  <CheckSquare />
                  Check Glass
                </Button>
              </div>

              {/* Search Section */}
              <div className="search-section">
                <Row>
                  <Col md="4">
                    <div className="search-input-group">
                      <label>Account ID</label>
                      <Input
                        type="number"
                        placeholder="Enter Account ID"
                        value={accountID || ""}
                        onChange={(e) => setAccountID(e.target.value || null)}
                        className="search-input"
                      />
                    </div>
                  </Col>

                  <Col md="4">
                    <div className="search-input-group">
                      <label>Product Glass ID</label>
                      <Input
                        type="number"
                        placeholder="Enter Product Glass ID"
                        value={productGlassID || ""}
                        onChange={(e) =>
                          setProductGlassID(e.target.value || null)
                        }
                        className="search-input"
                      />
                    </div>
                  </Col>

                  <Col md="4">
                    <Button className="search-button" onClick={handleSearch}>
                      <Search size={18} />
                      Search Records
                    </Button>
                  </Col>
                </Row>
              </div>

              {/* Data Display */}
              <div className="data-section">
                {loading ? (
                  <div className="spinner-container">
                    <div className="spinner" />
                    <span>Loading data...</span>
                  </div>
                ) : error ? (
                  <Alert color="danger" className="m-4">
                    {error}
                  </Alert>
                ) : !exchangeData.length ? (
                  <Alert color="warning" className="m-4">
                    No exchange records found.
                  </Alert>
                ) : (
                  <div className="table-container">
                    <Table className="exchange-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Account</th>
                          <th>Product Glass</th>
                          <th>Order ID</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exchangeData.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.customer.id}</td>
                            <td>{item.productGlass.id}</td>
                            <td>{item.order.id}</td>
                            <td>
                              <div className="reason-cell" title={item.reason}>
                                {item.reason.length > 30
                                  ? `${item.reason.substring(0, 30)}...`
                                  : item.reason}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  item.status ? "active" : "inactive"
                                }`}
                              >
                                {item.status ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <Button
                                  className="action-button view-button"
                                  onClick={() => handleViewDetail(item.id)}
                                >
                                  <Eye size={16} />
                                </Button>
                                <Button
                                  className={`action-button delete-button ${
                                    !item.status ? "disabled" : ""
                                  }`}
                                  onClick={() => handleDeleteClick(item.id)}
                                  disabled={!item.status}
                                  title={
                                    !item.status
                                      ? "Cannot delete inactive exchange"
                                      : "Delete exchange"
                                  }
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    {/* Pagination */}
                    <div className="pagination">
                      <Button
                        className="pagination-button nav-button"
                        onClick={() =>
                          setPageIndex((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={pageIndex === 1}
                      >
                        <FaChevronLeft />
                      </Button>

                      <div className="page-numbers">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (pageIndex <= 3) {
                              pageNumber = i + 1;
                            } else if (pageIndex >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = pageIndex - 2 + i;
                            }

                            if (
                              pageNumber === 1 ||
                              pageNumber === totalPages ||
                              (pageNumber >= pageIndex - 1 &&
                                pageNumber <= pageIndex + 1)
                            ) {
                              return (
                                <Button
                                  key={pageNumber}
                                  className={`pagination-button ${
                                    pageIndex === pageNumber ? "active" : ""
                                  }`}
                                  onClick={() => setPageIndex(pageNumber)}
                                >
                                  {pageNumber}
                                </Button>
                              );
                            } else if (
                              pageNumber === pageIndex - 2 ||
                              pageNumber === pageIndex + 2
                            ) {
                              return <span key={pageNumber}>...</span>;
                            }
                            return null;
                          }
                        )}
                      </div>

                      <Button
                        className="pagination-button nav-button"
                        onClick={() =>
                          setPageIndex((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={pageIndex === totalPages}
                      >
                        <FaChevronRight />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <CheckProductGlassModal
        isOpen={isCheckModalOpen}
        toggle={() => setIsCheckModalOpen(!isCheckModalOpen)}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        toggle={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <ViewExchangeDetailModal
        isOpen={selectedExchangeDetail !== null}
        toggle={() => setSelectedExchangeDetail(null)}
        exchangeDetail={selectedExchangeDetail}
      />

      <AddExchangeRequestModal
        isOpen={isAddRequestModalOpen}
        toggle={() => setIsAddRequestModalOpen(false)}
        onSubmit={handleAddRequestSubmit}
      />
    </Fragment>
  );
};

export default ExchangeEyeGlass;
