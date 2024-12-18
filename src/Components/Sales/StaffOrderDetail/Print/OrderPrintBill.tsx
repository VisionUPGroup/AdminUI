// OrderPrintBill.tsx
import React, { useState, useEffect,useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Image from 'next/image';
import Logo from '../../../../../public/assets/images/visionUp/logo.jpg';
import styles from './OrderPrintBill.module.scss';
import { useLensService } from '../../../../../Api/lensService';

interface OrderPrintBillProps {
  orderData: any;
  paymentInfo: any;
  accountInfo: any;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
    website: string;
    
  };
  onDataReady?: () => void;
}

const OrderPrintBill: React.FC<OrderPrintBillProps> = ({
  orderData,
  paymentInfo,
  accountInfo,
  companyInfo,
  onDataReady
}) => {

  const { fetchLensById } = useLensService();
  const [lensDetails, setLensDetails] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };
  console.log("orderData", orderData)

  const fetchLensDetails = useCallback(async () => {
    if (!orderData?.orderDetails?.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setDataLoadError(null);
    const detailsMap: { [key: string]: any } = {};

    try {
      for (const detail of orderData.orderDetails) {
        const productGlass = detail.productGlass;
        if (!productGlass) continue;

        const [leftLensData, rightLensData] = await Promise.all([
          productGlass.leftLenID ? fetchLensById(productGlass.leftLenID) : Promise.resolve(null),
          productGlass.rightLenID ? fetchLensById(productGlass.rightLenID) : Promise.resolve(null)
        ]);

        detailsMap[productGlass.id] = {
          leftLens: leftLensData || null,
          rightLens: rightLensData || null
        };
      }

      setLensDetails(detailsMap);
      setIsLoading(false);
      if (onDataReady) {
        onDataReady();
      }
    } catch (error) {
      console.error('Error fetching lens details:', error);
      setDataLoadError('Error loading lens details. Please try again.');
      setIsLoading(false);
    }
  }, [orderData, fetchLensById, onDataReady]);

  useEffect(() => {
    fetchLensDetails();
  }, [fetchLensDetails]);

  // Prevent rendering until data is ready
  if (isLoading) {
    return <div style={{ display: 'none' }}>Loading...</div>;
  }

  if (dataLoadError) {
    return <div style={{ display: 'none' }}>{dataLoadError}</div>;
  }

  const renderLensInfo = (lens: any, side: string) => {
    console.log(`Rendering ${side} lens info:`, lens);
    if (!lens) return (
      <div className={styles.lensInfo}>
        <strong>{side} Lens:</strong>
        <div>No lens selected</div>
      </div>
    );

    return (
      <div className={styles.lensInfo}>
        <strong>{side} Lens:</strong>
        <div>Name: {lens?.lensName || 'N/A'}</div>
        <div>Type: {lens?.lensType?.name || 'N/A'}</div>
        <div>Reflactive: {lens?.eyeReflactive?.reflactiveName || 'N/A'}</div>
        <div className={styles.price}>
          Price: {formatCurrency(lens?.lensPrice || 0)}
        </div>
      </div>
    );
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

  const calculateTotal = () => {
    if (!orderData?.orderDetails) return 0;
    return orderData.total;
  };

  // Tính toán giảm giá từ voucher
  const calculateVoucherDiscount = () => {
    if (!paymentInfo?.voucher?.sale) return 0;
    const subtotal = calculateTotal();
    return (subtotal * paymentInfo.voucher.sale) / 100;
  };

  console.log("productGlass",orderData)

  return (
    <div className={styles.printBillWrapper}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.brandSection}>
          <div className={styles.companyInfo}>
            {/* <h1>{companyInfo.name}</h1> */}
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
            <div>Staff: {accountInfo?.profiles?.[0]?.fullName || 'Staff'}</div>
          </div>
        </div>
      </header>

      {/* Customer Information */}
      <section className={styles.customerSection}>
        <h3>Customer Information</h3>
        <div className={styles.customerDetails}>
          <div>Name: {accountInfo?.username || 'N/A'}</div>
          <div>Phone: {accountInfo?.phoneNumber || 'N/A'}</div>
          <div>Email: {accountInfo?.email || 'N/A'}</div>
        </div>
      </section>

      {/* Products Section */}
      <section className={styles.productsSection}>
        <h3>Product Details</h3>
        {isLoading ? (
          <div>Loading product details...</div>
        ) : (
          <table className={styles.productsTable}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Details</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {orderData?.orderDetails?.map((orderDetail: any, index: number) => {
                const productGlass = orderDetail.productGlass;
                const currentLensDetails = lensDetails[productGlass.id];
                console.log('Rendering product row:', {
                  productGlass,
                  currentLensDetails,
                  lensDetails
                });

                
                return (
                  <React.Fragment key={index}>
                    {/* Frame Information */}
                    <tr className={styles.frameRow}>
                      <td>
                        <div className={styles.productName}>
                          EyeGlass: {productGlass?.eyeGlass?.name || 'N/A'}
                        </div>
                        <div className={styles.productId}>ID: #{productGlass?.id}</div>
                      </td>
                      <td>
                        <div className={styles.frameDetails}>
                          <div>Brand: {productGlass?.eyeGlass?.brandName || 'N/A'}</div>
                          <div>Category: {productGlass?.eyeGlass?.categoryGlassName || 'N/A'}</div>
                          {productGlass?.eyeGlass?.description && (
                            <div>Description: {productGlass.eyeGlass.description}</div>
                          )}
                        </div>
                      </td>
                      <td className={styles.price}>
                        {formatCurrency(productGlass?.eyeGlass?.price || 0)}
                      </td>
                    </tr>

                    {/* Lens Information */}
                    <tr className={styles.lensRow}>
                      <td>Prescription Lenses</td>
                      <td>
                        <div className={styles.lensDetails}>
                          {currentLensDetails ? (
                            <>
                              {renderLensInfo(currentLensDetails.leftLens, 'Left')}
                              {renderLensInfo(currentLensDetails.rightLens, 'Right')}
                              <div className={styles.pdInfo}>
                                <strong>Total Lens Price:</strong>
                                {formatCurrency(
                                  (currentLensDetails.leftLens?.lensPrice || 0) +
                                  (currentLensDetails.rightLens?.lensPrice || 0)
                                )}
                              </div>
                            </>
                          ) : (
                            <div>Loading lens details...</div>
                          )}
                        </div>
                      </td>
                      <td className={styles.price}>
                        {currentLensDetails ? formatCurrency(
                          (currentLensDetails.leftLens?.lensPrice || 0) +
                          (currentLensDetails.rightLens?.lensPrice || 0)
                        ) : 'Loading...'}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Payment Summary */}
      <section className={styles.paymentSection}>
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Subtotal:</span>
            <span>{formatCurrency(calculateTotal())}</span>
          </div>

          {/* Voucher Discount */}
          {paymentInfo?.voucher && (
            <div className={`${styles.summaryRow} ${styles.discount}`}>
              <span>
                Voucher Discount ({paymentInfo.voucher.code} - {paymentInfo.voucher.sale}%):
              </span>
              <span>-{formatCurrency(calculateVoucherDiscount())}</span>
            </div>
          )}

          {paymentInfo?.isDeposit && (
            <>
              <div className={styles.summaryRow}>
                <span>Deposit Amount (30%):</span>
                <span>{formatCurrency(calculateTotal() * 0.3)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Remaining Amount:</span>
                <span>{formatCurrency(calculateTotal() * 0.7)}</span>
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
          {paymentInfo?.payments.map((payment: any, index: number) => (
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

      {/* Footer */}
      {/* <footer className={styles.footer}>
        <div className={styles.qrCode}>
          <QRCodeCanvas 
            value={`${companyInfo.website}/order/${orderData.id}`}
            size={100}
          />
          <span>Scan for digital receipt</span>
        </div>
        
        <div className={styles.footerText}>
          <p>Thank you for your purchase!</p>
          <p>For any inquiries, please contact us at {companyInfo.phone}</p>
          <p>Receipt No: #{orderData.id.toString().padStart(6, '0')}</p>
        </div>
      </footer> */}
    </div>
  );
};

export default OrderPrintBill;