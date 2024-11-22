import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Star, Filter, Glasses, Book, Sun } from 'lucide-react';
import { useLensService } from '../../../../../Api/lensService';
import { EyeGlass } from '../types/product';
import { Lens, LensType, EyeReflactive } from '../types/lens';
import styles from '../styles/LensSelection.module.scss';

interface LensSelectionProps {
  selectedProduct: EyeGlass;
  onLensSelect: (lens: Lens, prescription: PrescriptionData) => void;
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

const typeIcons: { [key: number]: React.ElementType } = {
  1: Glasses, // Single Vision
  2: Book,    // Bifocal
  3: Book,    // Reading
  4: Sun      // Non-Prescription
};

const LensSelection: React.FC<LensSelectionProps> = ({
  selectedProduct,
  onLensSelect,
  onBack
}) => {
  const [lensTypes, setLensTypes] = useState<LensType[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [lenses, setLenses] = useState<Lens[]>([]);
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    reflactive: '',
    minPrice: '',
    maxPrice: ''
  });

  const [prescription, setPrescription] = useState<PrescriptionData>({
    sphereOD: 0,
    cylinderOD: 0,
    axisOD: 0,
    sphereOS: 0,
    cylinderOS: 0,
    axisOS: 0,
    pd: 0
  });

  const { fetchLenses, fetchLensTypes, fetchEyeReflactives } = useLensService();
  const [reflactiveOptions, setReflactiveOptions] = useState<EyeReflactive[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingInitial(true);
    setError(null);
    try {
      const [typesResponse, reflactivesResponse] = await Promise.all([
        fetchLensTypes(),
        fetchEyeReflactives()
      ]);
      if (typesResponse) { 
        const activeTypes = typesResponse.filter(
          (type: LensType) => type.status
        );
        setLensTypes(activeTypes);
      }

      if (reflactivesResponse) { // Bỏ .data thứ hai
        setReflactiveOptions(reflactivesResponse.filter(
          (option: EyeReflactive) => option.status
        ));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load lens types and options. Please try again.');
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    if (selectedType) {
      loadLenses();
    }
  }, [selectedType, filters.reflactive, filters.minPrice, filters.maxPrice]);

  const loadLenses = async () => {
    if (!selectedType) return;
    
    setLoading(true);
    setError(null);
    try {
      const params = {
        LensTypeID: Number(selectedType),
        EyeReflactiveID: filters.reflactive ? Number(filters.reflactive) : undefined,
        MinPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        MaxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined
      };

      const response = await fetchLenses(params);
      
      if (response?.data) { 
        setLenses(response.data.filter((lens: Lens) => lens.status));
      } else {
        setLenses([]);
      }
    } catch (error) {
      console.error('Error loading lenses:', error);
      setError('Failed to load lenses. Please try again.');
      setLenses([]);
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

  const LensTypeCard = ({ type }: { type: LensType }) => {
    const Icon = typeIcons[type.id as keyof typeof typeIcons] || Glasses;
    return (
      <button
        className={styles.typeCard}
        onClick={() => setSelectedType(type.id)}
      >
        <div className={styles.iconWrapper}>
          <Icon size={32} />
        </div>
        <div className={styles.typeContent}>
          <h3>{type.description.split('.')[0]}</h3>
          <p>{type.description.split('.')[1]}</p>
        </div>
      </button>
    );
  };

  const LensCard = ({ lens }: { lens: Lens }) => (
    <div
      className={`${styles.lensCard} ${selectedLens?.id === lens.id ? styles.selected : ''}`}
      onClick={() => setSelectedLens(lens)}
    >
      <div className={styles.imageSection}>
        <img src={lens.lensImages[0]?.url} alt={lens.lensName} />
        {lens.quantity <= 0 && (
          <div className={styles.outOfStock}>Out of Stock</div>
        )}
      </div>

      <div className={styles.content}>
        <h3>{lens.lensName}</h3>
        <p>{lens.lensDescription}</p>

        <div className={styles.features}>
          <span className={styles.feature}>
            {lens.eyeReflactive.reflactiveName}
          </span>
          <span className={styles.feature}>
            {lens.quantity > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <div className={styles.footer}>
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

      {selectedLens?.id === lens.id && (
        <div className={styles.selectedCheck}>
          <Check size={24} />
        </div>
      )}
    </div>
  );

  const PrescriptionForm = () => (
    <div className={styles.prescriptionForm}>
      <h3>Prescription Details</h3>

      <div className={styles.eyeSection}>
        <div className={styles.eye}>
          <h4>Right Eye (OD)</h4>
          <div className={styles.inputs}>
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
        className={styles.continueButton}
        onClick={() => selectedLens && onLensSelect(selectedLens, prescription)}
        disabled={!selectedLens}
      >
        Continue to Next Step
      </button>
    </div>
  );

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

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          {error}
          <button className={styles.retryButton} onClick={loadInitialData}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.mainContent}>
        <section className={styles.leftSection}>
          {loadingInitial ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <span>Loading lens options...</span>
            </div>
          ) : !selectedType ? (
            <div className={styles.typeSelection}>
              <h2>Select Lens Type</h2>
              <div className={styles.typeGrid}>
                {lensTypes.map(type => (
                  <LensTypeCard key={type.id} type={type} />
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
                    setFilters({
                      reflactive: '',
                      minPrice: '',
                      maxPrice: ''
                    });
                  }}
                >
                  <ArrowLeft size={16} />
                  Back to Lens Types
                </button>
                <h2>{lensTypes.find(t => t.id === selectedType)?.description.split('.')[0]}</h2>
              </div>

              <div className={styles.filters}>
                <select
                  value={filters.reflactive}
                  onChange={(e) => setFilters(prev => ({ ...prev, reflactive: e.target.value }))}
                >
                  <option value="">All Reflactive Types</option>
                  {reflactiveOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.reflactiveName}
                    </option>
                  ))}
                </select>

                <div className={styles.priceRange}>
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.lensGrid}>
                {loading ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Loading lenses...</span>
                  </div>
                ) : lenses.length === 0 ? (
                  <div className={styles.noResults}>
                    <p>No lenses found matching your criteria</p>
                  </div>
                ) : (
                  lenses.map(lens => (
                    <LensCard key={lens.id} lens={lens} />
                  ))
                )}
              </div>
            </>
          )}
        </section>

        <section className={styles.rightSection}>
          {!selectedLens ? (
            <div className={styles.emptyState}>
              <div className={styles.illustration}>🔍</div>
              <h3>Select a Lens</h3>
              <p>Choose a lens from the left to view and customize prescription details</p>
            </div>
          ) : selectedLens.lensTypeID === 4 ? (
            <div className={styles.nonPrescriptionDetails}>
              <h3>Non-Prescription Lens Selected</h3>
              <div className={styles.selectedLensInfo}>
                <img src={selectedLens.lensImages[0]?.url} alt={selectedLens.lensName} />
                <h4>{selectedLens.lensName}</h4>
                <p>{selectedLens.lensDescription}</p>
                <div className={styles.price}>
                  {selectedLens.lensPrice.toLocaleString('vi-VN')}₫
                </div>
              </div>
              <button
                className={styles.continueButton}
                onClick={() => onLensSelect(selectedLens, {})}
              >
                Continue with Non-Prescription Lens
              </button>
            </div>
          ) : (
            <PrescriptionForm />
          )}
        </section>
      </div>
    </div>
  );
};

export default LensSelection;