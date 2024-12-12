import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaMapMarkerAlt,
  FaTag,
  FaStore,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaShippingFast,
  FaRegBuilding,
} from "react-icons/fa";
import { useOrderService } from "../../../../Api/orderService";
import { useVoucherService } from "../../../../Api/voucherService";
import { useLensService } from "../../../../Api/lensService";
import { usePaymentService } from "../../../../Api/paymentService";
import { useProductGlassService } from "../../../../Api/productGlassService";
import OrderStatusTracker from "./OderTracker";
import { toast } from "react-toastify";
import "./OrderDetailStyle.scss";
import ProductAndPaymentInfo from "./PaymentDetail";

interface OrderDetailProps {
  id: string;
}
interface DetailLensInfo {
  leftLens: Lens | null;
  rightLens: Lens | null;
}
interface Profile {
  id: number;
  accountID: number;
  fullName: string;
  phoneNumber: string;
  address: string;
  urlImage: string | null;
  birthday: string;
  status: boolean;
  visualAcuityRecords: any[];
  refractionRecords: any[];
}
interface Shipper {
  id: number;
  username: string;
  email: string;
  status: boolean;
  roleID: number;
  phoneNumber: string;
  profiles: Profile[];
}
interface OrderDetail {
  shipper: any;
  kiosks: any;
  id: number;
  accountID: number;
  orderTime: string;
  shippingStartTime: string | null;
  deliveriedStartTime: string | null;
  placedByKioskID: number;
  deliveryConfirmationImage: string | null;
  status: boolean;
  kioskID: number;
  shipperID: number | null;
  receiverAddress: string | null;
  total: number;
  voucherID: number | null;
  isDeposit: boolean;
  code: string;
  process: number;
  kiosk: {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    openingHours: string;
  };
  placedByKiosk: {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    openingHours: string;
  };
  orderDetails: Array<OrderDetailItem>;
}

interface OrderDetailItem {
  id: number;
  productGlass: {
    id: number;
    eyeGlassID: number;
    leftLenID: number | null;
    rightLenID: number | null;
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
  };
  quantity: number;
}
interface LensInfo {
  [key: number]: {
    leftLens: any;
    rightLens: any;
  };
}
interface Lens {
  id: number;
  name: string;
  price: number;
  // thêm các properties khác của lens nếu cần
}
interface DetailLensInfo {
  leftLens: Lens | null;
  rightLens: Lens | null;
}
interface LensInfoMap {
  [orderDetailId: number]: DetailLensInfo;
}
interface ProductGlass {
  id: number;
  eyeGlassID: number;
  leftLenID: number;
  rightLenID: number;
  accountID: number;
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
  status: boolean;
}

