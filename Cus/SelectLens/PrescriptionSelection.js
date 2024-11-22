import { PrescriptionInput } from './PrescriptionInput';
import Swal from 'sweetalert2';
import { prescriptionHelpConfig } from './sweetalert';
import styles from './styles/SelectLens.module.scss';
import { OrderNowButton } from './OrderNow/order-now-button';

export const PrescriptionSelection = ({
  data,
  handleChangeValue,
  handleAddToCart,
  handleOrderNow,
  setStep,
  userInfo
}) => {
  return (
    <div className={styles.prescriptionSelection}>
      <button
        onClick={() => setStep(1)}
        className={styles.backButton}
      >
        &lt; Back to Lens Selection
      </button>

      <h2>Enter your prescription</h2>
      <button
        onClick={() => Swal.fire(prescriptionHelpConfig)}
        className={styles.helpButton}
      >
        Learn how to read your prescription
      </button>

      <div className={styles.prescriptionForm}>
        <div className={styles.labels}>
          <div></div>
          <div>SPH</div>
          <div>CYL</div>
          <div>AXIS</div>
        </div>

        {/* Right Eye (OD) */}
        <PrescriptionInput
          label="OD"
          subLabel="right eye"
          handleChangeValue={handleChangeValue}
          fields={["sphereOD", "cylinderOD", "axisOD"]}
          data={data}
        />

        {/* Left Eye (OS) */}
        <PrescriptionInput
          label="OS"
          subLabel="left eye"
          handleChangeValue={handleChangeValue}
          fields={["sphereOS", "cylinderOS", "axisOS"]}
          data={data}
        />

        {/* ADD Values */}
        <PrescriptionInput
          label="ADD"
          subLabel="left/right eye"
          handleChangeValue={handleChangeValue}
          fields={["addOD", "addOS"]}
          data={data}
        />

        {/* PD Value */}
        <PrescriptionInput
          label="PD"
          subLabel="pupillary distance"
          handleChangeValue={handleChangeValue}
          fields={["pd"]}
          data={data}
        />
      </div>

      <div className={styles.actions}>
        <button
          onClick={handleAddToCart}
          className={`${styles.actionButton} ${styles.primary}`}
        >
          {userInfo ? 'Add to Cart' : 'Log in to Add to Cart'}
        </button>
        {userInfo && <OrderNowButton onClick={handleOrderNow} />}
      </div>
    </div>
  );
};
