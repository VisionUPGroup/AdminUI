import React from 'react';
import { CurrencyContext } from "../../../../../helpers/Currency/CurrencyContext";
import Swal from 'sweetalert2';
import { cartService } from '../../../../../Api/cartService';
import { productGlassesService } from '../../../../../Api/productGlassesService';
import styles from "./cart-page.module.scss";

const CartItem = ({ item, onDelete, isSelected, onSelect }) => {
  const { state: { symbol } } = React.useContext(CurrencyContext);
  const { deleteCart } = cartService();
  const { fetchProductGlassesById } = productGlassesService();

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to remove this item from the cart?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteCart(item.productGlassID);
        if (response && response.deleted) {
          Swal.fire(
            'Deleted!',
            'Your item has been removed from the cart.',
            'success'
          );
          onDelete(item.productGlassID);
        } else {
          Swal.fire(
            'Error!',
            'There was an error removing the item from the cart.',
            'error'
          );
        }
      } catch (error) {
        console.error('Error caught in handleDelete:', error);
        Swal.fire(
          'Error!',
          'There was an error removing the item from the cart.',
          'error'
        );
      }
    }
  };

  const formatPrescriptionValue = (value) => {
    if (value === 0) return 'N/A';
    return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  };

  const handleViewOpia = async () => {
    try {
      const productData = await fetchProductGlassesById(item.productGlassID);
      
      const generateEyeDetails = (isRightEye) => {
        const eyeType = isRightEye ? 'Right Eye (OD)' : 'Left Eye (OS)';
        const sphere = isRightEye ? productData.sphereOD : productData.sphereOS;
        const cylinder = isRightEye ? productData.cylinderOD : productData.cylinderOS;
        const axis = isRightEye ? productData.axisOD : productData.axisOS;
        const add = isRightEye ? productData.addOD : productData.addOS;
        console.log('Sphere:', sphere, 'Cylinder:', cylinder, 'Axis:', axis, 'Add:', add);

        return `
          <div class="eye-details">
            <div class="prescription-grid">
              <div class="prescription-item">
                <div class="prescription-label">Sphere (SPH)</div>
                <div class="prescription-value ${sphere === 0 ? 'na' : ''}">${formatPrescriptionValue(sphere)}</div>
              </div>
              <div class="prescription-item">
                <div class="prescription-label">Cylinder (CYL)</div>
                <div class="prescription-value ${cylinder === 0 ? 'na' : ''}">${formatPrescriptionValue(cylinder)}</div>
              </div>
              <div class="prescription-item">
                <div class="prescription-label">Axis</div>
                <div class="prescription-value ${axis === 0 ? 'na' : ''}">${axis}°</div>
              </div>
              <div class="prescription-item">
                <div class="prescription-label">Add</div>
                <div class="prescription-value ${add === 0 ? 'na' : ''}">${formatPrescriptionValue(add)}</div>
              </div>
            </div>
          </div>
        `;
      };

      // Sử dụng didOpen của SweetAlert2 để xử lý tabs
      await Swal.fire({
        title: 'Prescription Details',
        html: `
          <style>
            .prescription-container {
              padding: 20px;
              max-width: 600px;
              margin: 0 auto;
            }
            .tabs {
              display: flex;
              border-bottom: 2px solid #e2e8f0;
              margin-bottom: 20px;
            }
            .tab {
              flex: 1;
              padding: 10px 20px;
              cursor: pointer;
              border-bottom: 2px solid transparent;
              margin-bottom: -2px;
              transition: all 0.3s ease;
              text-align: center;
            }
            .tab.active {
              border-bottom-color: #d39d4e;
              color: #d39d4e;
              font-weight: 600;
            }
            .eye-details {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
            }
            .prescription-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            .prescription-item {
              background: white;
              padding: 15px;
              border-radius: 6px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .prescription-label {
              color: #666;
              font-size: 0.9rem;
              margin-bottom: 5px;
            }
            .prescription-value {
              font-size: 1.2rem;
              font-weight: 600;
              color: #2d3748;
            }
            .prescription-value.na {
              color: #a0aec0;
            }
            .pd-section {
              background: #edf2f7;
              padding: 15px;
              border-radius: 6px;
              margin-top: 20px;
              text-align: center;
            }
            .pd-label {
              color: #666;
              font-size: 0.9rem;
              margin-bottom: 5px;
            }
            .pd-value {
              font-size: 1.2rem;
              font-weight: 600;
              color: #2d3748;
            }
            .eye-content {
              display: none;
            }
            .eye-content.active {
              display: block;
            }
            .eye-title {
              font-size: 1.25rem;
              font-weight: 600;
              margin-bottom: 1rem;
              color: #2d3748;
              text-align: center;
            }
          </style>
          <div class="prescription-container">
            <div class="tabs" id="prescriptionTabs">
              <div class="tab active" data-tab="left">Left Eye (OS)</div>
              <div class="tab" data-tab="right">Right Eye (OD)</div>
            </div>
            <div>
              <div class="eye-content active" id="leftEye">
                <div class="eye-title">Left Eye (OS)</div>
                ${generateEyeDetails(false)}
              </div>
              <div class="eye-content" id="rightEye">
                <div class="eye-title">Right Eye (OD)</div>
                ${generateEyeDetails(true)}
              </div>
            </div>
            <div class="pd-section">
              <div class="pd-label">PD (Pupillary Distance)</div>
              <div class="pd-value">${productData.pd === 0 ? 'N/A' : `${productData.pd} mm`}</div>
            </div>
          </div>
        `,
        width: 600,
        showConfirmButton: true,
        confirmButtonText: 'Close',
        confirmButtonColor: '#d39d4e',
        allowOutsideClick: true,
        allowEscapeKey: true,
        didOpen: () => {
          // Thêm event listeners cho tabs sau khi modal được mở
          const tabs = document.querySelectorAll('.tab');
          tabs.forEach(tab => {
            tab.addEventListener('click', () => {
              // Remove active class from all tabs and contents
              tabs.forEach(t => t.classList.remove('active'));
              document.querySelectorAll('.eye-content').forEach(content => content.classList.remove('active'));
              
              // Add active class to clicked tab and corresponding content
              tab.classList.add('active');
              const tabName = tab.getAttribute('data-tab');
              document.getElementById(tabName + 'Eye').classList.add('active');
            });
          });
        }
      });
    } catch (error) {
      console.error('Error fetching product opia data:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Unable to load prescription details at this time.',
        icon: 'error',
        confirmButtonColor: '#d39d4e'
      });
    }
  };

  return (
    <div className={`${styles["cart-item"]} ${isSelected ? styles["cart-item--selected"] : ''}`}>
      <div className={styles["cart-item__checkbox"]}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className={styles["cart-item__checkbox-input"]}
        />
      </div>
      
      <div className={styles["cart-item__image-container"]}>
        <div className={styles["cart-item__image-wrapper"]}>
          <img 
            src={item.eyeGlassImages[0].url} 
            alt={item.eyeGlassName}
            className={styles["cart-item__image"]}
          />
          {item.eyeGlassImages.length > 1 && (
            <div className={styles["cart-item__image-overlay"]}>
              <div className={styles["cart-item__image-count"]}>
                +{item.eyeGlassImages.length - 1}
              </div>
            </div>
          )}
        </div>
        <div className={styles["cart-item__image-brand"]}>
          <span className={styles["cart-item__collection-tag"]}>
            New
          </span>
        </div>
      </div>
      <div className={styles["cart-item__details"]}>
        <div className={styles["cart-item__name-price"]}>
          <h3 className={styles["cart-item__name"]}>{item.eyeGlassName}</h3>
          <span className={styles["cart-item__price"]}>
            {(item.eyeGlassPrice).toLocaleString()} VND
          </span>
        </div>
        <div className={styles["cart-item__lens-details"]}>
          <div className={styles["cart-item__lens-info"]}>
            <p className={styles["cart-item__variant"]}>{item.lensName}</p>
            <span className={styles["cart-item__quantity"]}>x2</span>
          </div>
          <p className={styles["cart-item__prescription"]}>
            +{(item.lensPrice * 2).toLocaleString()} VND
          </p>
        </div>

        <div className={styles["cart-item__options"]}>
          <label className={styles["cart-item__option"]}>
            <input type="checkbox" className={styles["cart-item__option-checkbox"]} />
            <span className={styles["cart-item__option-text"]}>Upgrade to Polarized Lenses</span>
            <span className={styles["cart-item__option-price"]}>
              +{(100000).toLocaleString()} VND
            </span>
          </label>
          <p className={styles["cart-item__option-description"]}>
            Block glare from reflective surfaces in the sun.
          </p>

          <label className={styles["cart-item__option"]}>
            <input type="checkbox" className={styles["cart-item__option-checkbox"]} />
            <span className={styles["cart-item__option-text"]}>Add Anti-Fog Cloth</span>
            <span className={styles["cart-item__option-price"]}>
              +{(50000).toLocaleString()} VND
            </span>
          </label>
          <p className={styles["cart-item__option-description"]}>
            High-tech material to prevent lenses from fogging.
          </p>
        </div>

        <div className={styles["cart-item__actions"]}>
          <button 
            className={`${styles["cart-item__action"]} ${styles["cart-item__action--delete"]}`}
            onClick={handleDelete}
          >
            Delete
          </button>
          <button 
            className={`${styles["cart-item__action"]} ${styles["cart-item__action--view"]}`}
            onClick={handleViewOpia}
          >
            View Opias
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;