// components/LensSelection/ProfileSelector.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserCircle2, MapPin, Calendar } from 'lucide-react';
import { useProfileService } from '../../../../../Api/profileService';
import { Profile } from '../types/lens.types';
import styles from './ProfileSelector.module.scss';
import { format } from 'date-fns';

interface ProfileSelectorProps {
  accountId: number;
  onSelect: (profileId: number) => void;
  onBack: () => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  accountId,
  onSelect,
  onBack
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchProfilesByAccountId } = useProfileService();

  useEffect(() => {
    loadProfiles();
  }, [accountId]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetchProfilesByAccountId(accountId, 1, 10, '');
      setProfiles(response.items);
    } catch (error) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.profileSelector}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Frame Selection</span>
        </button>
        <h2>Select Profile for Lens Prescription</h2>
        <p>Choose a profile to view measurement history</p>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading profiles...</span>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <span>{error}</span>
          <button onClick={loadProfiles}>Retry</button>
        </div>
      ) : (
        <div className={styles.profileGrid}>
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={styles.profileCard}
              onClick={() => onSelect(profile.id)}
            >
              <div className={styles.profileImage}>
                {profile.urlImage ? (
                  <img src={profile.urlImage} alt={profile.fullName} />
                ) : (
                  <UserCircle2 size={48} />
                )}
              </div>
              
              <div className={styles.profileInfo}>
                <h3>{profile.fullName}</h3>
                
                <div className={styles.details}>
                  <div className={styles.detail}>
                    <MapPin size={16} />
                    <span>{profile.address}</span>
                  </div>
                  
                  <div className={styles.detail}>
                    <Calendar size={16} />
                    <span>{format(new Date(profile.birthday), 'dd MMM yyyy')}</span>
                  </div>
                </div>

                <div className={styles.records}>
                  <span>
                    {profile.refractionRecords.length} Measurement Records
                  </span>
                </div>
              </div>

              <div className={styles.selectButton}>
                Select Profile
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;