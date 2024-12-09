import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CalendarDays, MapPin, Eye, Clock, 
  AlertTriangle, ChevronRight, PlusCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { RefractionRecord, MeasurementRecord } from '../types/lens.types';
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
    <motion.div 
      className={styles.measurementHistory}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={styles.header}>
        <motion.button 
          className={styles.backButton}
          onClick={onBack}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Back to Profile</span>
        </motion.button>
        
        <div className={styles.headerContent}>
          <h2>Measurement History</h2>
          <p>Review previous measurements or enter new values for your prescription</p>
        </div>
      </div>

      <div className={styles.mainContent}>
        <motion.div 
          className={styles.recordsList}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.recordsHeader}>
            <h3>Previous Measurements</h3>
            <motion.button 
              className={styles.newMeasurementButton}
              onClick={() => onSelect([])}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusCircle size={20} />
              <span>New Measurement</span>
            </motion.button>
          </div>

          <div className={styles.recordsGrid}>
            {refractionRecords.map((record) => (
              <motion.div
                key={record.id}
                className={`${styles.recordCard} ${
                  selectedRecord?.id === record.id ? styles.active : ''
                }`}
                onClick={() => handleRecordSelect(record)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={styles.recordInfo}>
                  <div className={styles.recordDate}>
                    <CalendarDays size={20} />
                    <span>{format(new Date(record.startTime), 'dd MMM yyyy')}</span>
                  </div>
                  <div className={styles.recordTime}>
                    <Clock size={16} />
                    <span>{format(new Date(record.startTime), 'HH:mm')}</span>
                  </div>
                </div>

                <div className={styles.recordLocation}>
                  <MapPin size={16} />
                  <span>{record.kiosks[0]?.name}</span>
                </div>

                {selectedRecord?.id === record.id && (
                  <motion.div 
                    className={styles.selectedBadge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span>Selected</span>
                    <ChevronRight size={16} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedRecord && measurements.length > 0 ? (
            <motion.div 
              className={styles.measurementDetails}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.detailsHeader}>
                <h3>Measurement Results</h3>
                <span className={styles.measurementDate}>
                  {format(new Date(selectedRecord.startTime), 'dd MMM yyyy, HH:mm')}
                </span>
              </div>
              
              <div className={styles.eyeGrid}>
                {/* Right Eye Card */}
                <motion.div 
                  className={styles.eyeCard}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className={styles.eyeHeader}>
                    <Eye size={24} />
                    <div>
                      <h4>Right Eye (OD)</h4>
                      <p>Measurement Values</p>
                    </div>
                  </div>

                  <div className={styles.measurementGrid}>
                    {measurements
                      .filter(m => m.eyeSide === 1)
                      .map(measurement => (
                        <div key={measurement.id} className={styles.measurementCard}>
                          <div className={styles.measurementValue}>
                            <span className={styles.label}>SPH</span>
                            <strong>{formatMeasurementValue(measurement.spherical)}</strong>
                          </div>
                          <div className={styles.measurementValue}>
                            <span className={styles.label}>CYL</span>
                            <strong>{formatMeasurementValue(measurement.cylindrical)}</strong>
                          </div>
                          <div className={styles.measurementValue}>
                            <span className={styles.label}>AXIS</span>
                            <strong>{measurement.axis}°</strong>
                          </div>
                          <div className={styles.measurementValue}>
                            <span className={styles.label}>PD</span>
                            <strong>{measurement.pupilDistance}mm</strong>
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>

                {/* Left Eye Card */}
                <motion.div 
                  className={styles.eyeCard}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className={styles.eyeHeader}>
                    <Eye size={24} />
                    <div>
                      <h4>Left Eye (OS)</h4>
                      <p>Measurement Values</p>
                    </div>
                  </div>

                  <div className={styles.measurementGrid}>
                    {measurements
                      .filter(m => m.eyeSide === 0)
                      .map(measurement => (
                        <div key={measurement.id} className={styles.measurementCard}>
                          <div className={styles.measurementValue}>
                            <span className={styles.label}>SPH</span>
                            <strong>{formatMeasurementValue(measurement.spherical)}</strong>
                          </div>
                          <div className={styles.measurementValue}>
                            <span className={styles.label}>CYL</span>
                            <strong>{formatMeasurementValue(measurement.cylindrical)}</strong>
                          </div>
                          <div className={styles.measurementValue}>
                            <span className={styles.label}>AXIS</span>
                            <strong>{measurement.axis}°</strong>
                          </div>
                          <div className={styles.measurementValue}>
                            <span className={styles.label}>PD</span>
                            <strong>{measurement.pupilDistance}mm</strong>
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              </div>

              <motion.div 
                className={styles.actions}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button 
                  className={styles.secondaryButton}
                  onClick={() => onSelect([])}
                >
                  Enter New Values
                </button>
                <button 
                  className={styles.primaryButton}
                  onClick={() => onSelect(measurements)}
                >
                  Use This Measurement
                </button>
              </motion.div>
            </motion.div>
          ) : loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <span>Loading measurements...</span>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <AlertTriangle size={24} />
              <p>{error}</p>
              <button onClick={() => loadRefractionRecords()}>Try Again</button>
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MeasurementHistory;