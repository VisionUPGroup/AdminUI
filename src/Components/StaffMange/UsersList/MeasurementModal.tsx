import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaPen, FaTrash, FaEye } from "react-icons/fa";
import { useMeasurementService } from "../../../../Api/measurementService";
import Swal from "sweetalert2";
import "./MeasurementModalStyle.scss";
import MeasurementForm from "./MeasurementForm";
interface MeasurementFormProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: number;
  employeeId?: number; // Làm cho optional
  onSave?: (data: Measurement[]) => void; // Làm cho optional
  editingMeasurement?: Measurement[];  
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

const MeasurementModal: React.FC<MeasurementFormProps> = ({
  isOpen,
  onClose,
  recordId,
}) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement[] | undefined>(undefined);  // Thay null bằng undefined
 

  const {
    fetchMeasurementsRecordId,
    createMeasurement,
    updateMeasurement,
    deleteMeasurement,
  } = useMeasurementService();

  useEffect(() => {
    if (isOpen && recordId) {
      fetchMeasurements();
    }
  }, [recordId, isOpen]);

  const fetchMeasurements = async () => {
    setIsLoading(true);
    try {
      const response = await fetchMeasurementsRecordId(recordId);
      setMeasurements(Array.isArray(response) ? response : [response]);
    } catch (error) {
      console.error("Error fetching measurements:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load measurements",
        confirmButtonColor: "#c79816",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingMeasurement(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (measurement: Measurement) => {
    const measurementsToEdit = measurements.filter(m => 
      m.recordID === measurement.recordID
    );
    setEditingMeasurement(measurementsToEdit);
    setIsFormOpen(true);
  };
   const handleDeleteMeasurement = async (id: number | undefined) => {
    if (!id) return;
    
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#c79816",
        cancelButtonColor: "#000000",
        confirmButtonText: "Yes, delete it!"
      });
  
      if (result.isConfirmed) {
        await deleteMeasurement(id);
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Measurement has been deleted.",
          confirmButtonColor: "#c79816"
        });
        fetchMeasurements();
      }
    } catch (error) {
      console.error("Error deleting measurement:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete measurement",
        confirmButtonColor: "#c79816"
      });
    }
  };

  const handleSaveMeasurement = async (formData: any) => {
    try {
      if (Array.isArray(formData)) {
        if (formData[0].id) {
          // Update cả 2 mắt
          const promises = formData.map(data => updateMeasurement(data));
          await Promise.all(promises);
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Measurements updated successfully!",
            confirmButtonColor: "#c79816",
          });
        } else {
          // Tạo mới cả 2 mắt
          const promises = formData.map(data => createMeasurement(data));
          await Promise.all(promises);
          await Swal.fire({
            icon: "success",
            title: "Success", 
            text: "Measurements created successfully!",
            confirmButtonColor: "#c79816",
          });
        }
      }
      setIsFormOpen(false);
      fetchMeasurements();
    } catch (error) {
      console.error("Error saving measurements:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response.data[0],
        confirmButtonColor: "#c79816", 
      });
    }
  };
  if (!isOpen) return null;

  return (
    <div className="measurement-modal-overlay">
      <div className="measurement-modal">
        <div className="modal-header">
          <div>
            <h2>Measurements</h2>
            <p>Record ID: {recordId}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          <div className="actions-bar">
            <button className="create-btn" onClick={handleCreateClick}>
              <FaPlus /> New Measurement
            </button>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading measurements...</p>
            </div>
          ) : measurements.length === 0 ? (
            <div className="empty-state">
              <FaEye className="empty-icon" />
              <h3>No Measurements Found</h3>
              <p>Start by creating a new measurement</p>
              <button className="create-first-btn" onClick={handleCreateClick}>
                <FaPlus /> Create First Measurement
              </button>
            </div>
          ) : (
            <div className="measurements-grid">
              {measurements.map((measurement) => (
                <div key={measurement.id} className="measurement-card">
                  <div className="measurement-header">
                    <span
                      className={`eye-side-badge ${
                        measurement.eyeSide === 0 ? "left" : "right"
                      }`}
                    >
                      {measurement.eyeSide === 0 ? "Left Eye" : "Right Eye"}
                    </span>
                    <div className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditClick(measurement)}
                      >
                        <FaPen />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => measurement.id && handleDeleteMeasurement(measurement.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="measurement-body">
                    <div className="measurement-group">
                      <div className="measurement-item">
                        <label>Spherical</label>
                        <span>{measurement.spherical}</span>
                      </div>
                      <div className="measurement-item">
                        <label>Cylindrical</label>
                        <span>{measurement.cylindrical}</span>
                      </div>
                      <div className="measurement-item">
                        <label>Axis</label>
                        <span>{measurement.axis}°</span>
                      </div>
                      <div className="measurement-item">
                        <label>Pupil Distance</label>
                        <span>{measurement.pupilDistance} mm</span>
                      </div>
                    </div>

                    <div className="measurement-notes">
                      <label>Notes</label>
                      <p>{measurement.notes || "No notes available"}</p>
                    </div>

                    <div className="measurement-dates">
                      <div className="date-item">
                        <label>Last Checkup</label>
                        <span>
                          {new Date(
                            measurement.lastCheckupDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="date-item">
                        <label>Next Checkup</label>
                        <span>
                          {new Date(
                            measurement.nextCheckupDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isFormOpen && (
        <MeasurementForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveMeasurement}
          editingMeasurement={editingMeasurement}
          recordId={recordId}/>
      )}
    </div>
  );
};

export default MeasurementModal;
