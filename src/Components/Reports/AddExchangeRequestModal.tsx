import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  FormGroup,
  FormFeedback,
} from "reactstrap";
import { AlertTriangle } from "react-feather";
import axios from "axios";
import { useKioskService } from "../../../Api/kioskService";
import { useExchangeEyeGlassService } from "../../../Api/exchangeEyeGlassService";
import { toast } from "react-toastify";
import "./ExchangeRequestModalStyles.scss";

interface District {
  code: string;
  name: string;
}

interface Ward {
  code: string;
  name: string;
}

interface Kiosk {
  id: number;
  name: string;
  status: boolean;
  address: string;
}

interface AddExchangeRequestModalProps {
  isOpen: boolean;
  toggle: () => void;
  reportId: number | null;
  productGlassId: number | null;
}

type InputType =
  | "text"
  | "textarea"
  | "number"
  | "password"
  | "email"
  | "select"
  | "file"
  | "radio"
  | "checkbox"
  | "hidden";

  const AddExchangeRequestModal: React.FC<AddExchangeRequestModalProps> = ({
    isOpen,
    toggle,
    reportId,
    productGlassId,
  }) => {
    const initialFormData = {
      productGlassID: productGlassId,
      district: "",
      ward: "",
      streetAddress: "",
      kioskID: null,
      reason: "",
      quantity: 1,
    };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [isLoadingKiosks, setIsLoadingKiosks] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"kiosk" | "address">(
    "kiosk"
  );


  const { createExchangeEyeGlass } = useExchangeEyeGlassService();
  const HCMC_CODE = "79";

  const { fetchAllKiosk } = useKioskService();

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsSubmitting(false);
    setDeliveryType("kiosk");
  };

  // Load kiosks when modal opens or delivery type changes
  useEffect(() => {
    const loadKiosks = async () => {
      if (isOpen && deliveryType === "kiosk") {
        setIsLoadingKiosks(true);
        try {
          const response = await fetchAllKiosk();
          const activeKiosks = response.filter((kiosk: Kiosk) => kiosk.status);
          setKiosks(activeKiosks);
        } catch (error) {
          console.error("Error loading kiosks:", error);
        } finally {
          setIsLoadingKiosks(false);
        }
      }
    };
    loadKiosks();
  }, [isOpen, deliveryType]);

  // Load districts
  useEffect(() => {
    const fetchDistricts = async () => {
      if (isOpen && deliveryType === "address") {
        setIsLoadingDistricts(true);
        try {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/p/${HCMC_CODE}?depth=2`
          );
          if (response.data && response.data.districts) {
            setDistricts(response.data.districts);
          }
        } catch (error) {
          console.error("Failed to fetch districts:", error);
        } finally {
          setIsLoadingDistricts(false);
        }
      }
    };
    fetchDistricts();
  }, [isOpen, deliveryType]);

  // Load wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (formData.district && deliveryType === "address") {
        setIsLoadingWards(true);
        try {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/d/${formData.district}?depth=2`
          );
          if (response.data && response.data.wards) {
            setWards(response.data.wards);
          }
        } catch (error) {
          console.error("Failed to fetch wards:", error);
        } finally {
          setIsLoadingWards(false);
        }
      } else {
        setWards([]);
      }
    };
    fetchWards();
  }, [formData.district, deliveryType]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    } else {
      setFormData(prev => ({
        ...prev,
        productGlassID: productGlassId
      }));
    }
  }, [isOpen, productGlassId]);

  const handleDeliveryTypeChange = (type: "kiosk" | "address") => {
    setDeliveryType(type);
    setFormData((prev) => ({
      ...prev,
      district: "",
      ward: "",
      streetAddress: "",
      kioskID: null,
    }));
    setErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (
      (name === "productGlassID" || name === "kioskID") &&
      value.startsWith("-")
    ) {
      return;
    }

    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [name]:
          name === "quantity" || name === "kioskID" || name === "productGlassID"
            ? value
              ? Math.max(0, parseInt(value))
              : null
            : value,
      };

      if (name === "district") {
        newData.ward = "";
      }

      return newData;
    });

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.productGlassID === null || formData.productGlassID < 0)
      newErrors.productGlassID = "Product Glass ID must be a positive number";

    if (deliveryType === "address") {
      if (!formData.district) newErrors.district = "District is required";
      if (!formData.ward) newErrors.ward = "Ward is required";
      if (!formData.streetAddress)
        newErrors.streetAddress = "Street address is required";
    } else {
      if (!formData.kioskID) newErrors.kioskID = "Please select a kiosk";
    }

    if (!formData.reason) newErrors.reason = "Reason is required";
    if (formData.quantity <= 0)
      newErrors.quantity = "Quantity must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        let receiverAddress = "";
        if (deliveryType === "address") {
          const selectedDistrict = districts.find(
            d => d.code.toString() === formData.district.toString()
          );
          const selectedWard = wards.find(
            w => w.code.toString() === formData.ward.toString()
          );
          
          const addressParts = [
            formData.streetAddress,
            selectedWard?.name,
            selectedDistrict?.name,
            "TP. Hồ Chí Minh"
          ].filter(Boolean);
          
          receiverAddress = addressParts.join(", ");
        }

        const exchangeData = {
          productGlassID: formData.productGlassID,
          receiverAddress: deliveryType === "address" ? receiverAddress : "",
          kioskID: deliveryType === "kiosk" ? formData.kioskID : null,
          reportID: reportId,
          reason: formData.reason,
          quantity: formData.quantity
        };

        const response = await createExchangeEyeGlass(exchangeData);
        
        if (response) {
          toast.success("Exchange request created successfully");
          toggle();
          resetForm();
        } else {
          toast.error("Failed to create exchange request");
        }
      } catch (error) {
        console.error("Error creating exchange request:", error);
        toast.error(error.response?.data?.[0] || "Failed to create exchange request");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderFormGroup = (
    label: string,
    name: string,
    inputType: InputType,
    placeholder: string,
    disabled: boolean = false,
    min?: string,
    options?: { value: string; label: string }[]
  ) => (
    <FormGroup>
      <Label for={name} className="form-label">
        {label}{" "}
        {inputType !== "radio" && <span className="text-danger">*</span>}
      </Label>
      <div className="input-wrapper">
        {inputType === "select" ? (
          <div className="select-container">
            <Input
              type={inputType}
              name={name}
              id={name}
              value={formData[name as keyof typeof formData] ?? ""}
              onChange={handleChange}
              disabled={disabled}
              invalid={!!errors[name]}
              className="custom-select"
            >
              <option value="">
                {(name === "district" && isLoadingDistricts) ||
                (name === "ward" && isLoadingWards)
                  ? "Loading..."
                  : placeholder}
              </option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Input>
            {((name === "district" && isLoadingDistricts) ||
              (name === "ward" && isLoadingWards)) && (
              <div className="select-loading-indicator">
                <div className="spinner-border spinner-border-sm text-primary" />
              </div>
            )}
          </div>
        ) : (
          <Input
            type={inputType}
            name={name}
            id={name}
            value={formData[name as keyof typeof formData] ?? ""}
            onChange={handleChange}
            disabled={disabled}
            invalid={!!errors[name]}
            placeholder={placeholder}
            min={min}
            className={
              inputType === "textarea" ? "custom-textarea" : "custom-input"
            }
            rows={inputType === "textarea" ? 3 : undefined}
          />
        )}
        {errors[name] && (
          <FormFeedback className="error-feedback">
            <AlertTriangle size={14} className="me-1" /> {errors[name]}
          </FormFeedback>
        )}
      </div>
    </FormGroup>
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="exchange-request-modal" size="lg">
      <ModalHeader toggle={toggle} className="bg-light">
        <h5 className="modal-title">Create Exchange Request</h5>
      </ModalHeader>

      <ModalBody>
        {/* Product Glass ID field */}
        <FormGroup>
          <Label className="form-label">
            Product Glass ID <span className="text-danger">*</span>
          </Label>
          <Input
            type="number"
            value={formData.productGlassID || ""}
            disabled
            className="custom-input"
          />
        </FormGroup>

        {/* Delivery Type Selection */}
        <FormGroup className="delivery-type-selection mb-4">
          <Label className="d-block mb-2">
            Delivery Option <span className="text-danger">*</span>
          </Label>
          <div className="delivery-options">
            <div className="form-check form-check-inline">
              <Input
                type="radio"
                id="kioskDelivery"
                name="deliveryType"
                checked={deliveryType === "kiosk"}
                onChange={() => handleDeliveryTypeChange("kiosk")}
                className="form-check-input"
              />
              <Label className="form-check-label" for="kioskDelivery">
                Deliver to Kiosk
              </Label>
            </div>
            <div className="form-check form-check-inline">
              <Input
                type="radio"
                id="addressDelivery"
                name="deliveryType"
                checked={deliveryType === "address"}
                onChange={() => handleDeliveryTypeChange("address")}
                className="form-check-input"
              />
              <Label className="form-check-label" for="addressDelivery">
                Deliver to Address
              </Label>
            </div>
          </div>
        </FormGroup>

        {/* Kiosk Selection Section */}
        {deliveryType === "kiosk" && (
          <div className="kiosk-section">
            <FormGroup>
              <Label for="kioskID" className="form-label">
                Select Kiosk <span className="text-danger">*</span>
              </Label>
              <div className="input-wrapper">
                <div className="select-container">
                  <Input
                    type="select"
                    name="kioskID"
                    id="kioskID"
                    value={formData.kioskID || ""}
                    onChange={handleChange}
                    disabled={isLoadingKiosks}
                    invalid={!!errors.kioskID}
                    className="custom-select"
                  >
                    <option value="">
                      {isLoadingKiosks ? "Loading kiosks..." : "Select a kiosk"}
                    </option>
                    {kiosks.map((kiosk) => (
                      <option key={kiosk.id} value={kiosk.id}>
                        {kiosk.name} - {kiosk.address}
                      </option>
                    ))}
                  </Input>
                  {isLoadingKiosks && (
                    <div className="select-loading-indicator">
                      <div className="spinner-border spinner-border-sm text-primary" />
                    </div>
                  )}
                </div>
                {errors.kioskID && (
                  <FormFeedback className="error-feedback">
                    <AlertTriangle size={14} className="me-1" /> {errors.kioskID}
                  </FormFeedback>
                )}
              </div>
            </FormGroup>
          </div>
        )}

        {/* Address Selection Section */}
        {deliveryType === "address" && (
          <div className="address-section">
            {/* District Selection */}
            <FormGroup>
              <Label for="district" className="form-label">
                District <span className="text-danger">*</span>
              </Label>
              <div className="input-wrapper">
                <div className="select-container">
                  <Input
                    type="select"
                    name="district"
                    id="district"
                    value={formData.district}
                    onChange={handleChange}
                    invalid={!!errors.district}
                    disabled={isLoadingDistricts}
                    className="custom-select"
                  >
                    <option value="">
                      {isLoadingDistricts ? "Loading districts..." : "Select District"}
                    </option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </Input>
                  {isLoadingDistricts && (
                    <div className="select-loading-indicator">
                      <div className="spinner-border spinner-border-sm text-primary" />
                    </div>
                  )}
                </div>
                {errors.district && (
                  <FormFeedback className="error-feedback">
                    <AlertTriangle size={14} className="me-1" /> {errors.district}
                  </FormFeedback>
                )}
              </div>
            </FormGroup>

            {/* Ward Selection */}
            <FormGroup>
              <Label for="ward" className="form-label">
                Ward <span className="text-danger">*</span>
              </Label>
              <div className="input-wrapper">
                <div className="select-container">
                  <Input
                    type="select"
                    name="ward"
                    id="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    invalid={!!errors.ward}
                    disabled={!formData.district || isLoadingWards}
                    className="custom-select"
                  >
                    <option value="">
                      {isLoadingWards ? "Loading wards..." : "Select Ward"}
                    </option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </Input>
                  {isLoadingWards && (
                    <div className="select-loading-indicator">
                      <div className="spinner-border spinner-border-sm text-primary" />
                    </div>
                  )}
                </div>
                {errors.ward && (
                  <FormFeedback className="error-feedback">
                    <AlertTriangle size={14} className="me-1" /> {errors.ward}
                  </FormFeedback>
                )}
              </div>
            </FormGroup>

            {/* Street Address */}
            <FormGroup>
              <Label for="streetAddress" className="form-label">
                Street Address <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                name="streetAddress"
                id="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                invalid={!!errors.streetAddress}
                placeholder="Enter street address"
                className="custom-input"
              />
              {errors.streetAddress && (
                <FormFeedback className="error-feedback">
                  <AlertTriangle size={14} className="me-1" /> {errors.streetAddress}
                </FormFeedback>
              )}
            </FormGroup>
          </div>
        )}

        {/* Reason */}
        <FormGroup>
          <Label for="reason" className="form-label">
            Reason <span className="text-danger">*</span>
          </Label>
          <Input
            type="textarea"
            name="reason"
            id="reason"
            value={formData.reason}
            onChange={handleChange}
            invalid={!!errors.reason}
            placeholder="Please provide reason for exchange"
            className="custom-textarea"
            rows={3}
          />
          {errors.reason && (
            <FormFeedback className="error-feedback">
              <AlertTriangle size={14} className="me-1" /> {errors.reason}
            </FormFeedback>
          )}
        </FormGroup>

        {/* Quantity */}
        <FormGroup>
          <Label for="quantity" className="form-label">
            Quantity <span className="text-danger">*</span>
          </Label>
          <Input
            type="number"
            name="quantity"
            id="quantity"
            value={formData.quantity}
            onChange={handleChange}
            invalid={!!errors.quantity}
            min="1"
            className="custom-input"
          />
          {errors.quantity && (
            <FormFeedback className="error-feedback">
              <AlertTriangle size={14} className="me-1" /> {errors.quantity}
            </FormFeedback>
          )}
        </FormGroup>
      </ModalBody>

      <ModalFooter className="bg-light">
        <Button
          color="secondary"
          onClick={() => {
            toggle();
            resetForm();
          }}
          disabled={isSubmitting}
          className="me-2"
        >
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddExchangeRequestModal;
