import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Alert, Card, CardBody, CardHeader } from "reactstrap";
import { useExchangeEyeGlassService } from "../../../../Api/exchangeEyeGlassService";

interface CheckProductGlassModalProps {
  isOpen: boolean;
  toggle: () => void;
}

const CheckProductGlassModal: React.FC<CheckProductGlassModalProps> = ({ isOpen, toggle }) => {
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
    5: "Cancelled"
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
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Check Product Glass</ModalHeader>
      <ModalBody>
        <Input
          type="number"
          placeholder="Enter Product Glass ID"
          value={productGlassID ?? ""}
          onChange={(e) => setProductGlassID(e.target.value ? parseInt(e.target.value, 10) : null)}
          min={-2147483648}
          max={2147483647}
          className="mb-3"
        />

        {productData ? (
          <>
            <Card className="mb-3">
              <CardHeader>Order Information</CardHeader>
              <CardBody>
                <p><strong>Order ID:</strong> {productData.id ?? "undefined"}</p>
                <p><strong>Order Time:</strong> {productData.orderTime ? new Date(productData.orderTime).toLocaleString() : "undefined"}</p>
                <p><strong>Status:</strong> {productData.status ? "Active" : "Inactive"}</p>
                <p><strong>Receiver Address:</strong> {productData.receiverAddress ?? "undefined"}</p>
                <p><strong>Total:</strong> {productData.total ?? "undefined"}</p>
                <p><strong>Voucher ID:</strong> {productData.voucherID ?? "undefined"}</p>
                <p><strong>Is Deposit:</strong> {productData.isDeposit ? "Yes" : "No"}</p>
                <p><strong>Code:</strong> {productData.code ?? "undefined"}</p>
                <p><strong>Process Status:</strong> {getProcessStatusString(productData.process)}</p>
              </CardBody>
            </Card>

            <Card className="mb-3">
              <CardHeader>Order Details</CardHeader>
              <CardBody>
                {productData.orderDetails ? (
                  <>
                    <p><strong>Order Detail ID:</strong> {productData.orderDetails.id ?? "undefined"}</p>
                    <p><strong>Status:</strong> {productData.orderDetails.status ? "Active" : "Inactive"}</p>
                    <p><strong>Quantity:</strong> {productData.orderDetails.quantity ?? "undefined"}</p>
                    <p><strong>Product Glass ID:</strong> {productData.orderDetails.productGlass.id ?? "undefined"}</p>
                    <p><strong>Eye Glass:</strong> {productData.orderDetails.productGlass.eyeGlass?.name ?? "undefined"}</p>
                    <p><strong>Price:</strong> {productData.orderDetails.productGlass.eyeGlass?.price ?? "undefined"}</p>
                    <p><strong>Left Lens Name:</strong> {productData.orderDetails.productGlass.leftLen?.lensName ?? "undefined"}</p>
                    <p><strong>Left Lens Price:</strong> {productData.orderDetails.productGlass.leftLen?.lensPrice ?? "undefined"}</p>
                    <p><strong>Right Lens Name:</strong> {productData.orderDetails.productGlass.rightLen?.lensName ?? "undefined"}</p>
                    <p><strong>Right Lens Price:</strong> {productData.orderDetails.productGlass.rightLen?.lensPrice ?? "undefined"}</p>
                  </>
                ) : (
                  <p>No order details available.</p>
                )}
              </CardBody>
            </Card>

            <Card className="mb-3">
              <CardHeader>Account Details</CardHeader>
              <CardBody>
                <p><strong>Account ID:</strong> {productData.account?.id ?? "undefined"}</p>
                <p><strong>Username:</strong> {productData.account?.username ?? "undefined"}</p>
                <p><strong>Phone Number:</strong> {productData.account?.phoneNumber ?? "undefined"}</p>
                <p><strong>Status:</strong> {productData.account?.status ? "Active" : "Inactive"}</p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>Kiosk Details</CardHeader>
              <CardBody>
                <p><strong>Kiosk ID:</strong> {productData.kiosk?.id ?? "undefined"}</p>
                <p><strong>Name:</strong> {productData.kiosk?.name ?? "undefined"}</p>
                <p><strong>Address:</strong> {productData.kiosk?.address ?? "undefined"}</p>
              </CardBody>
            </Card>
          </>
        ) : error && (
          <Alert color="danger">{error}</Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleCheck}>
          Check
        </Button>{" "}
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CheckProductGlassModal;
