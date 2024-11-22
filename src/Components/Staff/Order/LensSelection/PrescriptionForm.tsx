import React from 'react';
import { useForm } from 'react-hook-form';
import styles from '../styles/LensSelection.module.scss';
import { LensType } from '../types/lens';

interface PrescriptionFormProps {
  lensType: LensType;
  onSubmit: (data: PrescriptionData) => void;
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

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ 
  lensType, 
  onSubmit 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const isNonPrescription = lensType.id === 4;

  if (isNonPrescription) {
    return (
      <div className={styles.prescriptionForm}>
        <h3>Non-Prescription Lens</h3>
        <p>No prescription parameters needed</p>
        <button 
          className={styles.submitButton}
          onClick={() => onSubmit({})}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <form 
      className={styles.prescriptionForm}
      onSubmit={handleSubmit(onSubmit)}
    >
      <h3>Enter Prescription Details</h3>

      <div className={styles.eyeParameters}>
        <div className={styles.eye}>
          <h4>Right Eye (OD)</h4>
          <div className={styles.inputGroup}>
            <label>Sphere</label>
            <input
              type="number"
              step="0.25"
              {...register('sphereOD', { required: true })}
            />
            {errors.sphereOD && <span className={styles.error}>Required</span>}
          </div>
          <div className={styles.inputGroup}>
            <label>Cylinder</label>
            <input
              type="number"
              step="0.25"
              {...register('cylinderOD')}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Axis</label>
            <input
              type="number"
              {...register('axisOD')}
            />
          </div>
        </div>

        <div className={styles.eye}>
          <h4>Left Eye (OS)</h4>
          <div className={styles.inputGroup}>
            <label>Sphere</label>
            <input
              type="number"
              step="0.25"
              {...register('sphereOS', { required: true })}
            />
            {errors.sphereOS && <span className={styles.error}>Required</span>}
          </div>
          <div className={styles.inputGroup}>
            <label>Cylinder</label>
            <input
              type="number"
              step="0.25"
              {...register('cylinderOS')}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Axis</label>
            <input
              type="number"
              {...register('axisOS')}
            />
          </div>
        </div>
      </div>

      <div className={styles.pdMeasurement}>
        <label>PD (Pupillary Distance)</label>
        <input
          type="number"
          step="0.5"
          {...register('pd', { required: true })}
        />
        {errors.pd && <span className={styles.error}>Required</span>}
      </div>

      <button 
        type="submit"
        className={styles.submitButton}
      >
        Continue
      </button>
    </form>
  );
};

export default PrescriptionForm;