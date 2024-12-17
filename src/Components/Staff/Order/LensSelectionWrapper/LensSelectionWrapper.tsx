  import React, { useState, useEffect } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import Swal from 'sweetalert2';
  import ProfileSelector from './ProfileSelector';
  import MeasurementHistory from './MeasurementHistory';
  import PrescriptionForm from './PrescriptionForm';
  import LensSelector from './LensSelector';
  import { CheckCircle2, ArrowRight, Eye } from 'lucide-react';
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
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [selectedLensType, setSelectedLensType] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);

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

    const shouldSkipPrescription = selectionState.leftLens?.lensType.isNoPrescription && 
                                selectionState.rightLens?.lensType.isNoPrescription;

    const steps = shouldSkipPrescription ? [
      {
        id: 1,
        title: 'Select Lenses',
        description: 'Choose the perfect lenses for your needs',
        icon: <Eye className={styles.stepIcon} size={20} />
      }
    ] : [
      {
        id: 1,
        title: 'Select Lenses',
        description: 'Choose the perfect lenses for your needs',
        icon: <Eye className={styles.stepIcon} size={20} />
      },
      {
        id: 2,
        title: 'Select Profile',
        description: 'Choose or create your profile',
        icon: <Eye className={styles.stepIcon} size={20} />
      },
      {
        id: 3,
        title: 'Measurement History',
        description: 'Review your previous measurements',
        icon: <Eye className={styles.stepIcon} size={20} />
      },
      {
        id: 4,
        title: 'Prescription Details',
        description: 'Confirm your prescription information',
        icon: <Eye className={styles.stepIcon} size={20} />
      }
    ];

    // Step handlers
    const handleLensSelect = (lens: Lens, eye?: 'left' | 'right') => {
      if (lensMode === 'same') {
        setSelectionState(prev => ({
          ...prev,
          leftLens: lens,
          rightLens: lens
        }));
    
        // Sử dụng isNoPrescription
        if (lens.lensType.isNoPrescription) {
          handleDirectComplete(lens, lens);
        } else {
          setCurrentStep(2);
        }
      } else {
        // Custom mode logic
        const updatedSelectionState = {
          ...selectionState,
          [eye === 'left' ? 'leftLens' : 'rightLens']: lens
        };
    
        setSelectionState(updatedSelectionState);
    
        // Check if both lenses are selected
        if ((eye === 'left' && selectionState.rightLens) ||
            (eye === 'right' && selectionState.leftLens)) {
          
          const leftLens = eye === 'left' ? lens : selectionState.leftLens;
          const rightLens = eye === 'right' ? lens : selectionState.rightLens;
    
          // Kiểm tra cả hai lens có isNoPrescription
          if (leftLens?.lensType.isNoPrescription && rightLens?.lensType.isNoPrescription) {
            handleDirectComplete(leftLens, rightLens);
          } else {
            setCurrentStep(2);
          }
        }
      }
    };

    const getLensTypeInfo = () => {
      return {
        leftEyeType: selectionState.leftLens?.lensTypeID,
        rightEyeType: selectionState.rightLens?.lensTypeID
      };
    };

    const handleDirectComplete = (leftLens: Lens, rightLens: Lens) => {
      // Show success message
      Swal.fire({
        title: "Added to Cart!",
        text: "The selected lenses have been added to your cart successfully!",
        icon: "success"
      });
  
      // Call the original onComplete
      onComplete({
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
        leftLens,
        rightLens
      });
    };


    const handleProfileSelect = (profileId: number) => {
      setSelectionState(prev => ({ ...prev, profileId }));
      setCurrentStep(3);
    };

    const handleMeasurementSelect = (measurements: MeasurementRecord[]) => {
      setSelectionState(prev => ({ ...prev, measurements }));
      setCurrentStep(4);
    };

    const handlePrescriptionComplete = (prescriptionData: PrescriptionData) => {
      setSelectionState(prev => ({ ...prev, prescriptionData }));
      handleFinalSubmit(prescriptionData);
    };

    const handleFinalSubmit = (prescriptionData: PrescriptionData) => {
      const { leftLens, rightLens } = selectionState;

      if (!leftLens || !rightLens) {
        return; // Handle error
      }

      onComplete({
        prescriptionData,
        leftLens,
        rightLens
      });
    };

    // Handle back navigation
    const handleStepBack = () => {
      if (shouldSkipPrescription) {
        onBack(); // Exit lens selection flow if type 4
        return;
      }

      switch (currentStep) {
        case 1:
          onBack();
          break;
        case 2:
          setCurrentStep(1);
          break;
        case 3:
          setCurrentStep(2);
          break;
        case 4:
          setCurrentStep(3);
          break;
        default:
          break;
      }
    };

    // Step renderer
    const renderCurrentStep = () => {
      switch (currentStep) {
        case 1:
          return (
            <LensSelector
              lensMode={lensMode}
              prescriptionData={selectionState.prescriptionData}
              onSelect={handleLensSelect}
              onComplete={() => setCurrentStep(2)}
              onBack={handleStepBack}
              selectedLenses={{
                left: selectionState.leftLens ?? null,
                right: selectionState.rightLens ?? null
              }}
            />
          );
  
        case 2:
          return !shouldSkipPrescription ? (
            <ProfileSelector
              accountId={accountId}
              onSelect={handleProfileSelect}
              onBack={handleStepBack}
              selectedLenses={{
                left: selectionState.leftLens ?? null,
                right: selectionState.rightLens ?? null
              }}
            />
          ) : null;
  
        case 3:
          return !shouldSkipPrescription ? (
            <MeasurementHistory
              profileId={selectionState.profileId!}
              onSelect={handleMeasurementSelect}
              onBack={handleStepBack}
              refractionRecordService={refractionRecordService}
              measurementService={measurementResultService}
            />
          ) : null;
  
        case 4:
          return !shouldSkipPrescription ? (
            <PrescriptionForm
              initialData={selectionState.measurements}
              onComplete={handlePrescriptionComplete}
              onBack={handleStepBack}
              lensMode={lensMode}
              lensTypeInfo={getLensTypeInfo()} // Pass lens type info
            />
          ) : null;
  
        default:
          return null;
      }
    };


    const renderStepProgress = () => {
      return (
        <div className={styles.stepsProgress}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          <div className={styles.stepsContainer}>
            {steps.map((step) => (
              <div
                key={step.id}
                className={`${styles.stepItem} ${currentStep === step.id ? styles.active : ''
                  } ${currentStep > step.id ? styles.completed : ''}`}
              >
                <div className={styles.stepIconWrapper}>
                  {currentStep > step.id ? (
                    <CheckCircle2 className={styles.completedIcon} size={24} />
                  ) : (
                    <div className={styles.stepNumber}>{step.id}</div>
                  )}
                </div>
                <div className={styles.stepInfo}>
                  <h4 className={styles.stepTitle}>{step.title}</h4>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
                {step.id !== steps.length && (
                  <ArrowRight className={styles.stepArrow} size={20} />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className={styles.wrapper}>
      <div className={styles.container}>
        {!shouldSkipPrescription && renderStepProgress()}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className={styles.contentContainer}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>

        {!shouldSkipPrescription && (
          <div className={styles.progressIndicator}>
            <div className={styles.steps}>
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`${styles.indicator} ${
                    currentStep >= step.id ? styles.active : ''
                  }`}
                />
              ))}
            </div>
            <p className={styles.stepCounter}>
              Step {currentStep} of {steps.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
  };

  export default LensSelectionWrapper;