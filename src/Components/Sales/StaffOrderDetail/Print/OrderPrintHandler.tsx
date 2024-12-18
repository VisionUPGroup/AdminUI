// OrderPrintHandler.tsx
import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import OrderPrintBill from './OrderPrintBill';
import styles from './OrderPrintHandler.module.scss';

interface OrderPrintHandlerProps {
  orderData: any;
  paymentInfo: any;
  accountInfo: any;
  onPrintComplete?: () => void;
  onPrintError?: (error: Error) => void;
}

const OrderPrintHandler: React.FC<OrderPrintHandlerProps> = ({
  orderData,
  paymentInfo,
  accountInfo,
  onPrintComplete,
  onPrintError
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printInitiated, setPrintInitiated] = useState(false);

  const companyInfo = {
    name: "VisionUp",
    address: "123 Vision Street, Ho Chi Minh City",
    phone: "+84 123 456 789",
    email: "contact@visionup.com",
    taxId: "0123456789",
    website: "www.visionup.com"
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Order-${orderData.id}`,
    onBeforePrint: async () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      if (onPrintComplete) {
        onPrintComplete();
      }
    },
    onPrintError: (errorLocation: "onBeforePrint" | "print", error: Error) => {
      setIsPrinting(false);
      console.error(`Print failed at ${errorLocation}:`, error);
      if (onPrintError) {
        onPrintError(error);
      }
    },
  });

  useEffect(() => {
    if (!printInitiated && componentRef.current) {
      setPrintInitiated(true);
      setTimeout(() => {
        handlePrint();
      }, 100);
    }
  }, [handlePrint, printInitiated]);

  return (
    <div style={{ display: 'none' }}>
      <div ref={componentRef}>
        <OrderPrintBill
          orderData={orderData}
          paymentInfo={paymentInfo}
          accountInfo={accountInfo}
          companyInfo={companyInfo}
        />
      </div>

      {isPrinting && (
        <div className={styles.printingOverlay}>
          <div className={styles.printingMessage}>
            Preparing document for printing...
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPrintHandler;