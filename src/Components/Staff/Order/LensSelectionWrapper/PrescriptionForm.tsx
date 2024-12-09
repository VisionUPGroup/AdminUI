// components/LensSelection/ModernPrescriptionForm.tsx

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Eye, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  Info,
  CheckCircle ,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { MeasurementRecord, PrescriptionData } from '../types/lens.types';
import styles from './PrescriptionForm.module.scss';
import { LensMode } from '../types/lens.types';
import { Tooltip } from './Tooltip';

interface PrescriptionFormProps {
  initialData?: MeasurementRecord[];
  onComplete: (data: PrescriptionData) => void;
  onBack: () => void;
  lensMode: LensMode;
}

const ModernPrescriptionForm: React.FC<PrescriptionFormProps> = ({
  initialData = [],
  onComplete,
  onBack,
  lensMode 
}) => {
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData>({
    sphereOD: 0,
    cylinderOD: 0,
    axisOD: 0,
    sphereOS: 0,
    cylinderOS: 0,
    axisOS: 0,
    addOD: 0,
    addOS: 0,
    pd: 0
  });

  const [activeEye, setActiveEye] = useState<'OD' | 'OS'>('OD');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Field descriptions for tooltips
  const fieldDescriptions = {
    sphere: 'Measures the degree of nearsightedness or farsightedness',
    cylinder: 'Measures the degree of astigmatism',
    axis: 'Indicates the orientation of astigmatism',
    add: 'Additional magnifying power for reading (bifocal/progressive)',
    pd: 'Distance between the centers of your pupils'
  };

  useEffect(() => {
    if (initialData.length > 0) {
      const rightEye = initialData.find(m => m.eyeSide === 1);
      const leftEye = initialData.find(m => m.eyeSide === 0);

      setPrescriptionData({
        sphereOD: rightEye?.spherical || 0,
        cylinderOD: rightEye?.cylindrical || 0,
        axisOD: rightEye?.axis || 0,
        sphereOS: leftEye?.spherical || 0,
        cylinderOS: leftEye?.cylindrical || 0,
        axisOS: leftEye?.axis || 0,
        addOD: 0,
        addOS: 0,
        pd: rightEye?.pupilDistance || leftEye?.pupilDistance || 0
      });
    }
  }, [initialData]);

  const validateField = (name: string, value: number): string => {
    const validationRules = {
      sphere: { min: -12, max: 12, step: 0.25 },
      cylinder: { min: -12, max: 12, step: 0.25 },
      axis: { min: 0, max: 180, step: 1 },
      add: { min: 0, max: 4, step: 0.25 },
      pd: { min: 50, max: 80, step: 0.5 }
    };

    const fieldType = name.replace(/[OS|OD]$/, '').toLowerCase();
    const rule = validationRules[fieldType as keyof typeof validationRules];

    if (!rule) return '';

    if (value < rule.min || value > rule.max) {
      return `Value must be between ${rule.min} and ${rule.max}`;
    }

    if (value % rule.step !== 0) {
      return `Value must be in increments of ${rule.step}`;
    }

    return '';
  };

  const handleInputChange = (field: keyof PrescriptionData, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    setPrescriptionData(prev => ({
      ...prev,
      [field]: numValue
    }));
  
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  

  const handleSubmit = async () => {
    // Validate tất cả các trường khi submit
    const newErrors: Record<string, string> = {};
    let hasValidationErrors = false;
  
    Object.entries(prescriptionData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        hasValidationErrors = true;
      }
    });
  
    if (hasValidationErrors) {
      setErrors(newErrors);
      // Show thông báo lỗi nếu cần
      toast.error('Please check your prescription values');
      return;
    }
  
    // Nếu không có lỗi, tiếp tục submit
    setShowSuccess(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onComplete(prescriptionData);
  };
  

  const handleReset = () => {
    setPrescriptionData({
      sphereOD: 0,
      cylinderOD: 0,
      axisOD: 0,
      sphereOS: 0,
      cylinderOS: 0,
      axisOS: 0,
      addOD: 0,
      addOS: 0,
      pd: 0
    });
    setErrors({});
  };


  const renderEyeSelector = () => (
    <div className={styles.eyeSelector}>
      {['OD', 'OS'].map((eye) => (
        <motion.button
          key={eye}
          className={`${styles.eyeButton} ${activeEye === eye ? styles.active : ''}`}
          onClick={() => setActiveEye(eye as 'OD' | 'OS')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={styles.eyeContent}>
            <Eye size={24} />
            <div className={styles.eyeInfo}>
              <span>{eye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</span>
              <small>{eye === 'OD' ? 'Oculus Dexter' : 'Oculus Sinister'}</small>
            </div>
          </div>
          {activeEye === eye && (
            <motion.div 
              className={styles.activeIndicator}
              layoutId="activeEye"
            />
          )}
        </motion.button>
      ))}
    </div>
  );

  const renderInputField = (label: string, field: keyof PrescriptionData, description: string) => (
    <div className={styles.inputGroup}>
      <div className={styles.labelGroup}>
        <label>{label}</label>
        <Tooltip content={description} position="top">
          <Info size={16} className={styles.info} />
        </Tooltip>
      </div>
      <div className={styles.inputWrapper}>
        <input
          type="number"
          step={field.includes('axis') ? '1' : '0.25'}
          value={prescriptionData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={errors[field] ? styles.error : ''}
        />
        <span className={styles.unit}>
          {field.includes('axis') ? '°' : 
           field === 'pd' ? 'mm' : 
           'D'}
        </span>
      </div>
      <AnimatePresence>
        {errors[field] && (
          <motion.span
            className={styles.errorText}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {errors[field]}
          </motion.span>
        )}
      </AnimatePresence>
      <span className={styles.range}>
        {field.includes('axis') ? '0° to 180°' : 
         field.includes('add') ? '0.00 to +4.00' :
         field === 'pd' ? '50mm to 80mm' : 
         '-12.00 to +12.00'}
      </span>
    </div>
  );

  return (
    <div className={styles.prescriptionForm}>
      <nav className={styles.breadcrumb}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <ChevronRight size={16} className={styles.separator} />
        <span>Prescription Details</span>
      </nav>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Prescription Details</h1>
          <p>Enter or verify prescription values for both eyes</p>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ width: '50%' }}>
            <span>2 of 4</span>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {renderEyeSelector()}

        <div className={styles.prescriptionDetails}>
          <AnimatePresence mode="wait">
            <motion.div 
              className={styles.formGrid}
              key={activeEye}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.column}>
                <h3>Sphere & Cylinder</h3>
                {renderInputField('Sphere (SPH)', `sphere${activeEye}`, fieldDescriptions.sphere)}
                {renderInputField('Cylinder (CYL)', `cylinder${activeEye}`, fieldDescriptions.cylinder)}
              </div>
              
              <div className={styles.column}>
                <h3>Axis & Add Power</h3>
                {renderInputField('Axis', `axis${activeEye}`, fieldDescriptions.axis)}
                {renderInputField('Add Power', `add${activeEye}`, fieldDescriptions.add)}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={styles.pdSection}>
            <h3>Pupillary Distance</h3>
            {renderInputField('PD', 'pd', fieldDescriptions.pd)}
          </div>
        </div>

        <footer className={styles.footer}>
          <button 
            className={styles.resetButton}
            onClick={handleReset}
          >
            <RefreshCw size={18} />
            <span>Reset</span>
          </button>

          <button 
            className={styles.submitButton}
            onClick={handleSubmit}
          >
            {showSuccess ? <CheckCircle size={18} /> : <Save size={18} />}
            <span>{showSuccess ? 'Saving...' : 'Save Prescription'}</span>
          </button>
        </footer>
      </main>
    </div>
  );
};

export default ModernPrescriptionForm;