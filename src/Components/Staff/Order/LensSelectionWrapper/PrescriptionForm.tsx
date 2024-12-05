// components/LensSelection/PrescriptionForm.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, AlertCircle, Save, RefreshCw } from 'lucide-react';
import { MeasurementRecord, PrescriptionData } from '../types/lens.types';
import styles from './PrescriptionForm.module.scss';
import { LensMode } from '../types/lens.types';

interface PrescriptionFormProps {
  initialData?: MeasurementRecord[];
  onComplete: (data: PrescriptionData) => void;
  onBack: () => void;
  lensMode: LensMode;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
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
    const error = validateField(field, numValue);

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    setPrescriptionData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    Object.entries(prescriptionData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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

  return (
    <div className={styles.prescriptionForm}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Measurement History</span>
        </button>
        <h2>Prescription Details</h2>
        <p>Enter or verify prescription values for both eyes</p>
      </div>

      <div className={styles.content}>
        <div className={styles.eyeSelector}>
          <button
            className={`${styles.eyeButton} ${activeEye === 'OD' ? styles.active : ''}`}
            onClick={() => setActiveEye('OD')}
          >
            <Eye size={24} />
            <span>Right Eye (OD)</span>
          </button>
          <button
            className={`${styles.eyeButton} ${activeEye === 'OS' ? styles.active : ''}`}
            onClick={() => setActiveEye('OS')}
          >
            <Eye size={24} />
            <span>Left Eye (OS)</span>
          </button>
        </div>

        <div className={styles.prescriptionGrid}>
          {/* Dynamic form fields based on activeEye */}
          <div className={styles.formColumn}>
            <div className={styles.inputGroup}>
              <label>Sphere (SPH)</label>
              <input
                type="number"
                step="0.25"
                value={prescriptionData[`sphere${activeEye}`]}
                onChange={(e) => handleInputChange(`sphere${activeEye}` as keyof PrescriptionData, e.target.value)}
                className={errors[`sphere${activeEye}`] ? styles.error : ''}
              />
              {errors[`sphere${activeEye}`] && (
                <span className={styles.errorText}>{errors[`sphere${activeEye}`]}</span>
              )}
              <span className={styles.range}>-12.00 to +12.00</span>
            </div>

            <div className={styles.inputGroup}>
              <label>Cylinder (CYL)</label>
              <input
                type="number"
                step="0.25"
                value={prescriptionData[`cylinder${activeEye}`]}
                onChange={(e) => handleInputChange(`cylinder${activeEye}` as keyof PrescriptionData, e.target.value)}
                className={errors[`cylinder${activeEye}`] ? styles.error : ''}
              />
              {errors[`cylinder${activeEye}`] && (
                <span className={styles.errorText}>{errors[`cylinder${activeEye}`]}</span>
              )}
              <span className={styles.range}>-12.00 to +12.00</span>
            </div>

            <div className={styles.inputGroup}>
              <label>Axis</label>
              <input
                type="number"
                step="1"
                value={prescriptionData[`axis${activeEye}`]}
                onChange={(e) => handleInputChange(`axis${activeEye}` as keyof PrescriptionData, e.target.value)}
                className={errors[`axis${activeEye}`] ? styles.error : ''}
              />
              {errors[`axis${activeEye}`] && (
                <span className={styles.errorText}>{errors[`axis${activeEye}`]}</span>
              )}
              <span className={styles.range}>0° to 180°</span>
            </div>

            <div className={styles.inputGroup}>
              <label>Add Power</label>
              <input
                type="number"
                step="0.25"
                value={prescriptionData[`add${activeEye}`]}
                onChange={(e) => handleInputChange(`add${activeEye}` as keyof PrescriptionData, e.target.value)}
                className={errors[`add${activeEye}`] ? styles.error : ''}
              />
              {errors[`add${activeEye}`] && (
                <span className={styles.errorText}>{errors[`add${activeEye}`]}</span>
              )}
              <span className={styles.range}>0.00 to +4.00</span>
            </div>
          </div>
        </div>

        <div className={styles.pdSection}>
          <div className={styles.inputGroup}>
            <label>Pupillary Distance (PD)</label>
            <input
              type="number"
              step="0.5"
              value={prescriptionData.pd}
              onChange={(e) => handleInputChange('pd', e.target.value)}
              className={errors.pd ? styles.error : ''}
            />
            {errors.pd && (
              <span className={styles.errorText}>{errors.pd}</span>
            )}
            <span className={styles.range}>50mm to 80mm</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.resetButton} onClick={handleReset}>
            <RefreshCw size={20} />
            Reset Values
          </button>
          <button className={styles.submitButton} onClick={handleSubmit}>
            <Save size={20} />
            Save Prescription
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm;