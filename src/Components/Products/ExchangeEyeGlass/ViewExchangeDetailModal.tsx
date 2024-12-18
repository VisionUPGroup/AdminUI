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
  Info,
  RefreshCw
} from "react-feather";
import "./ViewExchangeDetailStyles.scss"

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
  quantity?: number;
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
  receiverAddress: string | null;
  total: number;
  process: number;
}

interface Report {
  id: number;
  type: number;
  status: number;
  description: string;
}

interface ExchangeDetail {
  id: number;
  customer: Account;
  staff: Account;
  oldProductGlass: ProductGlass;
  newProductGlass: ProductGlass;
  oldOrder: Order;
  newOrder: Order;
  report: Report;
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

  const getExchangeStatus = (status: number) => {
    const statuses = {
      0: { label: "Pending", class: "pending" },
      1: { label: "Processing", class: "pending" },
      2: { label: "Completed", class: "active" },
      3: { label: "Rejected", class: "inactive" }
    };
    return statuses[status as keyof typeof statuses] || { label: "Unknown", class: "pending" };
  };

  const getReportType = (type: number) => {
    const types = {
      0: "Product Issue",
      1: "Service Issue",
      2: "Other"
    };
    return types[type as keyof typeof types] || "Unknown";
  };

  const getReportStatus = (status: number) => {
    const statuses = {
      0: { label: "Pending", class: "pending" },
      1: { label: "Processing", class: "pending" },
      2: { label: "Resolved", class: "active" },
      3: { label: "Rejected", class: "inactive" }
    };
    return statuses[status as keyof typeof statuses] || { label: "Unknown", class: "pending" };
  };

