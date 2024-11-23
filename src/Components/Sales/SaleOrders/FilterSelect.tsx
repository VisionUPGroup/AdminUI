import React, { useEffect, useState } from 'react';
import { useKioskService } from '../../../../Api/kioskService';
import { FaStore, FaTimesCircle, FaFilter } from 'react-icons/fa';
import "./FilterStyle.scss"

interface Kiosk {
  id: number;
  name: string;
  status: boolean;
}

interface FilterSelectsProps {
  onKioskSelect: (kioskId: string) => void;
  selectedKiosk: string;
  onReset: () => void;
}

const FilterSelects: React.FC<FilterSelectsProps> = ({ 
  onKioskSelect, 
  selectedKiosk,
  onReset 
}) => {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [isLoadingKiosks, setIsLoadingKiosks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fetchAllKiosk } = useKioskService();

  useEffect(() => {
    loadKiosks();
  }, []);

  const loadKiosks = async () => {
    setIsLoadingKiosks(true);
    setError(null);
    try {
      const response = await fetchAllKiosk();
      // Lọc chỉ lấy các kiosk có status là true
      const activeKiosks = response.filter((kiosk: Kiosk) => kiosk.status === true);
      setKiosks(activeKiosks || []);
    } catch (error) {
      console.error('Error loading kiosks:', error);
      setError('Failed to load kiosks');
    } finally {
      setIsLoadingKiosks(false);
    }
  };

  return (
    <div className="filter-selects">
      <div className="select-group">
        <div className="select-wrapper">
          <div className="select-container">
            <FaStore className="select-icon" />
            <select
              className="filter-select"
              onChange={(e) => onKioskSelect(e.target.value)}
              value={selectedKiosk}
              disabled={isLoadingKiosks}
            >
              <option value="">All Kiosks</option>
              {kiosks.map((kiosk) => (
                <option key={kiosk.id} value={kiosk.id}>
                  {kiosk.name}
                </option>
              ))}
            </select>
            {isLoadingKiosks && (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            )}
          </div>

          {selectedKiosk && (
            <button 
              className="reset-filter-button"
              onClick={onReset}
            >
              <FaTimesCircle className="reset-icon" />
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default FilterSelects;