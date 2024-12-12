import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { 
  User, 
  Package, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Mail,
  Archive,
  DollarSign,
  Eye,
  Calendar,
  Hash,
  FileText,
  CheckCircle,
  XCircle,
  Truck,
  Info
} from "react-feather";
import "./ViewExchangeDetailStyles.scss"
// Giữ nguyên các interfaces như cũ
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
  staff: Account;
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
  const getProcessStatus = (process: number) => {
    const statuses = {
      0: { label: "Pending", class: "pending" },
      1: { label: "Processing", class: "pending" },
      2: { label: "Shipping", class: "pending" },
      3: { label: "Delivered", class: "active" },
      4: { label: "Completed", class: "active" },
      5: { label: "Cancelled", class: "inactive" }
    };
    return statuses[process as keyof typeof statuses] || { label: "Unknown", class: "pending" };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!exchangeDetail) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      toggle={toggle} 
      size="lg" 
      className="exchange-detail-modal"
    >
      <ModalHeader toggle={toggle}>
        <Info className="modal-title-icon" /> Exchange Detail #{exchangeDetail.id}
      </ModalHeader>
      <ModalBody>
        {/* Exchange Information Section */}
        <div className="detail-section">
          <div className="section-header">
            <Package /> Exchange Information
          </div>
          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="label">Exchange ID</div>
                <div className="value">#{exchangeDetail.id}</div>
              </div>
              <div className="detail-item">
                <div className="label">Status</div>
                <div className={`value status ${exchangeDetail.status === 1 ? 'active' : 'inactive'}`}>
                  {exchangeDetail.status === 1 ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="detail-item">
                <div className="label">Reason</div>
                <div className="value">{exchangeDetail.reason}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information Section */}
        <div className="detail-section">
          <div className="section-header">
            <User /> Customer Information
          </div>
          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="label">Customer ID</div>
                <div className="value">#{exchangeDetail.customer.id}</div>
              </div>
              <div className="detail-item">
                <div className="label">Username</div>
                <div className="value">{exchangeDetail.customer.username}</div>
              </div>
              <div className="detail-item">
                <div className="label">Email</div>
                <div className="value">{exchangeDetail.customer.email}</div>
              </div>
              <div className="detail-item">
                <div className="label">Phone Number</div>
                <div className="value">{exchangeDetail.customer.phoneNumber || "N/A"}</div>
              </div>
              <div className="detail-item">
                <div className="label">Account Status</div>
                <div className={`value status ${exchangeDetail.customer.status ? 'active' : 'inactive'}`}>
                  {exchangeDetail.customer.status ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Information Section */}
        <div className="detail-section">
          <div className="section-header">
            <User /> Staff Information
          </div>
          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="label">Staff ID</div>
                <div className="value">#{exchangeDetail.staff.id}</div>
              </div>
              <div className="detail-item">
                <div className="label">Username</div>
                <div className="value">{exchangeDetail.staff.username}</div>
              </div>
              <div className="detail-item">
                <div className="label">Email</div>
                <div className="value">{exchangeDetail.staff.email}</div>
              </div>
              <div className="detail-item">
                <div className="label">Phone Number</div>
                <div className="value">{exchangeDetail.staff.phoneNumber || "N/A"}</div>
              </div>
              <div className="detail-item">
                <div className="label">Account Status</div>
                <div className={`value status ${exchangeDetail.staff.status ? 'active' : 'inactive'}`}>
                  {exchangeDetail.staff.status ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Glass Section */}
        <div className="detail-section">
          <div className="section-header">
            <Eye /> Product Glass Details
          </div>
          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="label">Product ID</div>
                <div className="value">#{exchangeDetail.productGlass.id}</div>
              </div>
              <div className="detail-item">
                <div className="label">Eye Glass Name</div>
                <div className="value">{exchangeDetail.productGlass.eyeGlass.name}</div>
              </div>
              <div className="detail-item">
                <div className="label">Eye Glass Price</div>
                <div className="value">{(exchangeDetail.productGlass.eyeGlass.price)} VND</div>
              </div>
              <div className="detail-item">
                <div className="label">Left Lens Name</div>
                <div className="value">{exchangeDetail.productGlass.leftLen.name}</div>
              </div>
              <div className="detail-item">
                <div className="label">Left Lens Description</div>
                <div className="value">{exchangeDetail.productGlass.leftLen.description}</div>
              </div>
              <div className="detail-item">
                <div className="label">Left Lens Price</div>
                <div className="value">{(exchangeDetail.productGlass.leftLen.price)} VND</div>
              </div>
              <div className="detail-item">
                <div className="label">Right Lens Name</div>
                <div className="value">{exchangeDetail.productGlass.rightLen.name}</div>
              </div>
              <div className="detail-item">
                <div className="label">Right Lens Description</div>
                <div className="value">{exchangeDetail.productGlass.rightLen.description}</div>
              </div>
              <div className="detail-item">
                <div className="label">Right Lens Price</div>
                <div className="value">{(exchangeDetail.productGlass.rightLen.price)} VND</div>
              </div>
            </div>

            {/* Prescription Information */}
            <div className="prescription-grid">
              <div className="prescription-item">
                <div className="prescription-label">Sphere OD</div>
                <div className="prescription-value">{exchangeDetail.productGlass.sphereOD}</div>
              </div>
              <div className="prescription-item">
                <div className="prescription-label">Cylinder OD</div>
                <div className="prescription-value">{exchangeDetail.productGlass.cylinderOD}</div>
              </div>
              <div className="prescription-item">
                <div className="prescription-label">Axis OD</div>
                <div className="prescription-value">{exchangeDetail.productGlass.axisOD}°</div>
              </div>
              <div className="prescription-item">
                <div className="prescription-label">Add OD</div>
                <div className="prescription-value">{exchangeDetail.productGlass.addOD}</div>
              </div>
              <div className="prescription-item">
                <div className="prescription-label">Sphere OS</div>
                <div className="prescription-value">{exchangeDetail.productGlass.sphereOS}</div>
              </div>
              <div className="prescription-item">
                <div className="prescription-label">Cylinder OS</div>
                <div className="prescription-value">{exchangeDetail.productGlass.cylinderOS}</div>
              </div>
              <div className="prescription-item">
                <div className="prescription-label">Axis OS</div>
                <div className="prescription-value">{exchangeDetail.productGlass.axisOS}°</div>
              </div>
              <div className="prescription-item">
                <div className="prescription-label">Add OS</div>
                <div className="prescription-value">{exchangeDetail.productGlass.addOS}</div>
              </div>
              <div className="prescription-item">
                <div className="prescription-label">PD</div>
                <div className="prescription-value">{exchangeDetail.productGlass.pd}mm</div>
              </div>
              <div className="prescription-item">
                <div className="prescription-label">Total</div>
                <div className="prescription-value">{(exchangeDetail.productGlass.total)} VND</div>
              </div>
              <div className="prescription-item">
                <div className="prescription-label">Quantity</div>
                <div className="prescription-value">{exchangeDetail.productGlass.quantity}</div>
              </div>
              <div className="prescription-item">
                <div className="prescription-label">Status</div>
                <div className={`prescription-value status ${exchangeDetail.productGlass.status ? 'active' : 'inactive'}`}>
                  {exchangeDetail.productGlass.status ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Information Section */}
        <div className="detail-section">
          <div className="section-header">
            <ShoppingBag /> Order Information
          </div>
          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="label">Order ID</div>
                <div className="value">#{exchangeDetail.order.id}</div>
              </div>
              {/* <div className="detail-item">
                <div className="label">Order Code</div>
                <div className="value">{exchangeDetail.order.code}</div>
              </div> */}
              <div className="detail-item">
                <div className="label">Process Status</div>
                <div className={`value status ${getProcessStatus(exchangeDetail.order.process).class}`}>
                  {getProcessStatus(exchangeDetail.order.process).label}
                </div>
              </div>
              <div className="detail-item">
                <div className="label">Total Amount</div>
                <div className="value">{(exchangeDetail.order.total)} VND</div>
              </div>
              <div className="detail-item">
                <div className="label">Order Status</div>
                <div className={`value status ${exchangeDetail.order.status ? 'active' : 'inactive'}`}>
                  {exchangeDetail.order.status ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="detail-item">
                <div className="label">Receiver Address</div>
                <div className="value">{exchangeDetail.order.receiverAddress}</div>
              </div>
              {exchangeDetail.order.kiosk && (
                <>
                  <div className="detail-item">
                    <div className="label">Kiosk Name</div>
                    <div className="value">{exchangeDetail.order.kiosk.name}</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Kiosk Address</div>
                    <div className="value">{exchangeDetail.order.kiosk.address}</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Kiosk Phone</div>
                    <div className="value">{exchangeDetail.order.kiosk.phoneNumber}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ViewExchangeDetailModal;