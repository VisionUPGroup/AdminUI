// ExchangeRequestModal.tsx
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

interface AddExchangeRequestModalProps {
  isOpen: boolean;
  toggle: () => void;
  reportId: number | null;
  productGlassId: number | null;
}

interface FormData {
  district: string;
  ward: string;
  streetAddress: string;
  kioskID: number | null;
  reason: string;
  quantity: number;
}

interface District {
  code: string;
  name: string;
  wards?: Ward[];
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

interface ApiResponse {
  Id: string;
  Name: string;
  Districts: Array<{
    Id: string;
    Name: string;
    Wards: Array<{
      Id: string;
      Name: string;
    }>;
  }>;
}

const AddExchangeRequestModal: React.FC<AddExchangeRequestModalProps> = ({
  isOpen,
  toggle,
  reportId,
  productGlassId,
}) => {
  // Form Data State
  const [formData, setFormData] = useState<FormData>({
    district: "",
    ward: "",
    streetAddress: "",
    kioskID: null,
    reason: "",
    quantity: 1,
  });

  // UI States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"kiosk" | "address">("kiosk");

  // Data States
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  // Services
  const { fetchAllKiosk } = useKioskService();
  const { createExchangeEyeGlass } = useExchangeEyeGlassService();

  // Constants
  const HCM_ID = "79"; // Ho Chi Minh City ID
  const DISTRICT_DATA_URL = "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json";
  
  // Cache for district and ward data
  const [districtDataCache, setDistrictDataCache] = useState<ApiResponse[]>([]);

  // Effects
  useEffect(() => {
    if (isOpen) {
      if (deliveryType === "kiosk") {
        loadKiosks();
      } else {
        loadDistricts();
      }
    }
  }, [isOpen, deliveryType]);

  useEffect(() => {
    if (formData.district) {
      loadWards(formData.district);
    }
  }, [formData.district]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Functions
  const loadKiosks = async () => {
    try {
      setIsLoading(true);
      const response = await fetchAllKiosk();
      const activeKiosks = response.filter((kiosk: Kiosk) => kiosk.status);
      setKiosks(activeKiosks);
    } catch (error) {
      console.error("Error loading kiosks:", error);
      toast.error("Failed to load kiosks");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDistricts = async () => {
    setIsLoadingDistricts(true);
    try {
      let districtsData;
      
      if (districtDataCache.length > 0) {
        districtsData = districtDataCache;
      } else {
        const response = await axios.get<ApiResponse[]>(DISTRICT_DATA_URL);
        districtsData = response.data;
        setDistrictDataCache(districtsData);
      }

      const hcmData = districtsData.find(city => city.Id === HCM_ID);
      
      if (hcmData && hcmData.Districts) {
        const formattedDistricts = hcmData.Districts.map(district => ({
          code: district.Id,
          name: district.Name,
          wards: district.Wards.map(ward => ({
            code: ward.Id,
            name: ward.Name
          }))
        }));
        
        setDistricts(formattedDistricts);
        console.log("Districts loaded:", formattedDistricts);
      }
    } catch (error) {
      console.error("Error loading districts:", error);
      toast.error("Failed to load districts");
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const loadWards = async (districtId: string) => {
    if (!districtId) return;
    
    setIsLoadingWards(true);
    try {
      const district = districts.find(d => d.code === districtId);
      
      if (district && district.wards) {
        setWards(district.wards);
        console.log("Wards loaded:", district.wards);
      } else {
        setWards([]);
      }
    } catch (error) {
      console.error("Error loading wards:", error);
      toast.error("Failed to load wards");
    } finally {
      setIsLoadingWards(false);
    }
  };

  const resetForm = () => {
    setFormData({
      district: "",
      ward: "",
      streetAddress: "",
      kioskID: null,
      reason: "",
      quantity: 1,
    });
    setErrors({});
    setDeliveryType("kiosk");
    setSelectedDistrict(null);
    setSelectedWard(null);
    setWards([]);
  };

  const handleDeliveryTypeChange = (type: "kiosk" | "address") => {
    setDeliveryType(type);
    setFormData(prev => ({
      ...prev,
      district: "",
      ward: "",
      streetAddress: "",
      kioskID: null,
    }));
    setErrors({});
    setSelectedDistrict(null);
    setSelectedWard(null);
    setWards([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`Handling change for ${name}:`, value);

    if (name === "district") {
      const district = districts.find(d => d.code === value);
      setSelectedDistrict(district || null);
      setSelectedWard(null);
      setFormData(prev => ({
        ...prev,
        district: value,
        ward: ""
      }));
    } else if (name === "ward") {
      const ward = wards.find(w => w.code === value);
      setSelectedWard(ward || null);
      setFormData(prev => ({
        ...prev,
        ward: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === "quantity" ? Math.max(1, parseInt(value) || 0) : value
      }));
    }

    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (deliveryType === "address") {
      if (!formData.district) newErrors.district = "District is required";
      if (!formData.ward) newErrors.ward = "Ward is required";
      if (!formData.streetAddress) newErrors.streetAddress = "Street address is required";
    } else {
      if (!formData.kioskID) newErrors.kioskID = "Please select a kiosk";
    }

    if (!formData.reason) newErrors.reason = "Reason is required";
    if (formData.quantity < 1) newErrors.quantity = "Quantity must be at least 1";

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let receiverAddress = "";
      if (deliveryType === "address" && selectedDistrict && selectedWard) {
        const addressParts = [
          formData.streetAddress,
          selectedWard.name,
          selectedDistrict.name,
          "TP. Hồ Chí Minh"
        ].filter(Boolean);
        
        receiverAddress = addressParts.join(", ");
      }

      const exchangeData = {
        productGlassID: productGlassId,
        receiverAddress,
        kioskID: deliveryType === "kiosk" ? formData.kioskID : null,
        reportID: reportId,
        reason: formData.reason,
        quantity: formData.quantity
      };

      console.log("Submitting exchange data:", exchangeData);

      const response = await createExchangeEyeGlass(exchangeData);

      if (response) {
        toast.success("Exchange request created successfully");
        toggle();
        resetForm();
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.[0] || "Failed to create exchange request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="exchange-request-modal" size="lg">
      <ModalHeader toggle={toggle}>
        Create Exchange Request
      </ModalHeader>

      <ModalBody>
        {/* Delivery Type */}
        <FormGroup>
          <Label>Delivery Option</Label>
          <div className="d-flex gap-4">
            <div className="form-check">
              <Input
                type="radio"
                id="kioskDelivery"
                name="deliveryType"
                checked={deliveryType === "kiosk"}
                onChange={() => handleDeliveryTypeChange("kiosk")}
                className="form-check-input"
              />
              <Label for="kioskDelivery">Kiosk Delivery</Label>
            </div>
            <div className="form-check">
              <Input
                type="radio"
                id="addressDelivery"
                name="deliveryType"
                checked={deliveryType === "address"}
                onChange={() => handleDeliveryTypeChange("address")}
                className="form-check-input"
              />
              <Label for="addressDelivery">Home Delivery</Label>
            </div>
          </div>
        </FormGroup>

        {/* Kiosk Selection */}
        {deliveryType === "kiosk" && (
          <FormGroup>
            <Label for="kioskID">Select Kiosk</Label>
            <Input
              type="select"
              name="kioskID"
              id="kioskID"
              value={formData.kioskID || ""}
              onChange={handleChange}
              invalid={!!errors.kioskID}
              disabled={isLoading}
            >
              <option value="">Select a kiosk</option>
              {kiosks.map(kiosk => (
                <option key={kiosk.id} value={kiosk.id}>
                  {kiosk.name} - {kiosk.address}
                </option>
              ))}
            </Input>
            {errors.kioskID && (
              <FormFeedback>{errors.kioskID}</FormFeedback>
            )}
          </FormGroup>
        )}

        {/* Address Selection */}
        {deliveryType === "address" && (
          <>
            <FormGroup>
              <Label for="district">District</Label>
              <Input
                type="select"
                name="district"
                id="district"
                value={formData.district}
                onChange={handleChange}
                invalid={!!errors.district}
                disabled={isLoadingDistricts}
              >
                <option value="">
                  {isLoadingDistricts ? "Loading districts..." : "Select District"}
                </option>
                {districts.map(district => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </Input>
              {errors.district && (
                <FormFeedback>{errors.district}</FormFeedback>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="ward">Ward</Label>
              <Input
                type="select"
                name="ward"
                id="ward"
                value={formData.ward}
                onChange={handleChange}
                invalid={!!errors.ward}
                disabled={!formData.district || isLoadingWards}
              >
                <option value="">
                  {!formData.district 
                    ? "Please select district first"
                    : isLoadingWards 
                      ? "Loading wards..."
                      : "Select Ward"
                  }
                </option>
                {wards.map(ward => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </Input>
              {errors.ward && (
                <FormFeedback>{errors.ward}</FormFeedback>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="streetAddress">Street Address</Label>
              <Input
                type="text"
                name="streetAddress"
                id="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                invalid={!!errors.streetAddress}
                placeholder="Enter your street address"
              />
              {errors.streetAddress && (
                <FormFeedback>{errors.streetAddress}</FormFeedback>
              )}
            </FormGroup>
          </>
        )}

        {/* Reason */}
        <FormGroup>
          <Label for="reason">Reason for Exchange</Label>
          <Input
            type="textarea"
            name="reason"
            id="reason"
            value={formData.reason}
            onChange={handleChange}
            invalid={!!errors.reason}
            rows={3}
            placeholder="Please provide the reason for exchange"
          />
          {errors.reason && (
            <FormFeedback>{errors.reason}</FormFeedback>
          )}
        </FormGroup>

        {/* Quantity */}
        <FormGroup>
          <Label for="quantity">Quantity</Label>
          <Input
            type="number"
            name="quantity"
            id="quantity"
            value={formData.quantity}
            onChange={handleChange}
            invalid={!!errors.quantity}
            min={1}
          />
          {errors.quantity && (
            <FormFeedback>{errors.quantity}</FormFeedback>
          )}
        </FormGroup>
      </ModalBody>

      <ModalFooter>
        <Button color="light" onClick={toggle} disabled={isLoading}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
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