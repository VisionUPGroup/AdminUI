import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Alert,
  Card,
  CardBody,
  CardHeader,
} from "reactstrap";
import { useExchangeEyeGlassService } from "../../../../Api/exchangeEyeGlassService";
import "./CheckProductGlassModalStyles.scss";

interface CheckProductGlassModalProps {
  isOpen: boolean;
  toggle: () => void;
}

const CheckProductGlassModal: React.FC<CheckProductGlassModalProps> = ({
  isOpen,
  toggle,
}) => {
  const { checkProductGlass } = useExchangeEyeGlassService();
  const [productGlassID, setProductGlassID] = useState<number | null>(null);
  const [productData, setProductData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processStatusMap: { [key: number]: string } = {
    0: "Pending",
    1: "Processing",
    2: "Shipping",
    3: "Delivered",
    4: "Completed",
    5: "Cancelled",
  };

  const getProcessStatusString = (status: number | undefined): string => {
    return status !== undefined ? processStatusMap[status] : "undefined";
  };

  useEffect(() => {
    if (!isOpen) {
      setProductGlassID(null);
      setProductData(null);
      setError(null);
    }
  }, [isOpen]);

  const handleCheck = async () => {
    if (productGlassID === null) {
      setError("Please enter a valid Product Glass ID.");
      return;
    }

    try {
      setError(null);
      const result = await checkProductGlass(productGlassID);
      if (result) {
        setProductData(result);
      } else {
        setProductData(null);
        setError(`Product Glass ID ${productGlassID} is not found.`);
      }
    } catch (error) {
      setError("Failed to check Product Glass. Please try again.");
      console.error("Error checking Product Glass:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className="check-product-glass-modal"
    >
      <ModalHeader toggle={toggle} className="modal-header">
        Check Product Glass
      </ModalHeader>
      <ModalBody className="modal-body">
        <Input
          type="number"
          min="0" // Thêm min="0" để ngăn số âm
          placeholder="Enter Product Glass ID"
          value={productGlassID ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "" || parseInt(value) >= 0) {
              setProductGlassID(value ? parseInt(value, 10) : null);
            }
          }}
          onKeyPress={(e) => {
            if (e.key === "-") {
              e.preventDefault();
            }
          }}
          className="product-glass-id-input mb-3"
        />

        {productData ? (
          <div className="product-data-container">
            <Card className="order-info-card mb-3">
              <CardHeader className="card-header">Order Information</CardHeader>
              <CardBody className="card-body">
                <div className="info-item">
                  <span className="label">Order ID:</span>
                  <span className="value">{productData.id ?? "undefined"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Order Time:</span>
                  <span className="value">
                    {productData.orderTime
                      ? new Date(productData.orderTime).toLocaleString()
                      : "undefined"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className="value">
                    {productData.status ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Receiver Address:</span>
                  <span className="value">
                    {productData.receiverAddress ?? "undefined"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Total:</span>
                  <span className="value">
                    {productData.total ?? "undefined"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Voucher ID:</span>
                  <span className="value">
                    {productData.voucherID ?? "undefined"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Is Deposit:</span>
                  <span className="value">
                    {productData.isDeposit ? "Yes" : "No"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Code:</span>
                  <span className="value">
                    {productData.code ?? "undefined"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Process Status:</span>
                  <span className="value">
                    {getProcessStatusString(productData.process)}
                  </span>
                </div>
              </CardBody>
            </Card>

            <Card className="order-details-card mb-3">
              <CardHeader className="card-header">Order Details</CardHeader>
              <CardBody className="card-body">
                {productData.orderDetails ? (
                  <>
                    <div className="info-item">
                      <span className="label">Order Detail ID:</span>
                      <span className="value">
                        {productData.orderDetails.id ?? "undefined"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Status:</span>
                      <span className="value">
                        {productData.orderDetails.status
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Quantity:</span>
                      <span className="value">
                        {productData.orderDetails.quantity ?? "undefined"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Product Glass ID:</span>
                      <span className="value">
                        {productData.orderDetails.productGlass.id ??
                          "undefined"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Eye Glass:</span>
                      <span className="value">
                        {productData.orderDetails.productGlass.eyeGlass?.name ??
                          "undefined"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Price:</span>
                      <span className="value">
                        {productData.orderDetails.productGlass.eyeGlass
                          ?.price ?? "undefined"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Left Lens Name:</span>
                      <span className="value">
                        {productData.orderDetails.productGlass.leftLen
                          ?.lensName ?? "undefined"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Left Lens Price:</span>
                      <span className="value">
                        {productData.orderDetails.productGlass.leftLen
                          ?.lensPrice ?? "undefined"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Right Lens Name:</span>
                      <span className="value">
                        {productData.orderDetails.productGlass.rightLen
                          ?.lensName ?? "undefined"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Right Lens Price:</span>
                      <span className="value">
                        {productData.orderDetails.productGlass.rightLen
                          ?.lensPrice ?? "undefined"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p>No order details available.</p>
                )}
              </CardBody>
            </Card>

            <Card className="account-details-card mb-3">
              <CardHeader className="card-header">Account Details</CardHeader>
              <CardBody className="card-body">
                <div className="info-item">
                  <span className="label">Account ID:</span>
                  <span className="value">
                    {productData.account?.id ?? "undefined"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Username:</span>
                  <span className="value">
                    {productData.account?.username ?? "undefined"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Phone Number:</span>
                  <span className="value">
                    {productData.account?.phoneNumber ?? "undefined"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className="value">
                    {productData.account?.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardBody>
            </Card>

            <Card className="kiosk-details-card">
              <CardHeader className="card-header">Kiosk Details</CardHeader>
              <CardBody className="card-body">
                <div className="info-item">
                  <span className="label">Kiosk ID:</span>
                  <span className="value">
                    {productData.kiosk?.id ?? "undefined"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">
                    {productData.kiosk?.name ?? "undefined"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Address:</span>
                  <span className="value">
                    {productData.kiosk?.address ?? "undefined"}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          error && (
            <Alert color="danger" className="error-alert">
              {error}
            </Alert>
          )
        )}
      </ModalBody>
      <ModalFooter className="modal-footer">
        <Button color="primary" onClick={handleCheck} className="check-button">
          Check
        </Button>{" "}
        <Button color="secondary" onClick={toggle} className="close-button">
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CheckProductGlassModal;
