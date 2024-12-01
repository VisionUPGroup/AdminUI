import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Star, Filter } from 'lucide-react';
import { useLensService } from '../../../../../Api/lensService';
import { EyeGlass } from '../types/product';
import { Lens, LensType } from '../types/lens';
import styles from '../styles/LensSelection.module.scss';

interface LensSelectionProps {
  selectedProduct: EyeGlass;
  onLensSelect: (lensData: {
    leftLens: Lens;
    rightLens: Lens;
    prescriptionData: PrescriptionData;
  }) => void;
  onBack: () => void;
}

interface PrescriptionData {
  sphereOD?: number;
  cylinderOD?: number;
  axisOD?: number;
  sphereOS?: number;
  cylinderOS?: number;
  axisOS?: number;
  pd?: number;
}

const LensSelection: React.FC<LensSelectionProps> = ({
  selectedProduct,
  onLensSelect,
  onBack
}) => {
  // State management
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
  const [lensTypes, setLensTypes] = useState<LensType[]>([]);
  const [lenses, setLenses] = useState<Lens[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prescription, setPrescription] = useState<PrescriptionData>({
    sphereOD: 0,
    cylinderOD: 0,
    axisOD: 0,
    sphereOS: 0,
    cylinderOS: 0,
    axisOS: 0,
    pd: 0
  });

  const { fetchLenses, fetchLensTypes } = useLensService();

  // Load initial data
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
    } catch (error) {
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
        setLenses(response.data.filter((lens: Lens) => lens.status));
      }
    } catch (error) {
      setError('Failed to load lenses');
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionChange = (field: keyof PrescriptionData, value: string) => {
    setPrescription(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleConfirm = () => {
    if (!selectedLens) return;

    onLensSelect({
      leftLens: selectedLens,
      rightLens: selectedLens,
      prescriptionData: prescription
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Back to Products</span>
        </button>

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

      <div className={styles.mainContent}>
        <section className={styles.leftSection}>
          {!selectedType ? (
            <div className={styles.typeSelection}>
              <h2>Select Lens Type</h2>
              <div className={styles.typeGrid}>
                {lensTypes.map(type => (
                  <button
                    key={type.id}
                    className={styles.typeCard}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <h3>{type.description.split('.')[0]}</h3>
                    <p>{type.description.split('.')[1]}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.typeHeader}>
                <button
                  className={styles.backToTypes}
                  onClick={() => {
                    setSelectedType(null);
                    setSelectedLens(null);
                  }}
                >
                  <ArrowLeft size={16} />
                  Back to Lens Types
                </button>
              </div>

              <div className={styles.lensGrid}>
                {loading ? (
                  <div className={styles.loading}>Loading lenses...</div>
                ) : (
                  lenses.map(lens => (
                    <div
                      key={lens.id}
                      className={`${styles.lensCard} ${selectedLens?.id === lens.id ? styles.selected : ''}`}
                      onClick={() => setSelectedLens(lens)}
                    >
                      <img src={lens.lensImages[0]?.url} alt={lens.lensName} />
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
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>

        <section className={styles.rightSection}>
          {selectedLens ? (
            <div className={styles.prescriptionForm}>
              <h3>Prescription Details</h3>
              
              <div className={styles.eyeSection}>
                <div className={styles.eye}>
                  <h4>Right Eye (OD)</h4>
                  <div className={styles.inputs}>
                    {/* Prescription inputs for right eye */}
                    <div className={styles.field}>
                      <label>Sphere</label>
                      <input
                        type="number"
                        step="0.25"
                        value={prescription.sphereOD}
                        onChange={(e) => handlePrescriptionChange('sphereOD', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Cylinder</label>
                      <input
                        type="number"
                        step="0.25"
                        value={prescription.cylinderOD}
                        onChange={(e) => handlePrescriptionChange('cylinderOD', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Axis</label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={prescription.axisOD}
                        onChange={(e) => handlePrescriptionChange('axisOD', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.eye}>
                  <h4>Left Eye (OS)</h4>
                  <div className={styles.inputs}>
                    {/* Prescription inputs for left eye */}
                    <div className={styles.field}>
                      <label>Sphere</label>
                      <input
                        type="number"
                        step="0.25"
                        value={prescription.sphereOS}
                        onChange={(e) => handlePrescriptionChange('sphereOS', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Cylinder</label>
                      <input
                        type="number"
                        step="0.25"
                        value={prescription.cylinderOS}
                        onChange={(e) => handlePrescriptionChange('cylinderOS', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Axis</label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={prescription.axisOS}
                        onChange={(e) => handlePrescriptionChange('axisOS', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.pdField}>
                  <label>Pupillary Distance (PD)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={prescription.pd}
                    onChange={(e) => handlePrescriptionChange('pd', e.target.value)}
                  />
                  <span className={styles.unit}>mm</span>
                </div>
              </div>

              <button
                className={styles.addToCartButton}
                onClick={handleConfirm}
              >
                Add to Cart
              </button>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.illustration}>🔍</div>
              <h3>Select a Lens</h3>
              <p>Choose a lens from the left to configure prescription details</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LensSelection;