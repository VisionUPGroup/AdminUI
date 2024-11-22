import React, { useState, useEffect } from 'react';
import { useLensService } from '../../../../../Api/lensService';
import PrescriptionForm from './PrescriptionForm';
import styles from '../styles/LensSelection.module.scss';
import { Lens } from '../types/lens';
import { EyeGlass } from '../types/product';

interface LensOptionsProps {
  selectedProduct: EyeGlass;
  onLensSelect: (lens: Lens, prescription: any) => void;
  onBack: () => void;
}

const LensOptions: React.FC<LensOptionsProps> = ({ 
  selectedProduct, 
  onLensSelect,
  onBack 
}) => {
  const [lenses, setLenses] = useState<Lens[]>([]);
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { fetchLenses } = useLensService();

  useEffect(() => {
    if (selectedProduct?.eyeGlassTypeID) {
      loadLenses();
    }
  }, [selectedProduct]);

  const loadLenses = async () => {
    try {
      setLoading(true);
      console.log('Fetching lenses for type:', selectedProduct.eyeGlassTypeID);
      const response = await fetchLenses({
        // lensTypeId: selectedProduct.eyeGlassTypeID
      });
      
      if (response.data) {
        console.log('Fetched lenses:', response.data);
        setLenses(response.data);
      } else {
        console.error('No lens data received');
      }
    } catch (error) {
      console.error('Error loading lenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLensSelect = (lens: Lens) => {
    setSelectedLens(lens);
  };

  const handlePrescriptionSubmit = (data: any) => {
    setPrescriptionData(data);
    if (selectedLens) {
      onLensSelect(selectedLens, data);
    }
  };

  return (
    <div className={styles.lensSelection}>
      <button className={styles.backButton} onClick={onBack}>
        ← Back to Products
      </button>

      <div className={styles.content}>
        <div className={styles.lensOptions}>
          <h2>Select Lens Type</h2>
          {loading ? (
            <div className={styles.loading}>Loading lenses...</div>
          ) : (
            <div className={styles.lensGrid}>
              {lenses.map((lens: Lens) => (
                <div 
                  key={lens.id}
                  className={`${styles.lensCard} ${selectedLens?.id === lens.id ? styles.selected : ''}`}
                  onClick={() => handleLensSelect(lens)}
                >
                  <div className={styles.lensInfo}>
                    <h3>{lens.lensName}</h3>
                    <p>{lens.lensDescription}</p>
                    <div className={styles.features}>
                      <span>{lens.eyeReflactive.reflactiveName}</span>
                      <span>{lens.lensType.description}</span>
                    </div>
                  </div>
                  <div className={styles.price}>
                    {lens.lensPrice.toLocaleString('vi-VN')} VND
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedLens && (
          <PrescriptionForm
            lensType={selectedLens.lensType}
            onSubmit={handlePrescriptionSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default LensOptions;