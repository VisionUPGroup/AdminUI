import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { lensService } from "../../../Api/lensService";
import { LensSelection } from "./common/SelectLens/LensSelection";
import { PrescriptionSelection } from "./common/SelectLens/PrescriptionSelection";
import { NonPrescriptionSelection } from "./common/SelectLens/NonPrescriptionSelection";
import { mappingLensTypesWithLensData } from "./common/SelectLens/lensUtils";
import OrderNowModal from './common/SelectLens/OrderNow/order-now-modal';
import styles from "./common/SelectLens/styles/SelectLens.module.scss";
import { cartService } from "../../../Api/cartService";
import { paymentService } from "../../../Api/paymentService";
import { kioskService } from "../../../Api/kioskService";
import { orderService } from "../../../Api/orderService";

const SelectLenses = () => {
  const router = useRouter();
  const { id } = router.query;
  const [step, setStep] = useState(1);
  const [selectedLens, setSelectedLens] = useState(null);
  const [data, setData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [lensOptions, setLensOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isOrderNowModalOpen, setIsOrderNowModalOpen] = useState(false);
  const [kiosks, setKiosks] = useState([]);
  const [orderNowLoading, setOrderNowLoading] = useState(false);

  const { fetchLensTypes, fetchLenses } = lensService();
  const { createCart } = cartService();
  const { createOrderNow } = orderService();
  const { createPaymentUrl } = paymentService();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("UserInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  useEffect(() => {
    const fetchKiosks = async () => {
      try {
        const kioskData = await kioskService().fetchKiosks();
        setKiosks(kioskData);
      } catch (error) {
        console.error('Error fetching kiosks:', error);
        toast.error('Failed to load kiosk locations');
      }
    };
    fetchKiosks();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!router.isReady) return;

        let productData = router.query.productData
          ? JSON.parse(router.query.productData)
          : null;

        console.log("Product Data :", productData);

        // Dummy data nếu productData là null
        if (!productData) {
          productData = {
            id: 23,
            name: "Dummy Product",
            imageUrl:
              "https://img.ebdcdn.com/product/lens/gray/mt6827.jpg?im=Resize,width=800,height=400,aspect=fill;UnsharpMask,sigma=1.0,gain=1.0&q=85",
            glassTypeText: "Dummy Glass Type",
            price: 0,
          };
        }

        const initialData = {
          ...productData,
          eyeGlassID: productData.id,
          leftLenID: 0,
          rightLenID: 0,
          sphereOD: 0,
          cylinderOD: 0,
          axisOD: 0,
          sphereOS: 0,
          cylinderOS: 0,
          axisOS: 0,
          addOD: 0,
          addOS: 0,
          pd: 0,
        };

        setData(initialData);
        setOriginalData(initialData);

        console.log("Fetching lens data and lens types...");
        const [lensData, lensTypes] = await Promise.all([
          fetchLenses(),
          fetchLensTypes(),
        ]);

        console.log("Lens Data:", lensData);
        console.log("Lens Types:", lensTypes);

        if (lensData?.data?.length > 0 && lensTypes?.length > 0) {
          const mappedLensTypes = mappingLensTypesWithLensData(
            lensData.data,
            lensTypes
          );
          setLensOptions(mappedLensTypes);
          setLoading(false);
        } else {
          setError(new Error("No lens data or lens types available"));
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, id]);

  const handleLensSelect = (lens) => {
    if (!originalData) return;

    const updatedData = { ...originalData, lensData: lens };
    setData(updatedData);
    setSelectedLens(lens);
    setStep(lens.lensTypeID === 4 ? 3 : 2);
  };

  const handleChangeValue = (e, key) => {
    const rawValue = e.target.value;
    let value;

    // Xử lý các trường hợp input
    if (rawValue === '' || rawValue === null) {
      value = 0;
    } else {
      // Parse giá trị thành số và giữ lại 2 số thập phân
      value = parseFloat(parseFloat(rawValue).toFixed(2));

      // Kiểm tra nếu là NaN thì gán về 0
      if (isNaN(value)) {
        value = 0;
      }
    }

    setData(prev => {
      const updatedData = {
        ...prev,
        [key]: value
      };
      console.log('Updated prescription data:', {
        key,
        value,
        updatedData
      });
      return updatedData;
    });
  };

  // Cập nhật PrescriptionSelection để truyền data
  const renderPrescriptionSelection = () => {
    if (step === 2) {
      return (
        <PrescriptionSelection
          data={data}
          handleChangeValue={handleChangeValue}
          handleAddToCart={handleAddToCart}
          handleOrderNow={() => setIsOrderNowModalOpen(true)}
          setStep={setStep}
          userInfo={userInfo}
        />
      );
    }
    return null;
  };

  // Cập nhật hàm validateForm trong SelectLenses
  const validateForm = () => {
    if (!data) return false;

    const {
      sphereOD,
      cylinderOD,
      axisOD,
      sphereOS,
      cylinderOS,
      axisOS,
      pd,
      addOD,
      addOS,
    } = data;

    // Validate axis (phải là số nguyên 0-180)
    const validateAxis = (value) => {
      return Number.isInteger(value) && value >= 0 && value <= 180;
    };

    // Validate sphere/cylinder (-12 to +12)
    const validateSphereOrCylinder = (value) => {
      return value >= -12 && value <= 12;
    };

    // Validate ADD (0 to +4)
    const validateAdd = (value) => {
      return value >= 0 && value <= 4;
    };

    // Validate PD (50-80)
    const validatePD = (value) => {
      return value >= 50 && value <= 80;
    };

    // Kiểm tra tất cả các giá trị
    if (!validateSphereOrCylinder(sphereOD) || !validateSphereOrCylinder(sphereOS)) {
      toast.error('Sphere values must be between -12 and +12');
      return false;
    }

    if (!validateSphereOrCylinder(cylinderOD) || !validateSphereOrCylinder(cylinderOS)) {
      toast.error('Cylinder values must be between -12 and +12');
      return false;
    }

    if (!validateAxis(axisOD) || !validateAxis(axisOS)) {
      toast.error('Axis values must be whole numbers between 0 and 180');
      return false;
    }

    if (!validateAdd(addOD) || !validateAdd(addOS)) {
      toast.error('ADD values must be between 0 and +4');
      return false;
    }

    if (!validatePD(pd)) {
      toast.error('PD value must be between 50 and 80');
      return false;
    }

    return true;
  };

  const handleAddToCart = async () => {
    if (!userInfo) {
      router.push("/page/account/login");
      return;
    }

    if (!data?.lensData) return;

    if (data.lensData.lensTypeID !== 4) {
      const canSubmit = validateForm();
      console.log("Can submit:", canSubmit);
      if (!canSubmit) return;
    }

    try {
      const cartData = {
        eyeGlassID: data.eyeGlassID,
        leftLenID: data.lensData.id,
        rightLenID: data.lensData.id,
        sphereOD: data.sphereOD,
        cylinderOD: data.cylinderOD,
        axisOD: data.axisOD,
        sphereOS: data.sphereOS,
        cylinderOS: data.cylinderOS,
        axisOS: data.axisOS,
        addOD: data.addOD,
        addOS: data.addOS,
        pd: data.pd,
      };

      console.log("Cart Data:", cartData);
      const response = await createCart(cartData);

      if (response?.accountID) {
        toast.success("Added to cart successfully");
        setTimeout(() => router.push("/"), 1000);
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error adding to cart");
    }
  };

  const handleOrderNow = async (orderData) => {
    if (!userInfo) {
      router.push("/page/account/login");
      return;
    }

    try {
      setOrderNowLoading(true);
      console.log("Order Data:", orderData);
      // Create order using orderNow endpoint
      const createdOrder = await createOrderNow(orderData);
      console.log("Created Order:", createdOrder);

      if (createdOrder) {
        // Create payment URL with VNPAY
        const paymentData = {
          amount: createdOrder.total,
          accountID: createdOrder.accountID,
          orderID: createdOrder.id
        };
        console.log('Payment Data:', paymentData);

        const paymentResponse = await createPaymentUrl(paymentData);
        console.log('Payment Response:', paymentResponse);

        if (paymentResponse && paymentResponse.paymentUrl) {
          window.location.href = paymentResponse.paymentUrl;
        } else {
          throw new Error('Failed to create payment URL');
        }
      }
    } catch (error) {
      console.error('Order Now error:', error);
      toast.error('Failed to process your order. Please try again.');
    } finally {
      setOrderNowLoading(false);
      setIsOrderNowModalOpen(false);
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN");
  };

  if (loading) return <div className={styles.loader}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error.message}</div>;
  if (!data) return <div className={styles.noData}>No data available</div>;

  return (
    <div className={styles.container}>
      <ToastContainer />
      <OrderNowModal
        isOpen={isOrderNowModalOpen}
        onClose={() => setIsOrderNowModalOpen(false)}
        onSubmit={handleOrderNow}
        data={data}
        loading={orderNowLoading}
        kiosks={kiosks}
      />

      <div className={styles.content}>
        {/* Product Preview */}
        <div className={styles.productPreview}>
          <img
            src={data?.eyeGlassImages[0]?.url}
            alt={data?.name}
            className={styles.productImage}
          />
          <h3 className={styles.productName}>{data?.name}</h3>
          <p className={styles.productType}>{data?.glassTypeText}</p>
        </div>

        {/* Selection Area */}
        <div className={styles.selectionArea}>
          {step === 1 && (
            <LensSelection
              lensTypes={lensOptions}
              selectedLens={selectedLens}
              handleLensSelect={handleLensSelect}
              router={router}
              data={data}
            />
          )}

          {step === 2 && renderPrescriptionSelection()}

          {step === 3 && (
            <NonPrescriptionSelection
              data={data}
              setStep={setStep}
              handleAddToCart={handleAddToCart}
              handleOrderNow={() => setIsOrderNowModalOpen(true)}
              formatPrice={formatPrice}
            />
          )}
        </div>
      </div>

      {/* Summary Footer */}
      <div className={`${styles.summary} ${isOrderNowModalOpen ? styles.hidden : ''}`}>
        <div className={styles.summaryContent}>
          <div className={styles.summaryInfo}>
            <i className="fas fa-info-circle" />
            <span>
              Includes price of the product and selected lens options.
            </span>
          </div>

          <div className={styles.summaryTotal}>
            <i className="fas fa-shopping-cart" />
            <span>Subtotal:</span>
            <div className={styles.price}>
              <del>
                {formatPrice(
                  data?.price + (data?.lensData?.lensPrice || 0) + 100000
                )}{" "}
                VND
              </del>
              <span>
                {formatPrice(data?.price + (data?.lensData?.lensPrice || 0))}{" "}
                VND
              </span>
            </div>
          </div>
        </div>
      </div>
    
    </div>
  );
};

export default SelectLenses;