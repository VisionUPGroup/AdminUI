// components/LensSelection/MeasurementHistory.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CalendarDays, MapPin, Eye, Clock, AlertTriangle } from 'lucide-react';
import { useRefractionRecordsService } from '../../../../../Api/refractionRecordService';
import { useMeasurementService } from '../../../../../Api/measurementService';
import { RefractionRecord, MeasurementRecord } from '../types/lens.types';
import { format } from 'date-fns';
import styles from './MeasurementHistory.module.scss';

interface MeasurementHistoryProps {
  profileId: number;
  onSelect: (measurements: MeasurementRecord[]) => void;
  onBack: () => void;
  refractionRecordService: any;
  measurementService: any;
}

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({
    profileId,
    onSelect,
    onBack,
    refractionRecordService,
    measurementService
  }) => {
  const [refractionRecords, setRefractionRecords] = useState<RefractionRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RefractionRecord | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRefractionRecords();
  }, [profileId]);

  const loadRefractionRecords = async () => {
    try {
      setLoading(true);
      const response = await refractionRecordService(profileId);
      setRefractionRecords(response.data);
    } catch (error) {
      setError('Failed to load refraction records');
    } finally {
      setLoading(false);
    }
  };

  const loadMeasurements = async (recordId: number) => {
    try {
      setLoading(true);
      const measurements = await measurementService(recordId);
      setMeasurements(measurements);
    } catch (error) {
      setError('Failed to load measurements');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordSelect = async (record: RefractionRecord) => {
    setSelectedRecord(record);
    await loadMeasurements(record.id);
  };

  const formatMeasurementValue = (value: number) => {
    return value.toFixed(2);
  };

  return (
    <div className={styles.measurementHistory}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Profile Selection</span>
        </button>
        <h2>Measurement History</h2>
        <p>Select a previous measurement record or enter new values</p>
      </div>

      <div className={styles.content}>
        <div className={styles.recordsList}>
          {refractionRecords.map((record) => (
            <div
              key={record.id}
              className={`${styles.recordCard} ${
                selectedRecord?.id === record.id ? styles.active : ''
              }`}
              onClick={() => handleRecordSelect(record)}
            >
              <div className={styles.recordHeader}>
                <CalendarDays size={20} />
                <span>{format(new Date(record.startTime), 'dd MMM yyyy, HH:mm')}</span>
              </div>

              <div className={styles.recordLocation}>
                <MapPin size={16} />
                <span>{record.kiosks[0]?.name}</span>
              </div>

              {selectedRecord?.id === record.id && (
                <div className={styles.selectedIndicator}>
                  Selected
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedRecord && measurements.length > 0 && (
          <div className={styles.measurementDetails}>
            <h3>Measurement Results</h3>
            
            <div className={styles.eyeGrid}>
              {/* Right Eye */}
              <div className={styles.eyeCard}>
                <div className={styles.eyeHeader}>
                  <Eye size={20} />
                  <span>Right Eye (OD)</span>
                </div>
                <div className={styles.measurementGrid}>
                  {measurements
                    .filter(m => m.eyeSide === 1)
                    .map(measurement => (
                      <div key={measurement.id} className={styles.measurements}>
                        <div className={styles.measurement}>
                          <span>SPH</span>
                          <strong>{formatMeasurementValue(measurement.spherical)}</strong>
                        </div>
                        <div className={styles.measurement}>
                          <span>CYL</span>
                          <strong>{formatMeasurementValue(measurement.cylindrical)}</strong>
                        </div>
                        <div className={styles.measurement}>
                          <span>AXIS</span>
                          <strong>{measurement.axis}°</strong>
                        </div>
                        <div className={styles.measurement}>
                          <span>PD</span>
                          <strong>{measurement.pupilDistance}mm</strong>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Left Eye */}
              <div className={styles.eyeCard}>
                <div className={styles.eyeHeader}>
                  <Eye size={20} />
                  <span>Left Eye (OS)</span>
                </div>
                <div className={styles.measurementGrid}>
                  {measurements
                    .filter(m => m.eyeSide === 0)
                    .map(measurement => (
                      <div key={measurement.id} className={styles.measurements}>
                        <div className={styles.measurement}>
                          <span>SPH</span>
                          <strong>{formatMeasurementValue(measurement.spherical)}</strong>
                        </div>
                        <div className={styles.measurement}>
                          <span>CYL</span>
                          <strong>{formatMeasurementValue(measurement.cylindrical)}</strong>
                        </div>
                        <div className={styles.measurement}>
                          <span>AXIS</span>
                          <strong>{measurement.axis}°</strong>
                        </div>
                        <div className={styles.measurement}>
                          <span>PD</span>
                          <strong>{measurement.pupilDistance}mm</strong>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                className={styles.selectButton}
                onClick={() => onSelect(measurements)}
              >
                Use This Measurement
              </button>
              <button 
                className={styles.newButton}
                onClick={() => onSelect([])}
              >
                Enter New Values
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementHistory;