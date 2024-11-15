import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaPlus, 
  FaPen, 
  FaTrash, 
  FaClinicMedical, 
  FaRegClock,
  FaMapMarkedAlt,
  FaPhoneAlt
} from 'react-icons/fa';
import { useRefractionRecordsService } from '../../../../Api/refractionRecordService';
import Swal from 'sweetalert2';
import "./RefractionModalStyle.scss"
import MeasurementModal from './MeasurementModal';
interface RefractionModalProps {
  profileId: number | null;
  profileName: string;
  isOpen: boolean;
  onClose: () => void;
}

const RefractionModal: React.FC<RefractionModalProps> = ({
  profileId,
  profileName,
  isOpen,
  onClose
}) => {
  const [refractionRecords, setRefractionRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const {
    fetchRefractionRecordsByProfileId,
    createRefractionRecords,
    updateRefractionRecords,
    deleteRefractionRecords,
  } = useRefractionRecordsService();

  useEffect(() => {
    if (profileId && isOpen) {
      fetchRecords();
    }
  }, [profileId, isOpen]);
  
  const fetchRecords = async () => {
    if (!profileId) return;
    setIsLoading(true);
    try {
      const response = await fetchRefractionRecordsByProfileId(profileId);
      setRefractionRecords(response.data || []);
    } catch (error) {
      console.error('Error fetching refraction records:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load refraction records.',
        confirmButtonColor: '#c79816',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordClick = (record: any) => {
    setSelectedRecordId(record.id);
  };

  const handleCreateRecord = async () => {
    try {
      const result = await Swal.fire({
        title: 'Create New Refraction Record',
        showCancelButton: true,
        confirmButtonColor: '#c79816',
        cancelButtonColor: '#000000',
        confirmButtonText: 'Create',
        preConfirm: () => {
          return {
            profileID: profileId,
          };
        }
      });
  
      if (result.isConfirmed && result.value) {
        await createRefractionRecords(result.value);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Record created successfully!',
          confirmButtonColor: '#c79816',
        });
        fetchRecords();
      }
    } catch (error) {
      console.error('Error creating record:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create record.',
        confirmButtonColor: '#c79816',
      });
    }
  };
  
  const handleEditRecord = async (record: any) => {
    try {
      const result = await Swal.fire({
        title: 'Edit Refraction Record',
        showCancelButton: true,
        confirmButtonColor: '#c79816',
        cancelButtonColor: '#000000',
        confirmButtonText: 'Update',
        preConfirm: () => {
          return {
            id: record.id,
            profileID: profileId
          };
        }
      });
  
      if (result.isConfirmed && result.value) {
        await updateRefractionRecords(result.value);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Record updated successfully!',
          confirmButtonColor: '#c79816',
        });
        fetchRecords();
      }
    } catch (error) {
      console.error('Error updating record:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update record.',
        confirmButtonColor: '#c79816',
      });
    }
  };
  

  const handleDeleteRecord = async (recordId: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#c79816',
        cancelButtonColor: '#000000',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await deleteRefractionRecords(recordId);
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Record has been deleted.',
          confirmButtonColor: '#c79816',
        });
        fetchRecords();
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete record.',
        confirmButtonColor: '#c79816',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="refraction-modal-overlay">
      <div className="refraction-modal">
        <div className="modal-header">
          <div>
            <h2>Refraction Records</h2>
            <p>Viewing records for {profileName}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          <div className="actions-bar">
            <button className="create-record-btn" onClick={handleCreateRecord}>
              <FaPlus /> New Record
            </button>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading records...</p>
            </div>
          ) :  refractionRecords && refractionRecords.length === 0 ? (
            <div className="empty-state">
              <FaClinicMedical className="empty-icon" />
              <h3>No Records Found</h3>
              <p>Start by creating a new refraction record</p>
              {/* <button className="create-first-btn" onClick={handleCreateRecord}>
                <FaPlus /> Create First Record
              </button> */}
            </div>
          ) : (
            <div className="records-grid">
            {refractionRecords.map((record) => (
              <div key={record.id} className="record-card" onClick={() => handleRecordClick(record)}>
                  <div className="record-header">
                    <div className="status-badge" data-status={record.status ? 'active' : 'inactive'}>
                      {record.status ? 'Active' : 'Inactive'}
                    </div>
                    <div className="actions">
                      <button className="edit-btn" onClick={() => handleEditRecord(record)}>
                        <FaPen />
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteRecord(record.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="record-body">
                    <div className="info-group">
                      <div className="info-item">
                        <FaRegClock className="icon" />
                        <div>
                          <label>Start Time</label>
                          <span>{new Date(record.startTime).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {record.kiosks?.[0] && (
                      <div className="kiosk-info">
                        <h4>Kiosk Information</h4>
                        <div className="info-group">
                          <div className="info-item">
                            <FaClinicMedical className="icon" />
                            <div>
                              <label>Name</label>
                              <span>{record.kiosks[0].name}</span>
                            </div>
                          </div>
                          <div className="info-item">
                            <FaMapMarkedAlt className="icon" />
                            <div>
                              <label>Address</label>
                              <span>{record.kiosks[0].address}</span>
                            </div>
                          </div>
                          <div className="info-item">
                            <FaPhoneAlt className="icon" />
                            <div>
                              <label>Contact</label>
                              <span>{record.kiosks[0].phoneNumber}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedRecordId && (
  <MeasurementModal
    isOpen={!!selectedRecordId}
    onClose={() => setSelectedRecordId(null)}
    recordId={selectedRecordId}
  />
)}
      </div>
    </div>
  );
};

export default RefractionModal;