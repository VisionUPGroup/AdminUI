import { useState } from 'react';
import Swal from 'sweetalert2';
import { prescriptionHelpConfig } from './sweetalert';
import styles from './styles/SelectLens.module.scss';

export const LensSelection = ({
  lensTypes,
  selectedLens,
  handleLensSelect,
  router,
  data
}) => {
  console.log('data', data);
  const [expandedLens, setExpandedLens] = useState(null);

  const handleExpand = (lens) => {
    setExpandedLens(expandedLens?.id === lens.id ? null : lens);
  };

  const openPrescriptionHelp = () => {
    Swal.fire(prescriptionHelpConfig);
  };

  const clickProductDetail = (product) => {
    const titleProps = product.name.split(" ").join(""); 
    router.push(`/product-details/${product.id}`);
  };

  return (
    <div className={styles.lensSelection}>
      <button
        onClick={() => clickProductDetail(data)} 
        className={styles.backButton}
      >
        &lt; Back to {data.name}
      </button>

      <h2>Choose your usage</h2>
      <button
        onClick={openPrescriptionHelp}
        className={styles.helpButton}
      >
        Learn how to read your prescription
      </button>

      <div className={styles.lensTypes}>
        {lensTypes.map((lens) => {
          const [title, description] = lens.title.split('. ');
          return (
            <div key={lens.id} className={styles.lensType}>
              <div
                className={`${styles.lensHeader} ${expandedLens?.id === lens.id ? styles.expanded : ''
                  }`}
                onClick={() => handleExpand(lens)}
              >
                <h3>{title}</h3>
                {description && <p>{description}</p>}
              </div>

              {expandedLens?.id === lens.id && (
                <div className={styles.subOptions}>
                  {lens.subOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`${styles.subOption} ${selectedLens?.id === option.id ? styles.selected : ''
                        }`}
                      onClick={() => handleLensSelect(option)}
                    >
                      <div className={styles.optionContent}>
                        <h4>{option.lensName}</h4>
                        <div>
                          <p>{option.lensDescription}</p>
                          <span className={styles.price}>
                            {option.lensPrice?.toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