  const renderProductGlassDetails = (productGlass: ProductGlass, title: string) => (
    <div className="detail-section">
      <div className="section-header">
        <Eye /> {title}
      </div>
      <div className="section-content">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="label">Product ID</div>
            <div className="value">#{productGlass.id}</div>
          </div>
          <div className="detail-item">
            <div className="label">Eye Glass Name</div>
            <div className="value">{productGlass.eyeGlass.name}</div>
          </div>
          <div className="detail-item">
            <div className="label">Eye Glass Price</div>
            <div className="value">{productGlass.eyeGlass.price.toLocaleString()} VND</div>
          </div>
          <div className="detail-item">
            <div className="label">Left Lens</div>
            <div className="value">{productGlass.leftLen.name}</div>
          </div>
          <div className="detail-item">
            <div className="label">Left Lens Description</div>
            <div className="value">{productGlass.leftLen.description}</div>
          </div>
          <div className="detail-item">
            <div className="label">Left Lens Price</div>
            <div className="value">{productGlass.leftLen.price.toLocaleString()} VND</div>
          </div>
          <div className="detail-item">
            <div className="label">Right Lens</div>
            <div className="value">{productGlass.rightLen.name}</div>
          </div>
          <div className="detail-item">
            <div className="label">Right Lens Description</div>
            <div className="value">{productGlass.rightLen.description}</div>
          </div>
          <div className="detail-item">
            <div className="label">Right Lens Price</div>
            <div className="value">{productGlass.rightLen.price.toLocaleString()} VND</div>
          </div>
        </div>

        <div className="prescription-grid">
          <div className="prescription-item">
            <div className="prescription-label">Sphere OD</div>
            <div className="prescription-value">{productGlass.sphereOD}</div>
          </div>
          <div className="prescription-item">
            <div className="prescription-label">Cylinder OD</div>
            <div className="prescription-value">{productGlass.cylinderOD}</div>
          </div>
          <div className="prescription-item">
            <div className="prescription-label">Axis OD</div>
            <div className="prescription-value">{productGlass.axisOD}°</div>
          </div>
          <div className="prescription-item">
            <div className="prescription-label">Add OD</div>
            <div className="prescription-value">{productGlass.addOD}</div>
          </div>
          <div className="prescription-item">
            <div className="prescription-label">Sphere OS</div>
            <div className="prescription-value">{productGlass.sphereOS}</div>
          </div>
          <div className="prescription-item">
            <div className="prescription-label">Cylinder OS</div>
            <div className="prescription-value">{productGlass.cylinderOS}</div>
          </div>
          <div className="prescription-item">
            <div className="prescription-label">Axis OS</div>
            <div className="prescription-value">{productGlass.axisOS}°</div>
          </div>
          <div className="prescription-item">
            <div className="prescription-label">Add OS</div>
            <div className="prescription-value">{productGlass.addOS}</div>
          </div>
          <div className="prescription-item">
            <div className="prescription-label">PD</div>
            <div className="prescription-value">{productGlass.pd}mm</div>
          </div>
          <div className="prescription-item">
            <div className="prescription-label">Total</div>
            <div className="prescription-value">{productGlass.total.toLocaleString()} VND</div>
          </div>
          <div className="prescription-item">
            <div className="prescription-label">Status</div>
            <div className={`prescription-value status ${productGlass.status ? 'active' : 'inactive'}`}>
              {productGlass.status ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderDetails = (order: Order, title: string) => (
    <div className="detail-section">
      <div className="section-header">
        <ShoppingBag /> {title}
      </div>
      <div className="section-content">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="label">Order ID</div>
            <div className="value">#{order.id}</div>
          </div>
          <div className="detail-item">
            <div className="label">Process Status</div>
            <div className={`value status ${getProcessStatus(order.process).class}`}>
              {getProcessStatus(order.process).label}
            </div>
          </div>
          <div className="detail-item">
            <div className="label">Total Amount</div>
            <div className="value">{order.total.toLocaleString()} VND</div>
          </div>
          <div className="detail-item">
            <div className="label">Order Status</div>
            <div className={`value status ${order.status ? 'active' : 'inactive'}`}>
              {order.status ? 'Active' : 'Inactive'}
            </div>
          </div>
          {order.receiverAddress && (
            <div className="detail-item">
              <div className="label">Receiver Address</div>
              <div className="value">{order.receiverAddress}</div>
            </div>
          )}
          {order.kiosk && (
            <>
              <div className="detail-item">
                <div className="label">Kiosk Name</div>
                <div className="value">{order.kiosk.name}</div>
              </div>
              <div className="detail-item">
                <div className="label">Kiosk Address</div>
                <div className="value">{order.kiosk.address}</div>
              </div>
              <div className="detail-item">
                <div className="label">Kiosk Phone</div>
                <div className="value">{order.kiosk.phoneNumber}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (!exchangeDetail) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      toggle={toggle} 
      size="lg" 
      className="exchange-detail-modal"
    >
      <ModalHeader toggle={toggle}>
        <RefreshCw className="modal-title-icon" /> Exchange Detail #{exchangeDetail.id}
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
                <div className={`value status ${getExchangeStatus(exchangeDetail.status).class}`}>
                  {getExchangeStatus(exchangeDetail.status).label}
                </div>
              </div>
              <div className="detail-item">
                <div className="label">Reason</div>
                <div className="value">{exchangeDetail.reason}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Information Section */}
        <div className="detail-section">
          <div className="section-header">
            <FileText /> Report Information
          </div>
          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="label">Report ID</div>
                <div className="value">#{exchangeDetail.report.id}</div>
              </div>
              <div className="detail-item">
                <div className="label">Type</div>
                <div className="value">{getReportType(exchangeDetail.report.type)}</div>
              </div>
              <div className="detail-item">
                <div className="label">Status</div>
                <div className={`value status ${getReportStatus(exchangeDetail.report.status).class}`}>
                  {getReportStatus(exchangeDetail.report.status).label}
                </div>
              </div>
              <div className="detail-item">
                <div className="label">Description</div>
                <div className="value">{exchangeDetail.report.description}</div>
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
          <div className="section-header"><User /> Staff Information
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

        {/* Old Product Glass Section */}
        {renderProductGlassDetails(exchangeDetail.oldProductGlass, "Old Product Glass Details")}

        {/* New Product Glass Section */}
        {renderProductGlassDetails(exchangeDetail.newProductGlass, "New Product Glass Details")}

        {/* Old Order Section */}
        {renderOrderDetails(exchangeDetail.oldOrder, "Old Order Information")}

        {/* New Order Section */}
        {renderOrderDetails(exchangeDetail.newOrder, "New Order Information")}

      </ModalBody>
    </Modal>
  );
};

export default ViewExchangeDetailModal;