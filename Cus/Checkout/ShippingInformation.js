import React, { useEffect, useState } from 'react';
import styles from './checkout.module.scss';
import { kioskService } from '../../../../../Api/kioskService'; // Import kioskService

const ShippingInformation = ({ register, errors, watch, setValue, shippingMethod, setShippingMethod }) => {
  const [kiosks, setKiosks] = useState([]); // Thêm state cho danh sách kiosk
  const [selectedKiosk, setSelectedKiosk] = useState(null); // Thêm state cho kiosk đã chọn

  // Fetch kiosks data
  useEffect(() => {
    const fetchKiosksData = async () => {
      try {
        const kioskData = await kioskService().fetchKiosks();
        setKiosks(kioskData);
      } catch (error) {
        console.error('Error fetching kiosks:', error);
      }
    };
    fetchKiosksData();
  }, []);

  const handleShippingMethodChange = (method) => {
    setShippingMethod(method);
  };

  const handleKioskChange = (event) => {
    const kioskId = event.target.value;
    const kiosk = kiosks.find(k => k.id === parseInt(kioskId));
    setSelectedKiosk(kiosk);
    setValue('kioskId', kioskId);
  };

  return (
    <div className={styles.shippingSection}>
      <div className={styles.shippingMethods}>
        <div
          className={`${styles.methodOption} ${shippingMethod === 'customer' ? styles.active : ''}`}
          onClick={() => handleShippingMethodChange('customer')}
        >
          <input
            type="radio"
            name="shippingMethod"
            checked={shippingMethod === 'customer'}
            onChange={() => handleShippingMethodChange('customer')}
          />
          <div className={styles.methodDetails}>
            <span className={styles.methodTitle}>Customer Address</span>
            <span className={styles.methodDescription}>Deliver to your address</span>
          </div>
        </div>

        <div
          className={`${styles.methodOption} ${shippingMethod === 'kiosk' ? styles.active : ''}`}
          onClick={() => handleShippingMethodChange('kiosk')}
        >
          <input
            type="radio"
            name="shippingMethod"
            checked={shippingMethod === 'kiosk'}
            onChange={() => handleShippingMethodChange('kiosk')}
          />
          <div className={styles.methodDetails}>
            <span className={styles.methodTitle}>Kiosk Pickup</span>
            <span className={styles.methodDescription}>Pick up from a nearby kiosk</span>
          </div>
        </div>
      </div>

      {shippingMethod === 'customer' && (
        <div className={styles.customerAddress}>
          <div className={styles.formGroupRow}>
            <div className={styles.formGroup}>
              <label>Street Address *</label>
              <input
                type="text"
                {...register('address', { required: 'Address is required' })}
                className={errors.address ? styles.error : ''}
              />
              {errors.address && <span className={styles.errorMessage}>{errors.address.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>City *</label>
              <input
                type="text"
                {...register('city', { required: 'City is required' })}
                className={errors.city ? styles.error : ''}
              />
              {errors.city && <span className={styles.errorMessage}>{errors.city.message}</span>}
            </div>
          </div>
          <div className={styles.formGroupRow}>
            <div className={styles.formGroup}>
              <label>State/Province *</label>
              <input
                type="text"
                {...register('state', { required: 'State is required' })}
                className={errors.state ? styles.error : ''}
              />
              {errors.state && <span className={styles.errorMessage}>{errors.state.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>ZIP/Postal Code *</label>
              <input
                type="text"
                {...register('zipCode', {
                  required: 'ZIP code is required',
                  pattern: {
                    value: /^[0-9]{4,6}$/,
                    message: 'Invalid ZIP code'
                  }
                })}
                className={errors.zipCode ? styles.error : ''}
              />
              {errors.zipCode && <span className={styles.errorMessage}>{errors.zipCode.message}</span>}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Country/Region *</label>
            <select
              {...register('country', { required: 'Country is required' })}
              className={errors.country ? styles.error : ''}
            >
              <option value="">Select country</option>
              <option value="VN">Vietnam</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
            </select>
            {errors.country && <span className={styles.errorMessage}>{errors.country.message}</span>}
          </div>
        </div>
      )}

      {shippingMethod === 'kiosk' && (
        <div className={styles.kioskSelection}>
          <div className={styles.formGroup}>
            <label>Kiosk *</label>
            <select
              {...register('kioskId', { required: 'Kiosk is required' })}
              className={errors.kioskId ? styles.error : ''}
              onChange={handleKioskChange}
            >
              <option value="">Select a kiosk</option>
              {kiosks.map((kiosk) => (
                <option key={kiosk.id} value={kiosk.id}>
                  {kiosk.name} - {kiosk.address}
                </option>
              ))}
            </select>
            {errors.kioskId && <span className={styles.errorMessage}>{errors.kioskId.message}</span>}
          </div>
          {selectedKiosk && (
            <div className={styles.selectedKioskDetails}>
              <h4>Kiosk Details</h4>
              <p><strong>Name:</strong> {selectedKiosk.name}</p>
              <p><strong>Address:</strong> {selectedKiosk.address}</p>
              <p><strong>Phone:</strong> {selectedKiosk.phoneNumber}</p>
              <p><strong>Email:</strong> {selectedKiosk.email}</p>
              <p><strong>Opening Hours:</strong> {selectedKiosk.openingHours.split('-')[0]} to {selectedKiosk.openingHours.split('-')[1]}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShippingInformation;