// LensInformation.tsx
import React from 'react';
import { 
  FaGlasses, 
  FaEye, 
  FaRegEye,
  FaCheck,
  FaTags,
  FaDollarSign,
  FaCube,
  FaPrescription,
  FaShieldAlt
} from 'react-icons/fa';

interface LensInfo {
  name?: string;
  price?: number;
  type?: string;
  material?: string;
  prescription?: string;
  features?: string[];
  coating?: string;
}

interface LensInformationProps {
  leftLens?: LensInfo;
  rightLens?: LensInfo;
}

const LensInformation: React.FC<LensInformationProps> = ({ leftLens, rightLens }) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderLensCard = (lens: LensInfo | undefined, side: 'Left' | 'Right') => {
    return (
      <div className={`lens-card ${!lens ? 'empty' : ''}`}>
        <div className="lens-header">
          <div className="lens-icon">
            {side === 'Left' ? <FaRegEye /> : <FaEye />}
          </div>
          <div className="lens-title">
            <h4>{side} Eye Lens</h4>
            {lens && <span className="lens-model">{lens.name}</span>}
          </div>
        </div>

        {lens ? (
          <div className="lens-content">
            <div className="lens-price">
              <FaDollarSign className="icon" />
              <span>{formatCurrency(lens.price)}</span>
            </div>

            <div className="lens-specs">
              {lens.type && (
                <div className="spec-item">
                  <FaGlasses className="icon" />
                  <div className="spec-detail">
                    <label>Type</label>
                    <span>{lens.type}</span>
                  </div>
                </div>
              )}

              {lens.material && (
                <div className="spec-item">
                  <FaCube className="icon" />
                  <div className="spec-detail">
                    <label>Material</label>
                    <span>{lens.material}</span>
                  </div>
                </div>
              )}

              {lens.prescription && (
                <div className="spec-item">
                  <FaPrescription className="icon" />
                  <div className="spec-detail">
                    <label>Prescription</label>
                    <span>{lens.prescription}</span>
                  </div>
                </div>
              )}

              {lens.coating && (
                <div className="spec-item">
                  <FaShieldAlt className="icon" />
                  <div className="spec-detail">
                    <label>Coating</label>
                    <span>{lens.coating}</span>
                  </div>
                </div>
              )}
            </div>

            {lens.features && lens.features.length > 0 && (
              <div className="lens-features">
                <div className="features-title">
                  <FaTags />
                  <span>Features</span>
                </div>
                <div className="features-list">
                  {lens.features.map((feature, index) => (
                    <div key={index} className="feature-tag">
                      <FaCheck className="check-icon" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <FaGlasses className="empty-icon" />
            <p>No lens information available</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="lens-information">
      <div className="info-header">
        <div className="header-icon">
          <FaGlasses />
        </div>
        <div className="header-content">
          <h3>Lens Specifications</h3>
          <p>Detailed information about prescribed lenses</p>
        </div>
      </div>

      <div className="lens-cards">
        {renderLensCard(leftLens, 'Left')}
        {renderLensCard(rightLens, 'Right')}
      </div>
    </div>
  );
};

export default LensInformation;