// shipperService.js
import { useAccountService } from './accountService';

export const useShipperService = () => {
  const { fetchAccountByRole } = useAccountService();
  const SHIPPER_ROLE_ID = 4;

  const fetchAllShipper = async (username = "", pageIndex = 1, status = true, phoneNumber = "") => {
    try {
      const response = await fetchAccountByRole(
        SHIPPER_ROLE_ID,
        username,
        pageIndex,
        status,
        phoneNumber
      );

      return response.items.map(shipper => ({
        id: shipper.id,
        name: shipper.username,
        status: shipper.status,
        phoneNumber: shipper.phoneNumber
      }));
    } catch (error) {
      console.error("Error fetching shippers:", error);
      throw error;
    }
  };

  // Fetch single shipper by ID
  const fetchShipperById = async (shipperId) => {
    try {
      const { fetchAccountById } = useAccountService();
      const response = await fetchAccountById(shipperId);

      if (response && response.roleId === SHIPPER_ROLE_ID) {
        return {
          id: response.id,
          name: response.username,
          status: response.status,
          phoneNumber: response.phoneNumber
        };
      }
      throw new Error("Account is not a shipper");
    } catch (error) {
      console.error("Error fetching shipper:", error);
      throw error;
    }
  };

  return {
    fetchAllShipper,
    fetchShipperById
  };
};