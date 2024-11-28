import React, { useState, useEffect } from 'react';
import { FaTimes, FaEye, FaRegEyeSlash, FaCalendar, FaNotesMedical } from 'react-icons/fa';
import "./MeasurementFormStyle.scss"

interface MeasurementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Measurement[]) => void;
  editingMeasurement?: Measurement | Measurement[];
  recordId: number;
  
}

interface Measurement {
  id?: number;
  recordID: number;
  
  testType: number;
  spherical: number;
  cylindrical: number;
  axis: number;
  pupilDistance: number;
  eyeSide: number;
  prescriptionDetails: string;
  lastCheckupDate: string;
  nextCheckupDate: string;
  notes: string;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMeasurement,
  recordId,

}) => {
  const initialFormState = {
    recordID: recordId,
    testType: 0,
    spherical: 0,
    cylindrical: 0,
    axis: 0,
    pupilDistance: 0,
    prescriptionDetails: '',
    notes: '',
    lastCheckupDate: new Date().toISOString(),
    nextCheckupDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  const [leftEyeData, setLeftEyeData] = useState<Measurement>({...initialFormState, eyeSide: 0});
  const [rightEyeData, setRightEyeData] = useState<Measurement>({...initialFormState, eyeSide: 1});
  const [commonPupilDistance, setCommonPupilDistance] = useState(0);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (editingMeasurement) {
      const leftEye = Array.isArray(editingMeasurement) 
        ? editingMeasurement.find(m => m.eyeSide === 0)
        : editingMeasurement.eyeSide === 0 ? editingMeasurement : null;
        
      const rightEye = Array.isArray(editingMeasurement)
        ? editingMeasurement.find(m => m.eyeSide === 1) 
        : editingMeasurement.eyeSide === 1 ? editingMeasurement : null;
  
      if (leftEye) {
        setLeftEyeData({
          ...leftEye,
          lastCheckupDate: new Date(leftEye.lastCheckupDate).toISOString(),
          nextCheckupDate: new Date(leftEye.nextCheckupDate).toISOString()
        });
        setCommonPupilDistance(leftEye.pupilDistance);
      }
  
      if (rightEye) {
        setRightEyeData({
          ...rightEye,
          lastCheckupDate: new Date(rightEye.lastCheckupDate).toISOString(),
          nextCheckupDate: new Date(rightEye.nextCheckupDate).toISOString()
        });
      }
    }
  }, [editingMeasurement]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate pupil distance - Không cho số âm
    if (commonPupilDistance === null || commonPupilDistance === undefined || isNaN(commonPupilDistance)) {
      newErrors.pupilDistance = 'Pupil distance is required';
    } else if (commonPupilDistance < 50 || commonPupilDistance > 80) {
      newErrors.pupilDistance = 'Pupil distance must be between 50 and 80mm';
    }

    // Validate left eye
    if (leftEyeData.spherical === null || leftEyeData.spherical === undefined || isNaN(leftEyeData.spherical)) {
      newErrors.leftSpherical = 'Spherical value is required';
    } else if (leftEyeData.spherical < -20 || leftEyeData.spherical > 20) {
      newErrors.leftSpherical = 'Spherical must be between -20 and +20';
    }

    if (leftEyeData.cylindrical === null || leftEyeData.cylindrical === undefined || isNaN(leftEyeData.cylindrical)) {
      newErrors.leftCylindrical = 'Cylindrical value is required';
    } else if (leftEyeData.cylindrical < -20 || leftEyeData.cylindrical > 20) {
      newErrors.leftCylindrical = 'Cylindrical must be between -20 and +20';
    }

    if (leftEyeData.axis === null || leftEyeData.axis === undefined || isNaN(leftEyeData.axis)) {
      newErrors.leftAxis = 'Axis value is required';
    } else if (leftEyeData.axis < 0 || leftEyeData.axis > 180) { // Không cho số âm cho Axis
      newErrors.leftAxis = 'Axis must be between 0 and 180 degrees';
    }

    // Validate right eye
    if (rightEyeData.spherical === null || rightEyeData.spherical === undefined || isNaN(rightEyeData.spherical)) {
      newErrors.rightSpherical = 'Spherical value is required';
    } else if (rightEyeData.spherical < -20 || rightEyeData.spherical > 20) {
      newErrors.rightSpherical = 'Spherical must be between -20 and +20';
    }

    if (rightEyeData.cylindrical === null || rightEyeData.cylindrical === undefined || isNaN(rightEyeData.cylindrical)) {
      newErrors.rightCylindrical = 'Cylindrical value is required';
    } else if (rightEyeData.cylindrical < -20 || rightEyeData.cylindrical > 20) {
      newErrors.rightCylindrical = 'Cylindrical must be between -20 and +20';
    }

    if (rightEyeData.axis === null || rightEyeData.axis === undefined || isNaN(rightEyeData.axis)) {
      newErrors.rightAxis = 'Axis value is required';
    } else if (rightEyeData.axis < 0 || rightEyeData.axis > 180) { // Không cho số âm cho Axis
      newErrors.rightAxis = 'Axis must be between 0 and 180 degrees';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const leftEyeSubmit = { ...leftEyeData, pupilDistance: commonPupilDistance };
      const rightEyeSubmit = { ...rightEyeData, pupilDistance: commonPupilDistance };
      
      if (editingMeasurement) {
        onSave([
          { ...leftEyeSubmit, id: leftEyeData.id },
          { ...rightEyeSubmit, id: rightEyeData.id }
        ]);
      } else {
        onSave([leftEyeSubmit, rightEyeSubmit]);
      }
    }
  };

  const handleDateChange = (field: string, value: string) => {
    const dateValue = new Date(value).toISOString();
    setLeftEyeData(prev => ({...prev, [field]: dateValue}));
    setRightEyeData(prev => ({...prev, [field]: dateValue}));
  };

  if (!isOpen) return null;

  return (
    <div className="measurement-form-overlay">
      <div className="measurement-form-modal">
        <div className="form-header">
          <h2>New Measurements for Both Eyes</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Common Pupil Distance Field */}
          <div className="common-measurement">
            <div className="form-group">
              <label>
                Pupil Distance (mm) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={commonPupilDistance}
                onChange={(e) => setCommonPupilDistance(parseFloat(e.target.value))}
                className={errors.pupilDistance ? 'error' : ''}
                required
              />
              {errors.pupilDistance && <span className="error-message">{errors.pupilDistance}</span>}
            </div>
          </div>

          <div className="measurements-container">
            {/* Left Eye Section */}
            <div className="eye-section">
              <h3><FaEye /> Left Eye</h3>
              <div className="measurement-inputs">
                <div className="form-group">
                  <label>
                    Spherical (D) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={leftEyeData.spherical}
                    onChange={(e) => setLeftEyeData({...leftEyeData, spherical: parseFloat(e.target.value)})}
                    className={errors.leftSpherical ? 'error' : ''}
                    required
                  />
                  {errors.leftSpherical && <span className="error-message">{errors.leftSpherical}</span>}
                </div>

                <div className="form-group">
                  <label>
                    Cylindrical (D) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={leftEyeData.cylindrical}
                    onChange={(e) => setLeftEyeData({...leftEyeData, cylindrical: parseFloat(e.target.value)})}
                    className={errors.leftCylindrical ? 'error' : ''}
                    required
                  />
                  {errors.leftCylindrical && <span className="error-message">{errors.leftCylindrical}</span>}
                </div>

                <div className="form-group">
                  <label>
                    Axis (°) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={leftEyeData.axis}
                    onChange={(e) => setLeftEyeData({...leftEyeData, axis: parseInt(e.target.value)})}
                    className={errors.leftAxis ? 'error' : ''}
                    required
                  />
                  {errors.leftAxis && <span className="error-message">{errors.leftAxis}</span>}
                </div>
              </div>
            </div>

            {/* Right Eye Section */}
            <div className="eye-section">
              <h3><FaEye /> Right Eye</h3>
              <div className="measurement-inputs">
                <div className="form-group">
                  <label>
                    Spherical (D) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={rightEyeData.spherical}
                    onChange={(e) => setRightEyeData({...rightEyeData, spherical: parseFloat(e.target.value)})}
                    className={errors.rightSpherical ? 'error' : ''}
                    required
                  />
                  {errors.rightSpherical && <span className="error-message">{errors.rightSpherical}</span>}
                </div>

                <div className="form-group">
                  <label>
                    Cylindrical (D) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={rightEyeData.cylindrical}
                    onChange={(e) => setRightEyeData({...rightEyeData, cylindrical: parseFloat(e.target.value)})}
                    className={errors.rightCylindrical ? 'error' : ''}
                    required
                  />
                  {errors.rightCylindrical && <span className="error-message">{errors.rightCylindrical}</span>}
                </div>

                <div className="form-group">
                  <label>
                    Axis (°) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={rightEyeData.axis}
                    onChange={(e) => setRightEyeData({...rightEyeData, axis: parseInt(e.target.value)})}
                    className={errors.rightAxis ? 'error' : ''}
                    required
                  />
                  {errors.rightAxis && <span className="error-message">{errors.rightAxis}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Common Fields */}
          <div className="common-fields">
            <div className="form-group">
              <label>Prescription Details</label>
              <textarea
                value={leftEyeData.prescriptionDetails}
                onChange={(e) => {
                  setLeftEyeData({...leftEyeData, prescriptionDetails: e.target.value});
                  setRightEyeData({...rightEyeData, prescriptionDetails: e.target.value});
                }}
                placeholder="Enter detailed prescription information..."
                rows={3}
              />
            </div>

            <div className="dates-grid">
              <div className="form-group">
                <label>Last Checkup Date</label>
                <input
                  type="date"
                  value={leftEyeData.lastCheckupDate.split('T')[0]}
                  onChange={(e) => handleDateChange('lastCheckupDate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Next Checkup Date</label>
                <input
                  type="date"
                  value={leftEyeData.nextCheckupDate.split('T')[0]}
                  onChange={(e) => handleDateChange('nextCheckupDate', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={leftEyeData.notes}
                onChange={(e) => {
                  setLeftEyeData({...leftEyeData, notes: e.target.value});
                  setRightEyeData({...rightEyeData, notes: e.target.value});
                }}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Measurements
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeasurementForm;