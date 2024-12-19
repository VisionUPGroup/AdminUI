import React from 'react';
import Image from 'next/image';
import Logo from '../../../../../public/assets/images/visionUp/logo.jpg';
import styles from './OrderPrintBill.module.scss';

interface LensDetail {
  id: number;
  lensName: string;
  lensDescription: string;
  lensPrice: number;
  eyeReflactive: {
    reflactiveName: string;
  };
  lensType: {
    name: string;
  };
}

interface LensDetailsMap {
  [key: string]: {
    leftLens: LensDetail | null;
    rightLens: LensDetail | null;
  };
}

// OrderPrintBill.tsx
interface OrderDetail {
  id: number;
  productGlass: {
    id: number;
    leftLenID: number | null;
    rightLenID: number | null;
    eyeGlass: {
      name: string;
      price: number;
    };
  };
}

interface PaymentInfo {
  payments: Array<{
    paymentMethod: string;
    date: string;
    code: string;
    totalAmount: number;
  }>;
}

interface OrderPrintBillProps {
  orderData: {
    id: number;
    orderTime: string;
    total: number;
    isDeposit: boolean;
    kiosks: {
      name: string;
    };
    orderDetails: OrderDetail[];
  };
  paymentInfo: PaymentInfo;
  accountInfo: {
    username: string;
    email: string;
    phoneNumber: string;
  };
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
    website: string;
  };
  lensDetails: LensDetailsMap;
}

const OrderPrintBill: React.FC<OrderPrintBillProps> = ({
  orderData,
  paymentInfo,
  accountInfo,
  companyInfo,
  lensDetails
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log("lensDetails",lensDetails)

  const renderLensInfo = (lens: LensDetail | null, side: string) => {
    if (!lens) return null;

    return (
      <div className={styles.lensInfo}>
        <strong>{side} Lens:</strong>
        <div>Name: {lens.lensName || 'N/A'}</div>
        {/* <div>Type: {lens.lensType?.name || 'N/A'}</div> */}
        {/* <div>Reflactive: {lens.eyeReflactive?.reflactiveName || 'N/A'}</div> */}
        <div className={styles.price}>
          Price: {formatCurrency(lens.lensPrice || 0)}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.printBillWrapper}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.brandSection}>
          <div className={styles.companyInfo}>
            <div className={styles.companyDetails}>
              <div>Address: {companyInfo.address}</div>
              <div>Phone: {companyInfo.phone}</div>
              <div>Email: {companyInfo.email}</div>
              <div>Tax ID: {companyInfo.taxId}</div>
            </div>
          </div>
          <div className={styles.logoWrapper}>
            <Image
              src={Logo}
              alt={companyInfo.name}
              width={500}
              height={500}
              className={styles.logo}
              priority
            />
          </div>
        </div>

        <div className={styles.receiptInfo}>
          <h2>SALES RECEIPT</h2>
          <div className={styles.receiptDetails}>
            <div>Receipt No: #{orderData.id.toString().padStart(6, '0')}</div>
            <div>Date: {formatDateTime(orderData.orderTime)}</div>
            <div>Staff: {orderData.kiosks?.name || 'Staff'}</div>
          </div>
        </div>
      </header>

      {/* Customer Information */}
      <section className={styles.customerSection}>
        <h3>Customer Information</h3>
        <div className={styles.customerDetails}>
          <div>Name: {accountInfo.username}</div>
          <div>Phone: {accountInfo.phoneNumber}</div>
          <div>Email: {accountInfo.email}</div>
        </div>
      </section>

      {/* Products Section */}
      <section className={styles.productsSection}>
        <h3>Product Details</h3>
        <table className={styles.productsTable}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Details</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {orderData.orderDetails?.map((detail, index) => {
              const productGlass = detail.productGlass;
              const currentLensDetails = lensDetails[productGlass.id.toString()];
              const eyeGlass = productGlass.eyeGlass;
              console.log("currentLensDetails",currentLensDetails)

              return (
                <React.Fragment key={index}>
                  {/* Frame Information */}
                  <tr className={styles.frameRow}>
                    <td>
                      <div className={styles.productName}>
                        EyeGlass: {eyeGlass.name}
                      </div>
                      <div className={styles.productId}>ID: #{productGlass.id}</div>
                    </td>
                    <td>
                      <div className={styles.frameDetails}>
                        <div>Price: {formatCurrency(eyeGlass.price)}</div>
                      </div>
                    </td>
                    <td className={styles.price}>
                      {formatCurrency(eyeGlass.price)}
                    </td>
                  </tr>

                  {/* Lens Information */}
                  <tr className={styles.lensRow}>
                    <td>Prescription Lenses</td>
                    <td>
                      <div className={styles.lensDetails}>
                        {renderLensInfo(currentLensDetails?.leftLens, 'Left')}
                        {renderLensInfo(currentLensDetails?.rightLens, 'Right')}
                      </div>
                    </td>
                    <td className={styles.price}>
                      {formatCurrency(
                        (currentLensDetails?.leftLens?.lensPrice || 0) +
                        (currentLensDetails?.rightLens?.lensPrice || 0)
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Payment Summary */}
      <section className={styles.paymentSection}>
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Subtotal:</span>
            <span>{formatCurrency(orderData.total)}</span>
          </div>

          {orderData.isDeposit && (
            <>
              <div className={styles.summaryRow}>
                <span>Deposit Amount (30%):</span>
                <span>{formatCurrency(orderData.total * 0.3)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Remaining Amount:</span>
                <span>{formatCurrency(orderData.total * 0.7)}</span>
              </div>
            </>
          )}

          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Total Amount:</span>
            <span>{formatCurrency(orderData.total)}</span>
          </div>
        </div>

        <div className={styles.paymentMethod}>
          <h4>Payment Information</h4>
          {paymentInfo?.payments?.map((payment, index) => (
            <div key={index} className={styles.paymentItem}>
              <div>
                <div>Method: {payment.paymentMethod}</div>
                <div>Date: {formatDateTime(payment.date)}</div>
                <div>Code: {payment.code}</div>
              </div>
              <div>{formatCurrency(payment.totalAmount)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default OrderPrintBill;