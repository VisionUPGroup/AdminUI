import React, { useState, useEffect } from 'react';
import { FaTimes, FaEye, FaRegEyeSlash, FaCalendar, FaNotesMedical } from 'react-icons/fa';
import "./MeasurementFormStyle.scss"

interface MeasurementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Measurement[]) => void;
  editingMeasurement?: Measurement | Measurement[];
  recordId: number;
  employeeId: number;
}
interface Measurement {
  id?: number;
  recordID: number;
  employeeID: number;
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
  employeeId
}) => {
  const initialFormState = {
    recordID: recordId,
    employeeID: employeeId,
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
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  useEffect(() => {
    if (editingMeasurement) {
      // Tìm measurement cho mắt trái và phải
      const leftEye = Array.isArray(editingMeasurement) 
        ? editingMeasurement.find(m => m.eyeSide === 0)
        : editingMeasurement.eyeSide === 0 ? editingMeasurement : null;
        
      const rightEye = Array.isArray(editingMeasurement)
        ? editingMeasurement.find(m => m.eyeSide === 1) 
        : editingMeasurement.eyeSide === 1 ? editingMeasurement : null;
  
      // Cập nhật state
      if (leftEye) {
        setLeftEyeData({
          ...leftEye,
          lastCheckupDate: new Date(leftEye.lastCheckupDate).toISOString(),
          nextCheckupDate: new Date(leftEye.nextCheckupDate).toISOString()
        });
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
    [leftEyeData, rightEyeData].forEach((data, index) => {
      const eye = index === 0 ? 'left' : 'right';
      if (data.spherical < -20 || data.spherical > 20) {
        newErrors[`${eye}Spherical`] = 'Spherical must be between -20 and +20';
      }
      if (data.cylindrical < -20 || data.cylindrical > 20) {
        newErrors[`${eye}Cylindrical`] = 'Cylindrical must be between -20 and +20';
      }
      if (data.axis < 0 || data.axis > 180) {
        newErrors[`${eye}Axis`] = 'Axis must be between 0 and 180 degrees';
      }
      if (data.pupilDistance < 50 || data.pupilDistance > 80) {
        newErrors[`${eye}PupilDistance`] = 'Pupil distance must be between 50 and 80mm';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (editingMeasurement) {
        // Nếu đang edit, gửi cả 2 measurement để update
        onSave([
          { ...leftEyeData, id: leftEyeData.id },
          { ...rightEyeData, id: rightEyeData.id }
        ]);
      } else {
        // Tạo mới
        onSave([leftEyeData, rightEyeData]);
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
          <div className="measurements-container">
            {/* Left Eye Section */}
            <div className="eye-section">
              <h3><FaEye /> Left Eye</h3>
              <div className="measurement-inputs">
                <div className="form-group">
                  <label>Spherical (D)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={leftEyeData.spherical}
                    onChange={(e) => setLeftEyeData({...leftEyeData, spherical: parseFloat(e.target.value)})}
                    className={errors.leftSpherical ? 'error' : ''}
                  />
                  {errors.leftSpherical && <span className="error-message">{errors.leftSpherical}</span>}
                </div>

                <div className="form-group">
                  <label>Cylindrical (D)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={leftEyeData.cylindrical}
                    onChange={(e) => setLeftEyeData({...leftEyeData, cylindrical: parseFloat(e.target.value)})}
                    className={errors.leftCylindrical ? 'error' : ''}
                  />
                  {errors.leftCylindrical && <span className="error-message">{errors.leftCylindrical}</span>}
                </div>

                <div className="form-group">
                  <label>Axis (°)</label>
                  <input
                    type="number"
                    value={leftEyeData.axis}
                    onChange={(e) => setLeftEyeData({...leftEyeData, axis: parseInt(e.target.value)})}
                    className={errors.leftAxis ? 'error' : ''}
                  />
                  {errors.leftAxis && <span className="error-message">{errors.leftAxis}</span>}
                </div>

                <div className="form-group">
                  <label>Pupil Distance (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={leftEyeData.pupilDistance}
                    onChange={(e) => setLeftEyeData({...leftEyeData, pupilDistance: parseFloat(e.target.value)})}
                    className={errors.leftPupilDistance ? 'error' : ''}
                  />
                  {errors.leftPupilDistance && <span className="error-message">{errors.leftPupilDistance}</span>}
                </div>
              </div>
            </div>

            {/* Right Eye Section */}
            <div className="eye-section">
              <h3><FaEye /> Right Eye</h3>
              <div className="measurement-inputs">
                <div className="form-group">
                  <label>Spherical (D)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={rightEyeData.spherical}
                    onChange={(e) => setRightEyeData({...rightEyeData, spherical: parseFloat(e.target.value)})}
                    className={errors.rightSpherical ? 'error' : ''}
                  />
                  {errors.rightSpherical && <span className="error-message">{errors.rightSpherical}</span>}
                </div>

                <div className="form-group">
                  <label>Cylindrical (D)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={rightEyeData.cylindrical}
                    onChange={(e) => setRightEyeData({...rightEyeData, cylindrical: parseFloat(e.target.value)})}
                    className={errors.rightCylindrical ? 'error' : ''}
                  />
                  {errors.rightCylindrical && <span className="error-message">{errors.rightCylindrical}</span>}
                </div>

                <div className="form-group">
                  <label>Axis (°)</label>
                  <input
                    type="number"
                    value={rightEyeData.axis}
                    onChange={(e) => setRightEyeData({...rightEyeData, axis: parseInt(e.target.value)})}
                    className={errors.rightAxis ? 'error' : ''}
                  />
                  {errors.rightAxis && <span className="error-message">{errors.rightAxis}</span>}
                </div>

                <div className="form-group">
                  <label>Pupil Distance (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={rightEyeData.pupilDistance}
                    onChange={(e) => setRightEyeData({...rightEyeData, pupilDistance: parseFloat(e.target.value)})}
                    className={errors.rightPupilDistance ? 'error' : ''}
                  />
                  {errors.rightPupilDistance && <span className="error-message">{errors.rightPupilDistance}</span>}
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