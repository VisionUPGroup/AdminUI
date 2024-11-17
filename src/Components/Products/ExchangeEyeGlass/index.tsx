import React, { Fragment, useEffect, useState } from "react";
import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { useExchangeEyeGlassService } from "../../../../Api/exchangeEyeGlassService";
import CheckProductGlassModal from "./CheckProductGlassModal"; // Import modal
import { Button, Container, Row, Col, Card, CardBody, Table, Spinner, Alert, Input } from "reactstrap";
import ViewExchangeDetailModal from "./ViewExchangeDetailModal"; // Import modal for viewing details
import AddExchangeRequestModal from "./AddExchangeRequestModal";
import DeleteModal from "./DeleteModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExchangeEyeGlass = () => {
  const { fetchAllExchangeEyeGlass, createExchangeEyeGlass, deleteExchangeEyeGlass } = useExchangeEyeGlassService();
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
  const [selectedExchangeDetail, setSelectedExchangeDetail] = useState<any | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { items, totalItems } = await fetchAllExchangeEyeGlass(accountID, productGlassID, pageIndex);
      if (items && items.length > 0) {
        setExchangeData(items);
        setTotalPages(Math.ceil(totalItems / 20));
        setSuccess(true);
      } else {
        setSuccess(false);
      }
    } catch (error) {
      setError("Failed to load exchange data. Please try again later.");
      setSuccess(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRequestSubmit = async (data: { productGlassID: number | null; receiverAddress: string; kioskID: number | null; reason: string; quantity: number }) => {
    try {
      const response = await createExchangeEyeGlass(data);
  
      if (response) {
        toast.success("Exchange request created successfully!");
        fetchData();
      } else if (response.errors && Array.isArray(response.errors)) {
        response.errors.forEach((error: string) => {
          toast.error(error);
        });
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

  const toggleAddRequestModal = () => {
    setIsAddRequestModalOpen(!isAddRequestModalOpen);
  };

  const toggleCheckModal = () => {
    setIsCheckModalOpen(!isCheckModalOpen);
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
        toast.success("Delete successfully!");
        fetchData();
      } else if (response.errors && Array.isArray(response.errors)) {
        response.errors.forEach((error: string) => {
          toast.error(error);
        });
      } else {
        toast.error("Failed to Delete exchange request.");
      }
    } catch (error) {
      toast.error("Failed to delete. Please try again.");
    } finally {
      setDeleteId(null);
      setIsDeleteModalOpen(false);
    }
  };
  

  return (
    <Fragment>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <CommonBreadcrumb title="Exchange Eye Glass" parent="Products" />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title="Exchange Eye Glass" />
              <CardBody>
                <div className="mb-3 d-flex justify-content-between">
                  <Button color="success" onClick={toggleAddRequestModal}>
                    Add Request
                  </Button>
                  <Button color="info" onClick={toggleCheckModal}>
                    Check Product Glass
                  </Button>
                </div>

                {/* Search Inputs */}
                <Row className="mb-3">
                  <Col sm="4">
                    <Input
                      type="number"
                      placeholder="Account ID"
                      value={accountID || ""}
                      onChange={(e) => setAccountID(e.target.value || null)}
                      min="-2147483648"
                      max="2147483647"
                    />
                  </Col>
                  <Col sm="4">
                    <Input
                      type="number"
                      placeholder="Product Glass ID"
                      value={productGlassID || ""}
                      onChange={(e) => setProductGlassID(e.target.value || null)}
                      min="-2147483648"
                      max="2147483647"
                    />
                  </Col>
                  <Col sm="4">
                    <Button color="primary" onClick={handleSearch}>
                      Search
                    </Button>
                  </Col>
                </Row>

                {/* Data Display */}
                {loading ? (
                  <Spinner color="primary" />
                ) : error ? (
                  <Alert color="danger">{error}</Alert>
                ) : success === false ? (
                  <Alert color="warning">
                    No data available or something went wrong while fetching.
                  </Alert>
                ) : (
                  <Table responsive striped bordered>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Account ID</th>
                        <th>Product Glass ID</th>
                        <th>Order ID</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th> {/* New column for actions */}
                      </tr>
                    </thead>
                    <tbody>
                      {exchangeData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.id}</td>
                          <td>{item.customer.id}</td>
                          <td>{item.productGlass.id}</td>
                          <td>{item.order.id}</td>
                          <td>{item.reason}</td>
                          <td>{item.status ? "Active" : "Inactive"}</td>
                          <td>
                          <Button
                            color="primary"
                            onClick={() => handleViewDetail(item.id)}
                            >
                              Detail
                            </Button>
                            <Button
                              color="danger"
                              className="ms-2"
                              onClick={() => handleDeleteClick(item.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}

                {/* Pagination Controls */}
                <div className="pagination-controls">
                  <Button
                    color="secondary"
                    onClick={() => {
                      setPageIndex((prev) => Math.max(prev - 1, 1));
                      fetchData();
                    }}
                    disabled={pageIndex === 1}
                  >
                    Previous
                  </Button>
                  <span> Page {pageIndex} of {totalPages} </span>
                  <Button
                    color="secondary"
                    onClick={() => {
                      setPageIndex((prev) => Math.min(prev + 1, totalPages));
                      fetchData();
                    }}
                    disabled={pageIndex === totalPages}
                  >
                    Next
                  </Button>
                </div>

                {/* Check Product Glass Modal */}
                <CheckProductGlassModal
                  isOpen={isCheckModalOpen}
                  toggle={toggleCheckModal}
                />
                <DeleteModal
                  isOpen={isDeleteModalOpen}
                  toggle={() => setIsDeleteModalOpen(false)}
                  onConfirm={handleConfirmDelete}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* View Detail Modal */}
      <ViewExchangeDetailModal
        isOpen={selectedExchangeDetail !== null}
        toggle={() => setSelectedExchangeDetail(null)}
        exchangeDetail={selectedExchangeDetail}
      />
      <AddExchangeRequestModal
        isOpen={isAddRequestModalOpen}
        toggle={toggleAddRequestModal}
        onSubmit={handleAddRequestSubmit}
      />
    </Fragment>
  );
};

export default ExchangeEyeGlass;
