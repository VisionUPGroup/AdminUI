// StaffShippingInformation.tsx
import React, { useEffect, useState } from 'react';
import { useKioskService } from '../../../../../Api/kioskService';
import { MdStorefront, MdLocalShipping, MdError } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
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

interface Province {
  code: string;
  name: string;
  division_type: string;
}

interface District {
  code: string;
  name: string;
  division_type: string;
}

interface Ward {
  code: string;
  name: string;
  division_type: string;
}

const StaffShippingInformation: React.FC<ShippingInformationProps> = ({
  onMethodSelect,
  onAddressSelect,
  onKioskSelect,
  selectedMethod,
}) => {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Address states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');

  const { fetchAllKiosk } = useKioskService();

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (err) {
        console.error('Error fetching provinces:', err);
        setError('Không thể tải danh sách tỉnh/thành phố');
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province is selected
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvince) {
        setDistricts([]);
        return;
      }
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
        const data = await response.json();
        setDistricts(data.districts);
      } catch (err) {
        console.error('Error fetching districts:', err);
        setError('Không thể tải danh sách quận/huyện');
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  // Fetch wards when district is selected
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedDistrict) {
        setWards([]);
        return;
      }
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
        const data = await response.json();
        setWards(data.wards);
      } catch (err) {
        console.error('Error fetching wards:', err);
        setError('Không thể tải danh sách phường/xã');
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  // Fetch kiosks data
  useEffect(() => {
    const loadKiosks = async () => {
      try {
        setIsLoading(true);
        const kioskData = await fetchAllKiosk();
        const activeKiosks = kioskData.filter((kiosk: Kiosk) => kiosk.status);
        setKiosks(activeKiosks);
      } catch (err) {
        setError('Không thể tải danh sách cửa hàng');
      } finally {
        setIsLoading(false);
      }
    };
    loadKiosks();
  }, []);

  // Update full address when any address component changes
  useEffect(() => {
    if (selectedMethod === 'customer') {
      const province = provinces.find(p => p.code === selectedProvince)?.name || '';
      const district = districts.find(d => d.code === selectedDistrict)?.name || '';
      const ward = wards.find(w => w.code === selectedWard)?.name || '';
      
      const fullAddress = [
        streetAddress,
        ward,
        district,
        province
      ].filter(Boolean).join(', ');

      onAddressSelect(fullAddress);
    }
  }, [streetAddress, selectedWard, selectedDistrict, selectedProvince]);

  const handleShippingMethodChange = (method: 'customer' | 'kiosk') => {
    onMethodSelect(method);
    if (method === 'kiosk') {
      // Reset address when switching to kiosk
      setStreetAddress('');
      setSelectedProvince('');
      setSelectedDistrict('');
      setSelectedWard('');
    } else {
      // Reset kiosk when switching to customer
      setSelectedKiosk(null);
      onKioskSelect(0);
    }
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
    <div className={styles.shippingSection}>
      <div className={styles.shippingMethods}>
        <motion.div
          className={`${styles.methodOption} ${selectedMethod === 'customer' ? styles.active : ''}`}
          onClick={() => handleShippingMethodChange('customer')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            type="radio"
            name="shippingMethod"
            checked={selectedMethod === 'customer'}
            onChange={() => handleShippingMethodChange('customer')}
          />
          <div className={styles.methodIcon}>
            <MdLocalShipping size={24} />
          </div>
          <div className={styles.methodDetails}>
            <span className={styles.methodTitle}>Home Delivery</span>
            <span className={styles.methodDescription}>Deliver to customer's address</span>
          </div>
        </motion.div>

        <motion.div
          className={`${styles.methodOption} ${selectedMethod === 'kiosk' ? styles.active : ''}`}
          onClick={() => handleShippingMethodChange('kiosk')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            type="radio"
            name="shippingMethod"
            checked={selectedMethod === 'kiosk'}
            onChange={() => handleShippingMethodChange('kiosk')}
          />
          <div className={styles.methodIcon}>
            <MdStorefront size={24} />
          </div>
          <div className={styles.methodDetails}>
            <span className={styles.methodTitle}>Store Pickup</span>
            <span className={styles.methodDescription}>Pick up at nearest store</span>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {selectedMethod === 'customer' && (
          <motion.div 
            className={styles.customerAddress}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.addressGrid}>
              <div className={styles.formGroup}>
                <label>Street Address *</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Enter street address"
                />
              </div>
              
              <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                  <label>Province/City *</label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setSelectedDistrict('');
                      setSelectedWard('');
                    }}
                  >
                    <option value="">Select province/city</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>District *</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedWard('');
                    }}
                    disabled={!selectedProvince}
                  >
                    <option value="">Select district</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Ward *</label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  disabled={!selectedDistrict}
                >
                  <option value="">Select ward</option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {selectedMethod === 'kiosk' && (
          <motion.div 
            className={styles.kioskSelection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.formGroup}>
              <label>Select Store *</label>
              <select
                onChange={handleKioskSelect}
                disabled={isLoading}
                className={error ? styles.error : ''}
              >
                <option value="">Choose pickup store</option>
                {kiosks.map((kiosk) => (
                  <option key={kiosk.id} value={kiosk.id}>
                    {kiosk.name} - {kiosk.address}
                  </option>
                ))}
              </select>
              {error && (
                <span className={styles.errorMessage}>
                  <MdError size={16} />
                  {error}
                </span>
              )}
            </div>

            <AnimatePresence>
              {selectedKiosk && (
                <motion.div 
                  className={styles.kioskDetails}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className={styles.kioskHeader}>
                    <MdStorefront size={20} />
                    <h4>Store Information</h4>
                  </div>
                  <div className={styles.kioskInfo}>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Store Name:</span>
                      <span className={styles.value}>{selectedKiosk.name}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Address:</span>
                      <span className={styles.value}>{selectedKiosk.address}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Phone Number:</span>
                      <span className={styles.value}>{selectedKiosk.phoneNumber}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Opening Hours:</span>
                      <span className={styles.value}>{selectedKiosk.openingHours}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <span>Loading data...</span>
        </div>
      )}
    </div>
  );
};

export default StaffShippingInformation;