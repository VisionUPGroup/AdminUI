// OrderPrintButton.tsx
import React, { useState } from 'react';
import { FaPrint } from 'react-icons/fa';
import OrderPrintHandler from './OrderPrintHandler';
import styles from './OrderPrintButton.module.scss';
import LensDetail from '@/Components/Products/Lens/LensDetail';

interface OrderPrintButtonProps {
  order: any;
  accountInfo: any;
  paymentInfo: any;
  lensDetails: any;
}

const OrderPrintButton: React.FC<OrderPrintButtonProps> = ({
  order,
  accountInfo,
  paymentInfo,
  lensDetails
}) => {
  const [showPrintHandler, setShowPrintHandler] = useState(false);

  console.log("order",order);
  console.log("accountInfo",accountInfo);
  console.log("paymentInfo",paymentInfo);

  const handlePrint = () => {
    setShowPrintHandler(true);
  };

  const handlePrintComplete = () => {
    setShowPrintHandler(false);
  };

  const handlePrintError = (error: Error) => {
    console.error('Print failed:', error);
    setShowPrintHandler(false);
  };

  return (
    <>
      <button 
        onClick={handlePrint}
        className={styles.printButton}
        title="Print Order Receipt"
      >
        <FaPrint className={styles.printIcon} />
        <span>Print Receipt</span>
      </button>

      {showPrintHandler && (
        <OrderPrintHandler
          orderData={order}
          accountInfo={accountInfo}
          paymentInfo={paymentInfo}
          onPrintComplete={handlePrintComplete}
          onPrintError={handlePrintError}
          lensDetails={lensDetails}
        />
      )}
    </>
  );
};

export default OrderPrintButton;