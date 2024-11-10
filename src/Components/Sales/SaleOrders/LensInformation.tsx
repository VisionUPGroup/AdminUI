// LensInformation.tsx
import React from "react";
import { FaEye } from "react-icons/fa";

interface LensInformationProps {
  leftLens: {
    name: string | null;
    price: number | null;
  };
  rightLens: {
    name: string | null;
    price: number | null;
  };
}

const LensInformation: React.FC<LensInformationProps> = ({ leftLens, rightLens }) => {
  const formatPrice = (price: number | null) => {
    return price !== null
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price)
      : "N/A";
  };

  return (
    <div className="lens-information">
      <div className="info-header">
        <div className="header-icon">
          <FaEye />
        </div>
        <div className="header-content">
          <h3>Lens Information</h3>
          <p>Details about the lenses used in this order</p>
        </div>
      </div>
      <div className="lens-cards">
        {leftLens.name && (
          <div className="lens-card">
            <div className="lens-header">
              <div className="lens-icon">
                <FaEye />
              </div>
              <div className="lens-title">
                <h4>{leftLens.name}</h4>
                <span className="lens-model">Left Lens</span>
              </div>
            </div>
            <div className="lens-content">
              <div className="lens-price">{formatPrice(leftLens.price)}</div>
            </div>
          </div>
        )}
        {rightLens.name && (
          <div className="lens-card">
            <div className="lens-header">
              <div className="lens-icon">
                <FaEye />
              </div>
              <div className="lens-title">
                <h4>{rightLens.name}</h4>
                <span className="lens-model">Right Lens</span>
              </div>
            </div>
            <div className="lens-content">
              <div className="lens-price">{formatPrice(rightLens.price)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LensInformation;