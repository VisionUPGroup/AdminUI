import React from "react";
import { Modal, ModalHeader, ModalBody, Table } from "reactstrap";

interface Account {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  status: boolean;
}

interface Lens {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface EyeGlass {
  id: number;
  name: string;
  price: number;
}

interface ProductGlass {
  id: number;
  eyeGlass: EyeGlass;
  leftLen: Lens;
  rightLen: Lens;
  sphereOD: number;
  cylinderOD: number;
  axisOD: number;
  sphereOS: number;
  cylinderOS: number;
  axisOS: number;
  addOD: number;
  addOS: number;
  pd: number;
  total: number;
  quantity: number;
  status: boolean;
}

interface Kiosk {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
}

interface Order {
  id: number;
  status: boolean;
  kiosk: Kiosk | null;
  receiverAddress: string;
  total: number;
  code: string;
  process: number;
}

interface ExchangeDetail {
  id: number;
  customer: Account;
  productGlass: ProductGlass;
  order: Order;
  reason: string;
  status: number;
}

interface ViewExchangeDetailModalProps {
  isOpen: boolean;
  toggle: () => void;
  exchangeDetail: ExchangeDetail | null;
}

const ViewExchangeDetailModal: React.FC<ViewExchangeDetailModalProps> = ({
  isOpen,
  toggle,
  exchangeDetail,
}) => {
  const getProcessStatus = (process: any) => {
    switch (process) {
      case 0: return "Pending";
      case 1: return "Processing";
      case 2: return "Shipping";
      case 3: return "Delivered";
      case 4: return "Completed";
      case 5: return "Cancelled";
      default: return "Unknown";
    }
  };
  
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Exchange Detail</ModalHeader>
      <ModalBody>
        {exchangeDetail ? (
          <Table bordered hover>
            <thead>
              <tr>
                <th colSpan={2} style={{ textAlign: "center" }}>Exchange Information</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Exchange ID</th>
                <td>{exchangeDetail.id}</td>
              </tr>
              <tr>
                <th>Reason</th>
                <td>{exchangeDetail.reason}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>{exchangeDetail.status === 1 ? "Active" : "Inactive"}</td>
              </tr>
            </tbody>

            <thead>
              <tr>
                <th colSpan={2} style={{ textAlign: "center" }}>Customer Information</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Customer ID</th>
                <td>{exchangeDetail.customer.id}</td>
              </tr>
              <tr>
                <th>Username</th>
                <td>{exchangeDetail.customer.username}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{exchangeDetail.customer.email}</td>
              </tr>
              <tr>
                <th>Phone Number</th>
                <td>{exchangeDetail.customer.phoneNumber || "N/A"}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>{exchangeDetail.customer.status ? "Active" : "Inactive"}</td>
              </tr>
            </tbody>

            <thead>
              <tr>
                <th colSpan={2} style={{ textAlign: "center" }}>Product Glass Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Product Glass ID</th>
                <td>{exchangeDetail.productGlass.id}</td>
              </tr>
              <tr>
                <th>Eye Glass Name</th>
                <td>{exchangeDetail.productGlass.eyeGlass.name}</td>
              </tr>
              <tr>
                <th>Eye Glass Price</th>
                <td>{exchangeDetail.productGlass.eyeGlass.price}</td>
              </tr>
              <tr>
                <th>Left Lens Name</th>
                <td>{exchangeDetail.productGlass.leftLen.name}</td>
              </tr>
              <tr>
                <th>Left Lens Description</th>
                <td>{exchangeDetail.productGlass.leftLen.description}</td>
              </tr>
              <tr>
                <th>Left Lens Price</th>
                <td>{exchangeDetail.productGlass.leftLen.price}</td>
              </tr>
              <tr>
                <th>Right Lens Name</th>
                <td>{exchangeDetail.productGlass.rightLen.name}</td>
              </tr>
              <tr>
                <th>Right Lens Description</th>
                <td>{exchangeDetail.productGlass.rightLen.description}</td>
              </tr>
              <tr>
                <th>Right Lens Price</th>
                <td>{exchangeDetail.productGlass.rightLen.price}</td>
              </tr>
              {/* Các thông số khác của kính */}
              <tr>
                <th>Spherical OD</th>
                <td>{exchangeDetail.productGlass.sphereOD}</td>
              </tr>
              <tr>
                <th>Cylindrical OD</th>
                <td>{exchangeDetail.productGlass.cylinderOD}</td>
              </tr>
              <tr>
                <th>Axis OD</th>
                <td>{exchangeDetail.productGlass.axisOD}</td>
              </tr>
              <tr>
                <th>Spherical OS</th>
                <td>{exchangeDetail.productGlass.sphereOS}</td>
              </tr>
              <tr>
                <th>Cylindrical OS</th>
                <td>{exchangeDetail.productGlass.cylinderOS}</td>
              </tr>
              <tr>
                <th>Axis OS</th>
                <td>{exchangeDetail.productGlass.axisOS}</td>
              </tr>
              <tr>
                <th>Add OD</th>
                <td>{exchangeDetail.productGlass.addOD}</td>
              </tr>
              <tr>
                <th>Add OS</th>
                <td>{exchangeDetail.productGlass.addOS}</td>
              </tr>
              <tr>
                <th>PD</th>
                <td>{exchangeDetail.productGlass.pd}</td>
              </tr>
              <tr>
                <th>Total</th>
                <td>{exchangeDetail.productGlass.total}</td>
              </tr>
              <tr>
                <th>Quantity</th>
                <td>{exchangeDetail.productGlass.quantity}</td>
              </tr>
              <tr>
                <th>Product Glass Status</th>
                <td>{exchangeDetail.productGlass.status ? "Active" : "Inactive"}</td>
              </tr>
            </tbody>

            <thead>
              <tr>
                <th colSpan={2} style={{ textAlign: "center" }}>Order Information</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Order ID</th>
                <td>{exchangeDetail.order.id}</td>
              </tr>
              <tr>
                <th>Kiosk Name</th>
                <td>{exchangeDetail.order.kiosk ? exchangeDetail.order.kiosk.name : "N/A"}</td>
              </tr>
              <tr>
                <th>Kiosk Address</th>
                <td>{exchangeDetail.order.kiosk ? exchangeDetail.order.kiosk.address : "N/A"}</td>
              </tr>
              <tr>
                <th>Kiosk Phone Number</th>
                <td>{exchangeDetail.order.kiosk ? exchangeDetail.order.kiosk.phoneNumber : "N/A"}</td>
              </tr>
              <tr>
                <th>Receiver Address</th>
                <td>{exchangeDetail.order.receiverAddress}</td>
              </tr>
              <tr>
                <th>Order Code</th>
                <td>{exchangeDetail.order.code}</td>
              </tr>
              <tr>
                <th>Process</th>
                <td>{getProcessStatus(exchangeDetail.order.process)}</td>
              </tr>
              <tr>
                <th>Order Status</th>
                <td>{exchangeDetail.order.status ? "Active" : "Inactive"}</td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <p>No details available</p>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ViewExchangeDetailModal;
