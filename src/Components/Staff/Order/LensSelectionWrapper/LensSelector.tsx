import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Info, Star, Check } from 'lucide-react';
import { useLensService } from '../../../../../Api/lensService';
import { Lens, LensType, LensMode, PrescriptionData } from '../types/lens.types';
import styles from './LensSelector.module.scss';

interface LensSelectorProps {
  lensMode: LensMode;
  prescriptionData: PrescriptionData;
  onSelect: (lens: Lens, eye?: 'left' | 'right') => void;
  onComplete: () => void;
  onBack: () => void;
  selectedLenses: {
    left: Lens | null;
    right: Lens | null;
  };
}

const LensSelector: React.FC<LensSelectorProps> = ({
  lensMode,
  prescriptionData,
  onSelect,
  onComplete,
  onBack,
  selectedLenses
}) => {
  // State
  const [lensTypes, setLensTypes] = useState<LensType[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [availableLenses, setAvailableLenses] = useState<Lens[]>([]);
  const [activeEye, setActiveEye] = useState<'left' | 'right'>(lensMode === 'custom' ? 'right' : 'right');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fetchLenses, fetchLensTypes } = useLensService();

  // Load lens types
  useEffect(() => {
    loadLensTypes();
  }, []);

  const loadLensTypes = async () => {
    try {
      setLoading(true);
      const response = await fetchLensTypes();
      if (response) {
        const activeTypes = response.filter((type: LensType) => type.status);
        setLensTypes(activeTypes);
      }
    } catch (err) {
      setError('Failed to load lens types');
    } finally {
      setLoading(false);
    }
  };

  // Load lenses when type is selected
  useEffect(() => {
    if (selectedType) {
      loadLenses();
    }
  }, [selectedType]);

  const loadLenses = async () => {
    if (!selectedType) return;

    try {
      setLoading(true);
      const response = await fetchLenses({
        LensTypeID: selectedType
      });
      if (response?.data) {
        setAvailableLenses(response.data.filter((lens: Lens) => lens.status));
      }
    } catch (err) {
      setError('Failed to load lenses');
    } finally {
      setLoading(false);
    }
  };

  // Check if can proceed to completion
  const canComplete = lensMode === 'same' 
    ? selectedLenses.left && selectedLenses.right
    : selectedLenses.left && selectedLenses.right;

  // Determine which lens is selected for current eye
  const getCurrentLens = () => {
    return activeEye === 'left' ? selectedLenses.left : selectedLenses.right;
  };

  return (
    <div className={styles.lensSelector}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Prescription</span>
        </button>
        <h2>Select Lens Type</h2>
      </header>

      {lensMode === 'custom' && (
        <div className={styles.eyeSelector}>
          <button
            className={`${styles.eyeButton} ${activeEye === 'right' ? styles.active : ''}`}
            onClick={() => setActiveEye('right')}
          >
            <Eye size={24} />
            <span>Right Eye (OD)</span>
            {selectedLenses.right && <Check className={styles.checkIcon} />}
          </button>
          <button
            className={`${styles.eyeButton} ${activeEye === 'left' ? styles.active : ''}`}
            onClick={() => setActiveEye('left')}
          >
            <Eye size={24} />
            <span>Left Eye (OS)</span>
            {selectedLenses.left && <Check className={styles.checkIcon} />}
          </button>
        </div>
      )}

      <div className={styles.typeSelection}>
        <div className={styles.typeGrid}>
          {lensTypes.map(type => (
            <button
              key={type.id}
              className={`${styles.typeCard} ${selectedType === type.id ? styles.active : ''}`}
              onClick={() => setSelectedType(type.id)}
            >
              <h3>{type.description.split('.')[0]}</h3>
              <p>{type.description.split('.')[1]}</p>
              {selectedType === type.id && <Check className={styles.checkIcon} />}
            </button>
          ))}
        </div>
      </div>

      {selectedType && (
        <div className={styles.lensGrid}>
          {loading ? (
            <div className={styles.loading}>Loading lenses...</div>
          ) : (
            availableLenses.map(lens => (
              <div
                key={lens.id}
                className={`${styles.lensCard} ${getCurrentLens()?.id === lens.id ? styles.selected : ''}`}
                onClick={() => onSelect(lens, activeEye)}
              >
                <div className={styles.lensImage}>
                  <img src={lens.lensImages[0]?.url} alt={lens.lensName} />
                </div>
                <div className={styles.content}>
                  <h3>{lens.lensName}</h3>
                  <p>{lens.lensDescription}</p>
                  <div className={styles.price}>
                    {lens.lensPrice.toLocaleString('vi-VN')}₫
                  </div>
                  <div className={styles.rating}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < lens.rate ? '#F39C12' : 'none'}
                        stroke={i < lens.rate ? '#F39C12' : '#ccc'}
                      />
                    ))}
                    <span>({lens.rateCount})</span>
                  </div>
                </div>
                {getCurrentLens()?.id === lens.id && (
                  <div className={styles.selectedOverlay}>
                    <Check size={24} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          <Info size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.actions}>
        <button 
          className={styles.completeButton}
          disabled={!canComplete}
          onClick={onComplete}
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
}

export default LensSelector;