import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, UserCircle2, MapPin, Calendar, Eye, 
  Plus, Search, Filter, ChevronRight, AlertCircle 
} from 'lucide-react';
import { useProfileService } from '../../../../../Api/profileService';
import { Profile, Lens } from '../types/lens.types';
import styles from './ProfileSelector.module.scss';
import { format } from 'date-fns';

interface ProfileSelectorProps {
  accountId: number;
  onSelect: (profileId: number) => void;
  onBack: () => void;
  selectedLenses: {
    left: Lens | null;
    right: Lens | null;
  };
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  accountId,
  onSelect,
  onBack,
  selectedLenses
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchProfilesByAccountId } = useProfileService();

  useEffect(() => {
    loadProfiles();
  }, [accountId]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetchProfilesByAccountId(accountId, 1, 10, searchTerm);
      setProfiles(response.items);
    } catch (error) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const renderSelectedLenses = () => (
    <motion.div 
      className={styles.selectedLenses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.sectionHeader}>
        <h3>Selected Lenses Summary</h3>
        <div className={styles.totalPrice}>
          Total: {calculateTotalPrice().toLocaleString('vi-VN')}₫
        </div>
      </div>
      
      <div className={styles.lensCards}>
        <motion.div 
          className={styles.lensCard}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.lensHeader}>
            <Eye size={20} />
            <span>Right Eye (OD)</span>
          </div>
          {selectedLenses.right ? (
            <div className={styles.lensContent}>
              <div className={styles.lensImageWrapper}>
                <img 
                  src={selectedLenses.right.lensImages[0]?.url} 
                  alt={selectedLenses.right.lensName} 
                />
                <div className={styles.lensOverlay} />
              </div>
              <div className={styles.lensInfo}>
                <h4>{selectedLenses.right.lensName}</h4>
                <span className={styles.price}>
                  {selectedLenses.right.lensPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.emptyLens}>
              <AlertCircle size={24} />
              <span>No lens selected</span>
            </div>
          )}
        </motion.div>

        <motion.div 
          className={styles.lensCard}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={styles.lensHeader}>
            <Eye size={20} />
            <span>Left Eye (OS)</span>
          </div>
          {selectedLenses.left ? (
            <div className={styles.lensContent}>
              <div className={styles.lensImageWrapper}>
                <img 
                  src={selectedLenses.left.lensImages[0]?.url} 
                  alt={selectedLenses.left.lensName} 
                />
                <div className={styles.lensOverlay} />
              </div>
              <div className={styles.lensInfo}>
                <h4>{selectedLenses.left.lensName}</h4>
                <span className={styles.price}>
                  {selectedLenses.left.lensPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.emptyLens}>
              <AlertCircle size={24} />
              <span>No lens selected</span>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );

  const calculateTotalPrice = () => {
    let total = 0;
    if (selectedLenses.right) total += selectedLenses.right.lensPrice;
    if (selectedLenses.left) total += selectedLenses.left.lensPrice;
    return total;
  };

  return (
    <motion.div 
      className={styles.profileSelector}
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
          <span>Back to Lens Selection</span>
        </motion.button>
        <div className={styles.headerContent}>
          <h2>Select Profile</h2>
          <p>Choose a profile or create a new one to proceed with measurements</p>
        </div>
      </div>

      {renderSelectedLenses()}

      <div className={styles.controlPanel}>
        <div className={styles.searchBar}>
          <Search size={20} />
          <input 
            type="text"
            placeholder="Search profiles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <motion.button 
          className={styles.createProfileButton}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={20} />
          <span>Create New Profile</span>
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            className={styles.loading}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.spinner} />
            <span>Loading profiles...</span>
          </motion.div>
        ) : error ? (
          <motion.div 
            className={styles.error}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AlertCircle size={24} />
            <span>{error}</span>
            <button onClick={loadProfiles}>Try Again</button>
          </motion.div>
        ) : (
          <motion.div 
            className={styles.profileGrid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {profiles.map((profile) => (
              <motion.div
                key={profile.id}
                className={styles.profileCard}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={styles.profileHeader}>
                  <div className={styles.profileImage}>
                    {profile.urlImage ? (
                      <img src={profile.urlImage} alt={profile.fullName} />
                    ) : (
                      <UserCircle2 size={48} />
                    )}
                  </div>
                  <div className={styles.mainInfo}>
                    <h3>{profile.fullName}</h3>
                    <span className={styles.measurements}>
                      {profile.refractionRecords.length} Measurements
                    </span>
                  </div>
                </div>

                <div className={styles.profileDetails}>
                  <div className={styles.detail}>
                    <MapPin size={16} />
                    <span>{profile.address}</span>
                  </div>
                  <div className={styles.detail}>
                    <Calendar size={16} />
                    <span>{format(new Date(profile.birthday), 'dd MMM yyyy')}</span>
                  </div>
                </div>

                <motion.button 
                  className={styles.selectButton}
                  onClick={() => onSelect(profile.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Select Profile</span>
                  <ChevronRight size={20} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfileSelector;