// LensSelection.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Check, AlertCircle, ChevronRight, Info } from 'lucide-react';
import { Lens, LensType, LensMode, PrescriptionData } from '../types/lens.types';
import LensSelectionWrapper from '../LensSelectionWrapper/LensSelectionWrapper';
import { useLensService } from '../../../../../Api/lensService';
import { motion, AnimatePresence } from 'framer-motion';
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
  // States
  const [currentStep, setCurrentStep] = useState(1);
  const [lensMode, setLensMode] = useState<LensMode>('same');
  const [selectedLenses, setSelectedLenses] = useState<{
    leftLens: Lens | null;
    rightLens: Lens | null;
  }>({
    leftLens: null,
    rightLens: null
  });
  const [showTooltip, setShowTooltip] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const stepsData = [
    { number: 1, title: 'Select Lens Mode' },
    { number: 2, title: 'Customize Lens' },
    { number: 3, title: 'Review & Confirm' }
  ];

  // Render progress steps
  const renderProgressSteps = () => (
    <div className={styles.progressSteps}>
      {stepsData.map((step, index) => (
        <div 
          key={step.number} 
          className={`${styles.step} ${currentStep >= step.number ? styles.active : ''}`}
        >
          <div className={styles.stepNumber}>
            {currentStep > step.number ? <Check size={16} /> : step.number}
          </div>
          <span className={styles.stepTitle}>{step.title}</span>
          {index < stepsData.length - 1 && <div className={styles.connector} />}
        </div>
      ))}
    </div>
  );

  // Render lens mode selection
  const renderLensModeSelection = () => (
    <motion.div 
      className={styles.lensModeSelection}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.modeOptions}>
        <motion.button
          className={`${styles.modeCard} ${lensMode === 'same' ? styles.active : ''}`}
          onClick={() => setLensMode('same')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={styles.modeIcon}>
            <Eye size={28} />
            <Eye size={28} />
          </div>
          <div className={styles.modeContent}>
            <h4>Same Lens</h4>
            <p>Identical lenses for both eyes</p>
            <div className={styles.features}>
              <span>Recommended</span>
              <span>Cost-effective</span>
            </div>
          </div>
          {lensMode === 'same' && (
            <motion.div 
              className={styles.selectedIndicator}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Check size={20} />
            </motion.div>
          )}
        </motion.button>

        <motion.button
          className={`${styles.modeCard} ${lensMode === 'custom' ? styles.active : ''}`}
          onClick={() => setLensMode('custom')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => setShowTooltip('custom')}
          onMouseLeave={() => setShowTooltip('')}
        >
          <div className={styles.modeIcon}>
            <Eye size={28} className={styles.leftEye} />
            <Eye size={28} className={styles.rightEye} />
          </div>
          <div className={styles.modeContent}>
            <h4>Custom Lens</h4>
            <p>Different lenses for each eye</p>
            <div className={styles.features}>
              <span>Advanced</span>
              <span>Personalized</span>
            </div>
          </div>
          {lensMode === 'custom' && (
            <motion.div 
              className={styles.selectedIndicator}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Check size={20} />
            </motion.div>
          )}
        </motion.button>
      </div>

      <div className={styles.actions}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <button 
          onClick={() => setCurrentStep(2)}
          className={styles.nextButton}
          disabled={!lensMode}
        >
          <span>Continue</span>
          <ChevronRight size={20} />
        </button>
      </div>

      {showTooltip === 'custom' && (
        <div className={styles.tooltip}>
          <Info size={16} />
          <p>Choose different lens specifications for each eye based on your prescription</p>
        </div>
      )}
    </motion.div>
  );

  // Handle prescription data
  const handlePrescriptionComplete = (data: any) => {
    const { prescriptionData, leftLens, rightLens } = data;
    
    console.log("data", data )
    if(!leftLens.lensType.isNoPrescription || !rightLens.lensType.isNoPrescription){
      if (!leftLens || !rightLens || !prescriptionData) {
        setError('Missing required lens or prescription data');
        return;
      }
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
          <motion.div 
            className={styles.imageWrapper}
            whileHover={{ scale: 1.05, rotate: -2 }}
          >
            <img
              src={selectedProduct.eyeGlassImages[0]?.url}
              alt={selectedProduct.name}
              className={styles.productImage}
            />
          </motion.div>
          <div className={styles.productInfo}>
            <h2>{selectedProduct.name}</h2>
            <div className={styles.priceTag}>
              <span className={styles.price}>
                {selectedProduct.price.toLocaleString('vi-VN')}₫
              </span>
              <span className={styles.label}>Selected Frame</span>
            </div>
          </div>
        </div>
        {renderProgressSteps()}
      </header>

      <main className={styles.content}>
        <AnimatePresence mode="wait">
          {currentStep === 1 && renderLensModeSelection()}

          {currentStep === 2 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <LensSelectionWrapper
                accountId={customer.id}
                lensMode={lensMode}
                onComplete={handlePrescriptionComplete}
                onBack={() => setCurrentStep(1)}
                refractionRecordService={refractionRecordService}
                measurementResultService={measurementResultService}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            className={styles.error}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => setError(null)}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default LensSelection;