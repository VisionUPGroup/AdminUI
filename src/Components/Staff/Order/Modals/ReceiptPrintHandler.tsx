import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import PrintReceipt from './PrintReceipt';
import { OrderSuccessData } from '../types/orderSuccess';
import { CompanyInfo } from '../types/company';
import styles from '../styles/ReceiptPrintHandler.module.scss';

interface ReceiptPrintHandlerProps {
  orderData: OrderSuccessData;
  companyInfo: CompanyInfo;
  staffName: string;
  onPrintComplete?: () => void;
  onPrintError?: (error: Error) => void;
  onPrintStart?: () => void;
}

const ReceiptPrintHandler: React.FC<ReceiptPrintHandlerProps> = ({
  orderData,
  companyInfo,
  staffName,
  onPrintComplete,
  onPrintError,
  onPrintStart
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<Error | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Changed from content to contentRef
    documentTitle: `Receipt-${orderData.orderID}`,
    onBeforePrint: async () => {
      setIsPrinting(true);
      setPrintError(null);
      if (onPrintStart) {
        onPrintStart();
      }
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      if (!printError && onPrintComplete) {
        onPrintComplete();
      }
    },
    onPrintError: (errorLocation, error) => {
      console.error('Print failed:', error);
      setPrintError(error);
      if (onPrintError) {
        onPrintError(error);
      }
    }
  });

  useEffect(() => {
    if (componentRef.current) {
      handlePrint();
    }
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <div ref={componentRef}>
        <PrintReceipt
          orderId={orderData.orderID}
          companyInfo={companyInfo}
          staffName={staffName}
        />
      </div>

      {printError && (
        <div className={styles.errorMessage} role="alert">
          <p>Error printing receipt: {printError.message}</p>
        </div>
      )}

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

export default ReceiptPrintHandler;