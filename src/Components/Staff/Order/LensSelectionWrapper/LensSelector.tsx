import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Info, Star, Check, AlertCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [lensTypes, setLensTypes] = useState<LensType[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [availableLenses, setAvailableLenses] = useState<Lens[]>([]);
  const [activeEye, setActiveEye] = useState<'left' | 'right'>('right');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLensDetails, setSelectedLensDetails] = useState<Lens | null>(null);

  const { fetchLenses, fetchLensTypes } = useLensService();

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


  const handleLensClick = (lens: Lens) => {
    setSelectedLensDetails(lens);
  };

  const handleLensSelect = (lens: Lens) => {
    onSelect(lens, activeEye);
    setSelectedLensDetails(null);
  };

  const canComplete = lensMode === 'same' 
    ? selectedLenses.left && selectedLenses.right
    : selectedLenses.left && selectedLenses.right;

  // Determine which lens is selected for current eye
  const getCurrentLens = () => {
    return activeEye === 'left' ? selectedLenses.left : selectedLenses.right;
  };

  

  return (
    <motion.div 
      className={styles.lensSelector}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className={styles.headerContent}>
          <h2>Select Your Lenses</h2>
          <p>Choose the perfect lenses for your vision needs</p>
        </div>
      </div>

      {lensMode === 'custom' && (
        <div className={styles.eyeSelector}>
          <motion.button
            className={`${styles.eyeButton} ${activeEye === 'right' ? styles.active : ''}`}
            onClick={() => setActiveEye('right')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={styles.eyeContent}>
              <Eye size={24} />
              <div className={styles.eyeInfo}>
                <span className={styles.eyeTitle}>Right Eye (OD)</span>
                <span className={styles.eyeSubtitle}>
                  {selectedLenses.right ? 'Lens Selected' : 'Select Lens'}
                </span>
              </div>
            </div>
            {selectedLenses.right && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={styles.checkIcon}
              >
                <Check size={20} />
              </motion.div>
            )}
          </motion.button>

          <motion.button
            className={`${styles.eyeButton} ${activeEye === 'left' ? styles.active : ''}`}
            onClick={() => setActiveEye('left')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={styles.eyeContent}>
              <Eye size={24} />
              <div className={styles.eyeInfo}>
                <span className={styles.eyeTitle}>Left Eye (OS)</span>
                <span className={styles.eyeSubtitle}>
                  {selectedLenses.left ? 'Lens Selected' : 'Select Lens'}
                </span>
              </div>
            </div>
            {selectedLenses.left && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={styles.checkIcon}
              >
                <Check size={20} />
              </motion.div>
            )}
          </motion.button>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.typeSelection}>
          <h3 className={styles.sectionTitle}>Lens Types</h3>
          <div className={styles.typeGrid}>
            {lensTypes.map(type => (
              <motion.button
                key={type.id}
                className={`${styles.typeCard} ${selectedType === type.id ? styles.active : ''}`}
                onClick={() => setSelectedType(type.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={styles.typeContent}>
                  <h4>{type.description.split('.')[0]}</h4>
                  <p>{type.description.split('.')[1]}</p>
                </div>
                {selectedType === type.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={styles.selectedIndicator}
                  >
                    <Check size={20} />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {selectedType && (
          <motion.div 
            className={styles.lensOptions}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className={styles.sectionTitle}>Available Lenses</h3>
            <div className={styles.lensGrid}>
              {loading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <span>Loading available lenses...</span>
                </div>
              ) : (
                availableLenses.map(lens => (
                  <motion.div
                    key={lens.id}
                    className={`${styles.lensCard} ${
                      getCurrentLens()?.id === lens.id ? styles.selected : ''
                    }`}
                    onClick={() => handleLensClick(lens)}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={styles.lensImage}>
                      <img src={lens.lensImages[0]?.url} alt={lens.lensName} />
                      {getCurrentLens()?.id === lens.id && (
                        <motion.div 
                          className={styles.selectedOverlay}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Check size={24} />
                        </motion.div>
                      )}
                    </div>
                    <div className={styles.lensInfo}>
                      <h4>{lens.lensName}</h4>
                      <p>{lens.lensDescription}</p>
                      <div className={styles.lensDetails}>
                        <div className={styles.price}>
                          {lens.lensPrice.toLocaleString('vi-VN')}₫
                        </div>
                        <div className={styles.rating}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              fill={i < lens.rate ? '#F59E0B' : 'none'}
                              stroke={i < lens.rate ? '#F59E0B' : '#D1D5DB'}
                            />
                          ))}
                          <span>({lens.rateCount})</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>

      {error && (
        <motion.div 
          className={styles.error}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>Dismiss</button>
        </motion.div>
      )}

      <div className={styles.footer}>
        <div className={styles.selectionSummary}>
          <p>
            {canComplete 
              ? 'All lenses selected' 
              : `Select ${lensMode === 'same' ? 'a lens' : 'lenses for both eyes'}`}
          </p>
        </div>
        <button 
          className={styles.completeButton}
          disabled={!canComplete}
          onClick={onComplete}
        >
          Continue
          <ChevronRight size={20} />
        </button>
      </div>

      <AnimatePresence>
        {selectedLensDetails && (
          <motion.div 
            className={styles.lensDetailsModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.modalContent}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              {/* Lens details content */}
              <button 
                className={styles.selectButton}
                onClick={() => handleLensSelect(selectedLensDetails)}
              >
                Select This Lens
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LensSelector;