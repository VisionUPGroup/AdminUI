// components/PrintReceipt/PrintReceipt.tsx

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { OrderSuccessData } from '../types/orderSuccess';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CompanyInfo } from '../types/company';
import styles from '../styles/PrintReceipt.module.scss';
import Image from 'next/image' 
import Logo from '../../../../../public/assets/images/visionUp/logo.jpg'

interface PrintReceiptProps {
  orderData: OrderSuccessData;
  companyInfo: CompanyInfo;
  staffName: string;
}

const PrintReceipt: React.FC<PrintReceiptProps> = ({
  orderData,
  companyInfo,
  staffName
}) => {
  const receiptNumber = `#${orderData.orderID.toString().padStart(6, '0')}`;
  const latestPayment = orderData.payments[orderData.payments.length - 1];
  console.log("tung",orderData )

  return (
    <div className={styles.printReceiptWrapper}>
      {/* Enhanced Header */}
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
              <strong>{formatDate(latestPayment?.date || new Date().toISOString())}</strong>
            </div>
            <div className={styles.infoItem}>
              <span>Staff:</span>
              <strong>{staffName}</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Products Section */}
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
            {orderData.productGlass.map((item, index) => (
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
                    {formatCurrency(orderData.totalAmount / 2)}
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
                        <small>{item.leftLen.lensDescription}</small>
                      </div>
                      <div className={styles.lensDetail}>
                        <strong>Right Eye:</strong>
                        <p>{item.rightLen.lensName}</p>
                        <small>{item.rightLen.lensDescription}</small>
                      </div>
                    </div>
                  </td>
                  <td className={styles.amount}>
                    {formatCurrency(orderData.totalAmount / 2)}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>

      {/* Enhanced Payment Summary */}
      <section className={styles.paymentSection}>
        <div className={styles.paymentSummary}>
          <div className={styles.summaryTable}>
            <div className={styles.summaryRow}>
              <span>Subtotal:</span>
              <span>{formatCurrency(orderData.totalAmount)}</span>
            </div>
            {orderData.voucher && (
              <div className={`${styles.summaryRow} ${styles.discount}`}>
                <span>Discount ({orderData.voucher.code}):</span>
                <span>-{formatCurrency(orderData.voucher.discountValue)}</span>
              </div>
            )}
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total Amount:</span>
              <span>{formatCurrency(orderData.totalAmount)}</span>
            </div>
            {orderData.isDeposit && (
              <>
                <div className={`${styles.summaryRow} ${styles.paid}`}>
                  <span>Paid Amount:</span>
                  <span>{formatCurrency(orderData.totalPaid)}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.remaining}`}>
                  <span>Remaining Balance:</span>
                  <span>{formatCurrency(orderData.remainingAmount)}</span>
                </div>
              </>
            )}
          </div>

          <div className={styles.paymentMethods}>
            <h3>Payment Details</h3>
            {orderData.payments.map((payment, index) => (
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
      </section>

      {/* Enhanced Footer */}
      <footer className={styles.footer}>
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
      </footer>
    </div>
  );
};

export default PrintReceipt;