import React, {useRef, useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Image from 'next/image';
import { useOrderService } from '../../../../../Api/orderService';
import { usePaymentService } from '../../../../../Api/paymentService';
import { useVoucherService } from '../../../../../Api/voucherService';
import Logo from '../../../../../public/assets/images/visionUp/logo.jpg'
import { useLensService } from '../../../../../Api/lensService';
import styles from '../styles/PrintReceipt.module.scss'

interface LensDetail {
  id: number;
  lensName: string;
  lensDescription: string;
  lensPrice: number;
  lensImage?: string;
}

interface VoucherDetail {
  id: number;
  name: string;
  code: string;
  quantity: number;
  sale: number;
  status: boolean;
}

interface PrintReceiptProps {
  orderId: number;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
    website: string;
  };
  staffName: string;
}

const PrintReceipt: React.FC<PrintReceiptProps> = ({
  orderId,
  companyInfo,
  staffName
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [lensDetails, setLensDetails] = useState<{ [key: number]: LensDetail }>({});
  const [voucherDetails, setVoucherDetails] = useState<VoucherDetail | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  console.log("componentRef",componentRef.current)

  const orderService = useOrderService();
  const paymentService = usePaymentService();
  const { fetchLensById } = useLensService();
  const { fetchVoucherById } = useVoucherService();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        const [orderResponse, paymentResponse] = await Promise.all([
          orderService.fetchOrderById(orderId),
          paymentService.fetchPaymentByOrderId(orderId)
        ]);

        setOrderData(orderResponse);
        setPaymentData(paymentResponse);

        if (paymentResponse.voucherID) {
          const voucherResponse = await fetchVoucherById(paymentResponse.voucherID);
          setVoucherDetails(voucherResponse);
        }

        const lensIds = paymentResponse.productGlass.reduce((ids: number[], item: any) => {
          if (!lensDetails[item.leftLen.id]) {
            ids.push(item.leftLen.id);
          }
          if (!lensDetails[item.rightLen.id] && item.leftLen.id !== item.rightLen.id) {
            ids.push(item.rightLen.id);
          }
          return ids;
        }, []);

        const detailsPromises = lensIds.map((id:any) => fetchLensById(id));
        const details = await Promise.all(detailsPromises);

        const newLensDetails = details.reduce((acc: any, lens) => {
          if (lens) {
            acc[lens.id] = {
              id: lens.id,
              lensName: lens.lensName,
              lensDescription: lens.lensDescription,
              lensPrice: lens.lensPrice,
              lensImage: lens.lensImage
            };
          }
          return acc;
        }, {});

        setLensDetails(newLensDetails);
        setIsLoading(false);
      } catch (error) {
        setError('Error fetching order details');
        setIsLoading(false);
        console.error('Error:', error);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Calculation functions similar to OrderSummary
  const calculateSubtotal = () => {
    try {
      if (!orderData?.orderDetails || !Array.isArray(orderData.orderDetails)) {
        console.error('Invalid orderDetails data');
        return 0;
      }
      
      return orderData.orderDetails.reduce((total: number, orderDetail: any) => {
        // Lấy total từ productGlass và nhân với quantity
        const itemTotal = Number(orderDetail.productGlass?.total || 0) * Number(orderDetail.quantity || 1);
        return total + itemTotal;
      }, 0);
    } catch (error) {
      console.error('Error calculating subtotal:', error);
      return 0;
    }
  };

  const calculateDiscount = () => {
    try {
      if (!voucherDetails || !voucherDetails.sale) return 0;
      const subtotal = calculateSubtotal();
      const discountAmount = (subtotal * Number(voucherDetails.sale)) / 100;
      return Math.min(discountAmount, subtotal);
    } catch (error) {
      console.error('Error calculating discount:', error);
      return 0;
    }
  };

  const calculateAmountAfterDiscount = () => {
    try {
      const subtotal = calculateSubtotal();
      const discount = calculateDiscount();
      return Math.max(0, subtotal - discount);
    } catch (error) {
      console.error('Error calculating amount after discount:', error);
      return 0;
    }
  };

  const calculateShippingCost = () => {
    try {
      // Chỉ tính phí ship khi chỉ có 1 lần payment
      if (!paymentData?.payments || paymentData.payments.length > 1) {
        return 0;
      }

      if (orderData?.receiverAddress) {
        return 30000; 
      }
      
      return 0; 
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      return 0;
    }
  };

  const calculateDepositAmount = () => {
    try {
      const amountAfterDiscount = calculateAmountAfterDiscount();
      if (!paymentData?.isDeposit) return amountAfterDiscount;
      return Math.round(amountAfterDiscount * 0.3);
    } catch (error) {
      console.error('Error calculating deposit amount:', error);
      return 0;
    }
  };

  const calculateRemainingPayment = () => {
    try {
      if (!paymentData?.isDeposit) return 0;
      const amountAfterDiscount = calculateAmountAfterDiscount();
      return Math.round(amountAfterDiscount * 0.7);
    } catch (error) {
      console.error('Error calculating remaining payment:', error);
      return 0;
    }
  };

  const isFirstPayment = () => {
    return paymentData?.payments?.length === 1;
  };

  const isSecondPayment = () => {
    return paymentData?.payments?.length === 2 && 
           paymentData?.payments[1]?.id === latestPayment?.id;
  };

  const calculateFinalAmount = () => {
    try {
      if (isSecondPayment()) {
        // Nếu là lần thanh toán thứ 2, trả về chính xác số tiền của payment đó
        return latestPayment.totalAmount;
      }

      // Logic cho lần thanh toán đầu tiên
      const depositAmount = calculateDepositAmount();
      const shipping = calculateShippingCost();
      return depositAmount + shipping;
    } catch (error) {
      console.error('Error calculating final amount:', error);
      return 0;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!orderData || !paymentData) {
    return <div className="text-center p-4">No data available</div>;
  }


  const receiptNumber = `#${orderData.id.toString().padStart(6, '0')}`;
  const latestPayment = paymentData.payments[paymentData.payments.length - 1];
  

  const renderPaymentSummary = () => (
    <section className={styles.paymentSection}>
      <div className={styles.paymentSummary}>
        <div className={styles.summaryTable}>
          {!isSecondPayment() && (
            <>
              {/* Subtotal */}
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              
              {/* Voucher Discount */}
              {voucherDetails && (
                <div className={`${styles.summaryRow} ${styles.discount}`}>
                  <span>Voucher Discount ({voucherDetails.code} - {voucherDetails.sale}%):</span>
                  <span>-{formatCurrency(calculateDiscount())}</span>
                </div>
              )}

              {/* Amount after discount */}
              <div className={`${styles.summaryRow} ${styles.subtotalRow}`}>
                <span>Amount After Discount:</span>
                <span>{formatCurrency(calculateAmountAfterDiscount())}</span>
              </div>

              {/* Deposit Amount if applicable */}
              {paymentData?.isDeposit && (
                <div className={styles.summaryRow}>
                  <span>Deposit Amount (30%):</span>
                  <span>{formatCurrency(calculateDepositAmount())}</span>
                </div>
              )}

              {/* Shipping Fee - chỉ hiển thị ở lần thanh toán đầu */}
              {isFirstPayment() && (
                <div className={styles.summaryRow}>
                  <span>Shipping Fee:</span>
                  <span>
                    {orderData?.kiosks ? 'Free' : formatCurrency(calculateShippingCost())}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Final Total */}
          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>
              {isSecondPayment() 
                ? 'Remaining Payment Amount:'
                : paymentData?.isDeposit 
                  ? 'Total Deposit Amount:'
                  : 'Total Amount:'}
            </span>
            <span>{formatCurrency(calculateFinalAmount())}</span>
          </div>

          {/* Show Remaining Amount if it's first payment and deposit */}
          {isFirstPayment() && paymentData?.isDeposit && (
            <div className={`${styles.summaryRow} ${styles.remaining}`}>
              <span>Remaining Balance:</span>
              <span>{formatCurrency(calculateRemainingPayment())}</span>
            </div>
          )}
        </div>

        <div className={styles.paymentMethods}>
          <h3>Payment Details</h3>
          {paymentData?.payments.map((payment: any, index: number) => (
            <div key={index} className={styles.paymentMethod}>
              <div className={styles.methodInfo}>
                <span className={styles.methodType}>
                  {payment.paymentMethod}
                  {index === 0 && paymentData.isDeposit && ' (Deposit)'}
                  {index === 1 && ' (Final Payment)'}
                </span>
                <span className={styles.methodDate}>{formatDate(payment.date)}</span>
              </div>
              <span className={styles.methodAmount}>
                {formatCurrency(payment.totalAmount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className={styles.printReceiptWrapper}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.brandSection}>
          <div className={styles.companyInfo}>
            <h1>{companyInfo.name}</h1>
            <div className={styles.companyDetails}>
              <div className={styles.detailItem}>
                <i className="fas fa-location-dot"></i>
                <span>{companyInfo.address}</span>
              </div>
              <div className={styles.detailItem}>
                <i className="fas fa-phone"></i>
                <span>{companyInfo.phone}</span>
              </div>
              <div className={styles.detailItem}>
                <i className="fas fa-envelope"></i>
                <span>{companyInfo.email}</span>
              </div>
              <div className={styles.detailItem}>
                <i className="fas fa-id-card"></i>
                <span>Tax ID: {companyInfo.taxId}</span>
              </div>
            </div>
          </div>
          <div className={styles.logoWrapper}>
            <Image
              src={Logo}
              alt={companyInfo.name}
              width={200}
              height={200}
              className={styles.logo}
              priority
            />
          </div>
        </div>

        <div className={styles.receiptDetails}>
          <div className={styles.receiptHeader}>
            <h2>SALES RECEIPT</h2>
            <div className={styles.receiptNumber}>{receiptNumber}</div>
          </div>
          <div className={styles.receiptInfo}>
            <div className={styles.infoItem}>
              <span>Date:</span>
              <strong>{formatDate(latestPayment?.date || orderData.orderTime)}</strong>
            </div>
            <div className={styles.infoItem}>
              <span>Staff:</span>
              <strong>{staffName}</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Products Section */}
      <section className={styles.productsSection}>
        <table className={styles.productsTable}>
          <thead>
            <tr>
              <th className={styles.productCol}>Product Details</th>
              <th className={styles.specCol}>Specifications</th>
              <th className={styles.amountCol}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {paymentData.productGlass.map((item: any, index: number) => (
              <React.Fragment key={index}>
                <tr className={styles.frameRow}>
                  <td className={styles.productInfo}>
                    <span className={styles.productLabel}>Frame</span>
                    <strong className={styles.productName}>{item.eyeGlass.name}</strong>
                    <span className={styles.productId}>#{item.productGlassID}</span>
                  </td>
                  <td className={styles.specifications}>
                    <div className={styles.specDetails}>Brand Specifications</div>
                  </td>
                  <td className={styles.amount}>
                    {formatCurrency(orderData.orderDetails[0].productGlass.eyeGlass.price)}
                  </td>
                </tr>
                <tr className={styles.lensRow}>
                  <td className={styles.productInfo}>
                    <span className={styles.productLabel}>Prescription Lenses</span>
                  </td>
                  <td className={styles.specifications}>
                    <div className={styles.lensSpecs}>
                      <div className={styles.lensDetail}>
                        <strong>Left Eye:</strong>
                        <p>{item.leftLen.lensName}</p>
                        {lensDetails[item.leftLen.id] && (
                          <div className={styles.lensPrice}>
                            Price: {formatCurrency(lensDetails[item.leftLen.id].lensPrice)}
                          </div>
                        )}
                      </div>
                      <div className={styles.lensDetail}>
                        <strong>Right Eye:</strong>
                        <p>{item.rightLen.lensName}</p>
                        {lensDetails[item.rightLen.id] && (
                          <div className={styles.lensPrice}>
                            Price: {formatCurrency(lensDetails[item.rightLen.id].lensPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={styles.amount}>
                    {formatCurrency(
                      (lensDetails[item.leftLen.id]?.lensPrice || 0) +
                      (lensDetails[item.rightLen.id]?.lensPrice || 0)
                    )}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>

      {/* Payment Summary */}
      {/* <section className={styles.paymentSection}>
        <div className={styles.paymentSummary}>
          <div className={styles.summaryTable}>
            <div className={styles.summaryRow}>
              <span>Subtotal:</span>
              <span>{formatCurrency(paymentData.totalAmount)}</span>
            </div>
            {paymentData.voucher && (
              <div className={`${styles.summaryRow} ${styles.discount}`}>
                <span>Discount ({paymentData.voucher.code}):</span>
                <span>-{formatCurrency(paymentData.voucher.discountValue)}</span>
              </div>
            )}
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total Amount:</span>
              <span>{formatCurrency(paymentData.totalAmount)}</span>
            </div>
            {paymentData.isDeposit && (
              <>
                <div className={`${styles.summaryRow} ${styles.paid}`}>
                  <span>Paid Amount:</span>
                  <span>{formatCurrency(paymentData.totalPaid)}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.remaining}`}>
                  <span>Remaining Balance:</span>
                  <span>{formatCurrency(paymentData.remainingAmount)}</span>
                </div>
              </>
            )}
          </div>

          <div className={styles.paymentMethods}>
            <h3>Payment Details</h3>
            {paymentData.payments.map((payment: any, index: number) => (
              <div key={index} className={styles.paymentMethod}>
                <div className={styles.methodInfo}>
                  <span className={styles.methodType}>{payment.paymentMethod}</span>
                  <span className={styles.methodDate}>{formatDate(payment.date)}</span>
                </div>
                <span className={styles.methodAmount}>
                  {formatCurrency(payment.totalAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {renderPaymentSummary()}

      {/* Footer */}
      {/* <footer className={styles.footer}>
        <div className={styles.qrSection}>
          <QRCodeCanvas
            value={`${companyInfo.website}/receipt/${receiptNumber}`}
            size={100}
            level="H"
          />
          <span>Scan for digital receipt</span>
        </div>

        <div className={styles.thankYouSection}>
          <h3>Thank you for your purchase!</h3>
          <p>
            For inquiries about your order, please contact us at {companyInfo.phone}
            <br />
            or visit our store with your receipt number: <strong>{receiptNumber}</strong>
          </p>
        </div>

        <div className={styles.copyright}>
          <p>This is an official receipt of {companyInfo.name}</p>
        </div>
      </footer> */}
    </div>
  );
};

export default PrintReceipt;