// components/PrintReceipt/PrintReceipt.tsx

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { OrderSuccessData } from '../types/orderSuccess';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CompanyInfo } from '../types/company';
import styles from '../styles/PrintReceipt.module.scss';

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
  const receiptNumber = `VSR${orderData.orderID.toString().padStart(6, '0')}`;
  const latestPayment = orderData.payments[orderData.payments.length - 1];

  return (
    <div className={styles.printReceiptWrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoSection}>
          <img src={companyInfo.logo} alt="Company Logo" />
          <div className={styles.companyDetails}>
            <h1>{companyInfo.name}</h1>
            <p>{companyInfo.address}</p>
            <p>Tel: {companyInfo.phone}</p>
            <p>Email: {companyInfo.email}</p>
            <p>Tax ID: {companyInfo.taxId}</p>
          </div>
        </div>
        
        <div className={styles.receiptInfo}>
          <h2>SALES RECEIPT</h2>
          <table>
            <tbody>
              <tr>
                <td>Receipt No:</td>
                <td>{receiptNumber}</td>
              </tr>
              <tr>
                <td>Date:</td>
                <td>{formatDate(latestPayment?.date || new Date().toISOString())}</td>
              </tr>
              <tr>
                <td>Staff:</td>
                <td>{staffName}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Section */}
      <div className={styles.productsSection}>
        <table className={styles.productsTable}>
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Specifications</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {orderData.productGlass.map((item, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td>
                    <strong>{item.eyeGlass.name}</strong>
                    <br />
                    <span className={styles.itemType}>Frame</span>
                  </td>
                  <td>Product ID: #{item.eyeGlass.id}</td>
                  <td className={styles.amount}>
                    {formatCurrency(orderData.totalAmount / 2)}
                  </td>
                </tr>
                <tr className={styles.lensRow}>
                  <td>
                    <span className={styles.itemType}>Prescription Lenses</span>
                  </td>
                  <td>
                    <div className={styles.lensSpecs}>
                      <p>Left: {item.leftLen.lensName}</p>
                      <small>{item.leftLen.lensDescription}</small>
                      <p>Right: {item.rightLen.lensName}</p>
                      <small>{item.rightLen.lensDescription}</small>
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
      </div>

      {/* Payment Summary */}
      <div className={styles.paymentSummary}>
        <table>
          <tbody>
            <tr>
              <td>Subtotal:</td>
              <td>{formatCurrency(orderData.totalAmount)}</td>
            </tr>
            {orderData.voucher && (
              <tr className={styles.discount}>
                <td>Discount ({orderData.voucher.code}):</td>
                <td>-{formatCurrency(orderData.voucher.discountValue)}</td>
              </tr>
            )}
            <tr className={styles.total}>
              <td>Total Amount:</td>
              <td>{formatCurrency(orderData.totalAmount)}</td>
            </tr>
            {orderData.isDeposit && (
              <>
                <tr className={styles.paid}>
                  <td>Paid Amount:</td>
                  <td>{formatCurrency(orderData.totalPaid)}</td>
                </tr>
                <tr className={styles.remaining}>
                  <td>Remaining Balance:</td>
                  <td>{formatCurrency(orderData.remainingAmount)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        <div className={styles.paymentMethod}>
          <p>Payment Method:</p>
          {orderData.payments.map((payment, index) => (
            <div key={index} className={styles.paymentDetail}>
              <span>{payment.paymentMethod}</span>
              <span>{formatCurrency(payment.totalAmount)}</span>
              <small>{formatDate(payment.date)}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.qrCodeSection}>
          <QRCodeCanvas
            value={`${companyInfo.website}/receipt/${receiptNumber}`}
            size={80}
            level="H"
          />
          <small>Scan for digital receipt</small>
        </div>

        <div className={styles.terms}>
          <p>Thank you for your purchase!</p>
          <small>
            For any inquiries about your order, please contact us at {companyInfo.phone}
            <br />
            or visit our store with your receipt number: {receiptNumber}
          </small>
        </div>

        <div className={styles.copySection}>
          <small>This is an official receipt of {companyInfo.name}</small>
        </div>
      </div>
    </div>
  );
};

export default PrintReceipt;