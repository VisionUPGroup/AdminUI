
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Check, AlertCircle } from 'lucide-react';
import { Lens, LensType, LensMode, PrescriptionData, Profile } from '../types/lens.types';
import LensSelectionWrapper from '../LensSelectionWrapper/LensSelectionWrapper';
import { useLensService } from '../../../../../Api/lensService';
import styles from '../styles/LensSelection.module.scss';

interface LensSelectionProps {
  selectedProduct: any;
  customer: any;
  onLensSelect: (lensData: {
    leftLens: Lens;
    rightLens: Lens;
    prescriptionData: PrescriptionData;
  }) => void;
  onBack: () => void;
  refractionRecordService: any;
  measurementResultService: any;
}

const LensSelection: React.FC<LensSelectionProps> = ({
  selectedProduct,
  customer,
  onLensSelect,
  onBack,
  refractionRecordService,
  measurementResultService
}) => {
  // Main state
  const [currentStep, setCurrentStep] = useState(1);
  const [lensMode, setLensMode] = useState<LensMode>('same');
  const [selectedLenses, setSelectedLenses] = useState<{
    leftLens: Lens | null;
    rightLens: Lens | null;
  }>({
    leftLens: null,
    rightLens: null
  });

  // Lens data state
  const [lensTypes, setLensTypes] = useState<LensType[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [availableLenses, setAvailableLenses] = useState<Lens[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fetchLenses, fetchLensTypes } = useLensService();

  // Initial data loading
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

  const loadLenses = async (typeId: number) => {
    try {
      setLoading(true);
      const response = await fetchLenses({
        LensTypeID: typeId
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

  // Step 1: Lens Mode Selection
  const renderLensModeSelection = () => (
    <div className={styles.lensModeSelection}>
      <h3>Select Lens Mode</h3>
      <div className={styles.modeOptions}>
        <button
          className={`${styles.modeButton} ${lensMode === 'same' ? styles.active : ''}`}
          onClick={() => setLensMode('same')}
        >
          <div className={styles.modeIcon}>
            <Eye size={24} />
            <Eye size={24} />
          </div>
          <div className={styles.modeInfo}>
            <h4>Same Lens</h4>
            <p>Use the same lens type for both eyes</p>
          </div>
          {lensMode === 'same' && <Check className={styles.checkIcon} />}
        </button>

        <button
          className={`${styles.modeButton} ${lensMode === 'custom' ? styles.active : ''}`}
          onClick={() => setLensMode('custom')}
        >
          <div className={styles.modeIcon}>
            <Eye size={24} className={styles.leftEye} />
            <Eye size={24} className={styles.rightEye} />
          </div>
          <div className={styles.modeInfo}>
            <h4>Custom Lens</h4>
            <p>Select different lenses for each eye</p>
          </div>
          {lensMode === 'custom' && <Check className={styles.checkIcon} />}
        </button>
      </div>
      
      <div className={styles.actions}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={20} />
          Back
        </button>
        <button 
          onClick={() => setCurrentStep(2)}
          className={styles.nextButton}
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Handle prescription data from wrapper
  const handlePrescriptionComplete = (data: any) => {
    const { prescriptionData, leftLens, rightLens } = data;
    
    if (!leftLens || !rightLens || !prescriptionData) {
      setError('Missing required lens or prescription data');
      return;
    }

    onLensSelect({
      leftLens,
      rightLens,
      prescriptionData
    });
  };

  return (
    <div className={styles.lensSelection}>
      <header className={styles.header}>
        <div className={styles.productPreview}>
          <img
            src={selectedProduct.eyeGlassImages[0]?.url}
            alt={selectedProduct.name}
            className={styles.productImage}
          />
          <div className={styles.productInfo}>
            <h2>{selectedProduct.name}</h2>
            <span className={styles.price}>
              {selectedProduct.price.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {currentStep === 1 && renderLensModeSelection()}

        {currentStep === 2 && (
          <LensSelectionWrapper
            accountId={customer.id}
            lensMode={lensMode}
            onComplete={handlePrescriptionComplete}
            onBack={() => setCurrentStep(1)}
            refractionRecordService={refractionRecordService}
            measurementResultService={measurementResultService}
          />
        )}

        {error && (
          <div className={styles.error} onClick={() => setError(null)}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LensSelection;



