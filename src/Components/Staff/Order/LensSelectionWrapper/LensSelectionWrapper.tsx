import React, { useState, useEffect } from 'react';
import ProfileSelector from './ProfileSelector';
import MeasurementHistory from './MeasurementHistory';
import PrescriptionForm from './PrescriptionForm';
import LensSelector from './LensSelector'; // New component
import { LensSelectionState, MeasurementRecord, PrescriptionData, LensMode, Lens } from '../types/lens.types';
import styles from './LensSelectionWrapper.module.scss';

interface LensSelectionWrapperProps {
  accountId: number;
  lensMode: LensMode;
  onComplete: (data: {
    prescriptionData: PrescriptionData;
    leftLens: Lens;
    rightLens: Lens;
  }) => void;
  onBack: () => void;
  refractionRecordService: any;
  measurementResultService: any;
}

const LensSelectionWrapper: React.FC<LensSelectionWrapperProps> = ({
  accountId,
  lensMode,
  onComplete,
  onBack,
  refractionRecordService,
  measurementResultService
}) => {
  // Step management
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Selection state
  const [selectionState, setSelectionState] = useState<LensSelectionState>({
    profileId: null,
    refractionRecordId: null,
    measurements: [],
    prescriptionData: {
      sphereOD: 0,
      cylinderOD: 0,
      axisOD: 0,
      sphereOS: 0,
      cylinderOS: 0,
      axisOS: 0,
      addOD: 0,
      addOS: 0,
      pd: 0
    },
    mode: lensMode,
    leftLens: null,
    rightLens: null
  });

  const steps = [
    { id: 1, title: 'Select Profile' },
    { id: 2, title: 'Measurement History' },
    { id: 3, title: 'Prescription Details' },
    { id: 4, title: 'Select Lenses' }
  ];
  

  // Step handlers
  const handleProfileSelect = (profileId: number) => {
    setSelectionState(prev => ({ ...prev, profileId }));
    setCurrentStep(2);
  };

  const handleMeasurementSelect = (measurements: MeasurementRecord[]) => {
    setSelectionState(prev => ({ ...prev, measurements }));
    setCurrentStep(3);
  };

  const handlePrescriptionComplete = (prescriptionData: PrescriptionData) => {
    setSelectionState(prev => ({ ...prev, prescriptionData }));
    setCurrentStep(4);
  };

  const handleLensSelect = (lens: Lens, eye?: 'left' | 'right') => {
    if (lensMode === 'same') {
      setSelectionState(prev => ({
        ...prev,
        leftLens: lens,
        rightLens: lens
      }));
    } else {
      setSelectionState(prev => ({
        ...prev,
        [eye === 'left' ? 'leftLens' : 'rightLens']: lens
      }));
    }
  };

  const handleFinalSubmit = () => {
    const { prescriptionData, leftLens, rightLens } = selectionState;
    
    if (!leftLens || !rightLens) {
      return; // Handle error
    }

    onComplete({
      prescriptionData,
      leftLens,
      rightLens
    });
  };

  // Step components
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProfileSelector 
            accountId={accountId}
            onSelect={handleProfileSelect}
            onBack={onBack}
          />
        );
      
      case 2:
        return (
          <MeasurementHistory
            profileId={selectionState.profileId!}
            onSelect={handleMeasurementSelect}
            onBack={() => setCurrentStep(1)}
            refractionRecordService={refractionRecordService}
            measurementService={measurementResultService}  // Sửa tên prop cho đúng
          />
        );
      
      case 3:
        return (
          <PrescriptionForm
            initialData={selectionState.measurements}
            onComplete={handlePrescriptionComplete}
            onBack={() => setCurrentStep(2)}
            lensMode={lensMode}  // Thêm prop lensMode
          />
        );
      
      case 4:
        return (
          <LensSelector
            lensMode={lensMode}
            prescriptionData={selectionState.prescriptionData}
            onSelect={handleLensSelect}
            onComplete={handleFinalSubmit}
            onBack={() => setCurrentStep(3)}
            selectedLenses={{
              left: selectionState.leftLens ?? null,
              right: selectionState.rightLens ?? null
            }}
          />
        );
  
      default:
        return null;
    }
  };

  return (
    <div className={styles.lensSelectionWrapper}>
      <div className={styles.progressStepsWrapper}>
        <div className={styles.progressSteps} data-step={currentStep}>
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`${styles.step} ${
                currentStep === step.id ? styles.active : ''
              } ${currentStep > step.id ? styles.completed : ''}`}
            >
              <div className={styles.stepNumber}>
                {currentStep > step.id ? '' : step.id}
              </div>
              <span className={styles.stepTitle}>{step.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.content}>
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default LensSelectionWrapper;