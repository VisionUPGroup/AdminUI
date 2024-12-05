import React, { useEffect, useState } from 'react';
import { useKioskService } from '../../../../../Api/kioskService';
import styles from '../styles/OrderSummary.module.scss';

interface ShippingInformationProps {
  onMethodSelect: (method: 'customer' | 'kiosk') => void;
  onAddressSelect: (address: string) => void;
  onKioskSelect: (kioskId: number) => void;
  selectedMethod: 'customer' | 'kiosk';
}

interface Kiosk {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  openingHours: string;
  status: boolean;
}

const ShippingInformation: React.FC<ShippingInformationProps> = ({
  onMethodSelect,
  onAddressSelect,
  onKioskSelect,
  selectedMethod,
}) => {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'VN'
  });
  const { fetchAllKiosk } = useKioskService();

  useEffect(() => {
    const loadKiosks = async () => {
      try {
        const kioskData = await fetchAllKiosk();
        const activeKiosks = kioskData.filter((kiosk: Kiosk) => kiosk.status === true);
        setKiosks(activeKiosks);
      } catch (error) {
        console.error('Error fetching kiosks:', error);
      }
    };
    loadKiosks();
  }, []);

  const handleAddressChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newAddress = { ...address, [field]: e.target.value };
    setAddress(newAddress);
    const fullAddress = `${newAddress.street}, ${newAddress.city}, ${newAddress.state}, ${newAddress.zipCode}, ${newAddress.country}`;
    onAddressSelect(fullAddress);
  };

  const handleKioskSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const kioskId = parseInt(e.target.value);
    const kiosk = kiosks.find(k => k.id === kioskId);
    setSelectedKiosk(kiosk || null);
    if (kiosk) {
      onKioskSelect(kiosk.id);
    }
  };

  return (
    <div className={styles.shippingMethods}>
      <div className={`${styles.methodOption} ${selectedMethod === 'customer' ? styles.active : ''}`}
        onClick={() => onMethodSelect('customer')}>
        <input
          type="radio"
          name="shippingMethod"
          checked={selectedMethod === 'customer'}
          onChange={() => onMethodSelect('customer')}
        />
        <div className={styles.methodDetails}>
          <span className={styles.methodTitle}>Customer Address</span>
          <span className={styles.methodDescription}>Deliver to customer address</span>
        </div>
      </div>

      <div className={`${styles.methodOption} ${selectedMethod === 'kiosk' ? styles.active : ''}`}
        onClick={() => onMethodSelect('kiosk')}>
        <input
          type="radio"
          name="shippingMethod"
          checked={selectedMethod === 'kiosk'}
          onChange={() => onMethodSelect('kiosk')}
        />
        <div className={styles.methodDetails}>
          <span className={styles.methodTitle}>Kiosk Pickup</span>
          <span className={styles.methodDescription}>Pick up from a nearby kiosk</span>
        </div>
      </div>

      {selectedMethod === 'customer' && (
        <div className={styles.customerAddress}>
          <div className={styles.formGroupRow}>
            <div className={styles.formGroup}>
              <label>Street Address *</label>
              <input
                type="text"
                value={address.street}
                onChange={handleAddressChange('street')}
                placeholder="Enter street address"
              />
            </div>
            <div className={styles.formGroup}>
              <label>City *</label>
              <input
                type="text"
                value={address.city}
                onChange={handleAddressChange('city')}
                placeholder="Enter city"
              />
            </div>
          </div>
          <div className={styles.formGroupRow}>
            <div className={styles.formGroup}>
              <label>State/Province *</label>
              <input
                type="text"
                value={address.state}
                onChange={handleAddressChange('state')}
                placeholder="Enter state/province"
              />
            </div>
            <div className={styles.formGroup}>
              <label>ZIP/Postal Code *</label>
              <input
                type="text"
                value={address.zipCode}
                onChange={handleAddressChange('zipCode')}
                placeholder="Enter ZIP code"
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Country/Region *</label>
            <select
              value={address.country}
              onChange={handleAddressChange('country')}
            >
              <option value="VN">Vietnam</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
            </select>
          </div>
        </div>
      )}

      {selectedMethod === 'kiosk' && (
        <div className={styles.formGroup}>
          <label>Select Kiosk *</label>
          <select onChange={handleKioskSelect}>
            <option value="">Choose a kiosk</option>
            {kiosks.map((kiosk) => (
              <option key={kiosk.id} value={kiosk.id}>
                {kiosk.name} - {kiosk.address}
              </option>
            ))}
          </select>

          {selectedKiosk && (
            <div className={styles.kioskDetails}>
              <h4>Kiosk Details</h4>
              <p><strong>Name:</strong> {selectedKiosk.name}</p>
              <p><strong>Address:</strong> {selectedKiosk.address}</p>
              <p><strong>Phone:</strong> {selectedKiosk.phoneNumber}</p>
              <p><strong>Opening Hours:</strong> {selectedKiosk.openingHours}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShippingInformation;