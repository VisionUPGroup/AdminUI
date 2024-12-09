import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FaExchangeAlt, FaStore, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';
import "./MoveOrderContent.scss"

interface KioskType {
  id: number;
  name: string;
  address: string;
  status: boolean;
}

interface MoveOrderModalProps {
  isOpen: boolean;
  toggle: () => void;
  currentKiosk: KioskType | null;
  kioskList: KioskType[];
  onMove: (data: {currentKioskID: number, targetKioskID: number}) => Promise<void>;
}

const MoveOrderModal: React.FC<MoveOrderModalProps> = ({
  isOpen,
  toggle,
  currentKiosk,
  kioskList,
  onMove
}) => {
  const [targetKioskId, setTargetKioskId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentKiosk) return;
    
    setIsLoading(true);
    try {
      await onMove({
        currentKioskID: currentKiosk.id,
        targetKioskID: targetKioskId
      });
      toggle();
    } catch (error) {
      console.error("Error moving orders:", error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTargetKioskId(0);
  };

  return (
    <Modal show={isOpen} onHide={toggle} size="lg" centered>
      <div className="move-order-modal">
        <div className="modal-header">
          <div className="header-content">
            <FaExchangeAlt className="header-icon" />
            <div>
              <h4>Move Orders</h4>
              <p className="text-muted mb-0">
                Select a target kiosk to move orders from{' '}
                <strong>{currentKiosk?.name}</strong>
              </p>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={toggle}></button>
        </div>

        <div className="modal-body">
          <div className="source-kiosk">
            <div className="section-title">Source Kiosk</div>
            {currentKiosk && (
              <div className="kiosk-card current">
                <div className="kiosk-icon">
                  <FaStore />
                </div>
                <div className="kiosk-details">
                  <h5>{currentKiosk.name}</h5>
                  <p>
                    <FaMapMarkerAlt /> {currentKiosk.address}
                  </p>
                  <span className={`status-badge ${currentKiosk.status ? 'active' : 'inactive'}`}>
                    {currentKiosk.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="target-selection">
  <div className="section-title">Select Target Kiosk</div>
  <div className="kiosk-grid">
    {kioskList
      .filter(kiosk => 
        // Lọc các kiosk có status true và khác với kiosk hiện tại
        kiosk.id !== currentKiosk?.id && kiosk.status === true
      )
      .map(kiosk => (
        <div
          key={kiosk.id}
          className={`kiosk-card selectable ${targetKioskId === kiosk.id ? 'selected' : ''}`}
          onClick={() => setTargetKioskId(kiosk.id)}
        >
          {targetKioskId === kiosk.id && (
            <div className="selected-indicator">
              <FaCheck />
            </div>
          )}
          <div className="kiosk-icon">
            <FaStore />
          </div>
          <div className="kiosk-details">
            <h5>{kiosk.name}</h5>
            <p>
              <FaMapMarkerAlt /> {kiosk.address}
            </p>
            <span className="status-badge active">Active</span>
          </div>
        </div>
      ))}
  </div>
</div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-link"
            onClick={handleReset}
          >
            Reset Selection
          </button>
          <div className="action-buttons">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={toggle}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={isLoading || !targetKioskId}
            >
              {isLoading ? 'Moving Orders...' : 'Move Orders'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MoveOrderModal;