const OrderDetailComponent: React.FC<OrderDetailProps> = ({ id }) => {
  const router = useRouter();
  const { fetchOrderById, deleteOrder } = useOrderService();
  const { fetchVoucherById } = useVoucherService();
  const { fetchLensById } = useLensService();
  const { fetchPaymentByOrderId } = usePaymentService();
  const [productGlassDetails, setProductGlassDetails] = useState<{ [key: number]: ProductGlass }>({});
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [voucherName, setVoucherName] = useState<string | null>(null);
  const [lensInfo, setLensInfo] = useState<LensInfo>({});
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        setIsLoading(true);
        // Fetch order data
        const orderData = await fetchOrderById(Number(id));

        // Fetch payment information 
        const paymentData = await fetchPaymentByOrderId(Number(id));
        setPaymentInfo(paymentData);

        // Fetch product glass details
        const { fetchProductGlassById } = useProductGlassService();
        const productGlassPromises = orderData.orderDetails.map(async (detail: { productGlass: { id: any; }; id: any; }) => {
          try {
            const productGlassData = await fetchProductGlassById(detail.productGlass.id);
            return {
              orderDetailId: detail.id,
              productGlass: productGlassData
            };
          } catch (error) {
            console.error(`Error fetching product glass data:`, error);
            return {
              orderDetailId: detail.id,
              productGlass: null
            };
          }
        });

        const productGlassResults = await Promise.all(productGlassPromises);
        const newProductGlassDetails = productGlassResults.reduce((acc, curr) => {
          acc[curr.orderDetailId] = curr.productGlass;
          return acc;
        }, {} as { [key: number]: ProductGlass });

        setProductGlassDetails(newProductGlassDetails);

        // Fetch lens information for all products
        const lensPromises = orderData.orderDetails.map(
          async (detail: {
            productGlass: { leftLenID: any; rightLenID: any };
            id: any;
          }) => {
            const leftLenID = detail.productGlass.leftLenID;
            const rightLenID = detail.productGlass.rightLenID;

            let leftLensData = null;
            let rightLensData = null;

            try {
              if (leftLenID) {
                leftLensData = await fetchLensById(leftLenID);
              }
              if (rightLenID) {
                rightLensData = await fetchLensById(rightLenID);
              }
            } catch (error) {
              console.error(`Error fetching lens data:`, error);
            }

            return {
              orderDetailId: detail.id,
              leftLens: leftLensData,
              rightLens: rightLensData,
            };
          }
        );

        const lensResults = await Promise.all(lensPromises);
        console.log("Lens Results:", lensResults);

        const newLensInfo = lensResults.reduce((acc, curr) => {
          acc[curr.orderDetailId] = {
            leftLens: curr.leftLens || null,
            rightLens: curr.rightLens || null,
          };
          return acc;
        }, {} as LensInfo);

        console.log("Processed Lens Info:", newLensInfo);
        setLensInfo(newLensInfo);
        setOrder(orderData);

        // Fetch voucher information if exists
        if (orderData.voucherID) {
          try {
            const voucherData = await fetchVoucherById(orderData.voucherID);
            setVoucherName(voucherData.name);
          } catch (error) {
            console.error("Error fetching voucher:", error);
            setVoucherName(null);
          }
        }
      } catch (error) {
        console.error("Error loading order details:", error);
        toast.error("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    // Check if ID exists before loading data
    if (id) {
      loadOrderData();
    }
  }, [id]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner">
          <div className="spinner-icon"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="error-state">
        <FaTimesCircle className="error-icon" />
        <h3>Order not found</h3>
        <p>The requested order could not be found.</p>
        <button
          className="back-button"
          onClick={() => router.back()}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="page-header">
        <div className="header-content">
          <h1>
            Order Details
            <span className="order-time">
              {formatDateTime(order.orderTime)}
            </span>
          </h1>
          <button
            className="back-button"
            onClick={() => router.back()}
          >
            Back to Orders
          </button>
        </div>
      </div>

      <div className="order-content">
        <div className="main-info">
          <div className="order-header">
            <div className="order-id">
              <span className="label">Order ID:</span>
              <span className="value">#{order.id}</span>
              <span
                className={`status-badge ${order.status ? "active" : "inactive"
                  }`}
              >
                {order.status ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="total-amount">{formatCurrency(order.total)}</div>
          </div>

          <div className="info-grid">
            {/* Destination Kiosk Info */}
            <div className="info-section">
              <div className="info-label">
                <FaStore /> Destination Kiosk
              </div>

              <div className="info-value">
                <div>{order?.kiosks?.name || "Unknown"}</div>
                <div className="details">
                  <div>
                    <FaMapMarkerAlt /> {order?.kiosks?.address || "Unknown"}
                  </div>
                  <div>
                    <FaPhoneAlt /> {order?.kiosks?.phoneNumber || "Unknown"}
                  </div>
                  <div>
                    <FaEnvelope /> {order?.kiosks?.email || "Unknown"}
                  </div>
                  <div>
                    <FaClock /> {order?.kiosks?.openingHours || "Unknown"}
                  </div>
                </div>
              </div>
            </div>

            {/* Placed By Kiosk Info */}
            <div className="info-section">
              <div className="info-label">
                <FaStore /> Placed By Kiosk
              </div>
              <div className="info-value">
                <div>{order?.placedByKiosk?.name || "Unknown"}</div>
                <div className="details">
                  <div>
                    <FaMapMarkerAlt />{" "}
                    {order?.placedByKiosk?.address || "Unknown"}
                  </div>
                  <div>
                    <FaPhoneAlt />{" "}
                    {order?.placedByKiosk?.phoneNumber || "Unknown"}
                  </div>
                  <div>
                    <FaEnvelope /> {order?.placedByKiosk?.email || "Unknown"}
                  </div>
                  <div>
                    <FaClock />{" "}
                    {order?.placedByKiosk?.openingHours || "Unknown"}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}

            <div className="info-section">
              <div className="info-label">
                <FaShippingFast /> Shipping Details
              </div>
              <div className="info-value">
                {order.shippingStartTime && (
                  <div>
                    Shipping Start: {formatDateTime(order.shippingStartTime)}
                  </div>
                )}
                {order.deliveriedStartTime && (
                  <div>
                    Delivery Start: {formatDateTime(order.deliveriedStartTime)}
                  </div>
                )}
                {order.receiverAddress && (
                  <div>Delivery Address: {order.receiverAddress}</div>
                )}

                {/* Thông tin Shipper */}
                {order.shipper && (
                  <div className="shipper-info">
                    <h4 className="shipper-title">
                      <FaUser /> Shipper Information
                    </h4>
                    <div className="shipper-details">
                      {order.shipper.profiles?.[0]?.fullName && (
                        <div>
                          <strong>Name:</strong>{" "}
                          {order.shipper.profiles[0].fullName}
                        </div>
                      )}
                      <div>
                        <strong>Phone:</strong> {order.shipper.phoneNumber}
                      </div>
                      {order.shipper.profiles?.[0]?.address && (
                        <div>
                          <strong>Address:</strong>{" "}
                          {order.shipper.profiles[0].address}
                        </div>
                      )}
                      <div>
                        <strong>Email:</strong> {order.shipper.email}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hình ảnh xác nhận giao hàng */}
                {order.deliveryConfirmationImage && (
                  <div className="delivery-confirmation">
                    <div className="image-label">
                      Delivery Confirmation Image:
                    </div>
                    <img
                      src={order.deliveryConfirmationImage}
                      alt="Delivery Confirmation"
                      className="confirmation-image"
                      onClick={() => {
                        if (order.deliveryConfirmationImage) {
                          window.open(
                            order.deliveryConfirmationImage,
                            "_blank"
                          );
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="products-section">
              <div className="section-header">
                <h3>Prescription Details</h3>
                <span className="item-count">
                  {order.orderDetails.length} items
                </span>
              </div>
              <div className="product-list">
                {order?.orderDetails.map((orderDetail, index) => {
                  const productGlassDetail = productGlassDetails[orderDetail.id];

                  return (
                    <div key={orderDetail.id} className="product-item">
                      <div className="product-content">
                        <div className="product-info">
                          <h4>Glass Specification #{index + 1}</h4>
                          <div className="specs-grid">
                            <div className="spec-group">
                              <h5>Right Eye (OD)</h5>
                              <div>
                                Sphere: {productGlassDetail?.sphereOD || orderDetail.productGlass.sphereOD}
                              </div>
                              <div>
                                Cylinder: {productGlassDetail?.cylinderOD || orderDetail.productGlass.cylinderOD}
                              </div>
                              <div>
                                Axis: {productGlassDetail?.axisOD || orderDetail.productGlass.axisOD}
                              </div>
                              <div>
                                Add: {productGlassDetail?.addOD || orderDetail.productGlass.addOD}
                              </div>
                            </div>
                            <div className="spec-group">
                              <h5>Left Eye (OS)</h5>
                              <div>
                                Sphere: {productGlassDetail?.sphereOS || orderDetail.productGlass.sphereOS}
                              </div>
                              <div>
                                Cylinder: {productGlassDetail?.cylinderOS || orderDetail.productGlass.cylinderOS}
                              </div>
                              <div>
                                Axis: {productGlassDetail?.axisOS || orderDetail.productGlass.axisOS}
                              </div>
                              <div>
                                Add: {productGlassDetail?.addOS || orderDetail.productGlass.addOS}
                              </div>
                            </div>
                            <div className="spec-group">
                              <h5>Additional Info</h5>
                              <div>
                                PD: {productGlassDetail?.pd || orderDetail.productGlass.pd}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {paymentInfo && (
              <ProductAndPaymentInfo
                paymentInfo={{
                  ...paymentInfo,
                  voucher: order.voucherID
                    ? {
                        id: order.voucherID,
                        // Thêm các thông tin voucher khác nếu có
                      }
                    : null,
                }}
              />
            )}

            {/* Order Status Tracker */}
            <OrderStatusTracker
              status={order.process}
              orderId={order.id}
              onStatusUpdate={async () => {
                try {
                  // Reload both order and payment data
                  const updatedOrder = await fetchOrderById(Number(id));
                  const updatedPayment = await fetchPaymentByOrderId(Number(id));
                  setOrder(updatedOrder);
                  setPaymentInfo(updatedPayment);
                } catch (error) {
                  console.error("Error reloading order:", error);
                  toast.error("Failed to reload order details");
                }
              }}
              onDeleteOrder={deleteOrder}
              totalAmount={order.total}
              remainingAmount={paymentInfo?.remainingAmount || 0}
              isDeposit={order.isDeposit}
              isHomeDelivery={!!order.receiverAddress}
              hasKioskInfo={!!order.kiosks}
              deliveryConfirmationImage={order.deliveryConfirmationImage}
              isPaid={paymentInfo?.totalPaid === paymentInfo?.totalAmount}
            />

            {/* Payment Information */}

            {/* Product Glass Details */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailComponent;
