// context/StaffOrderContext.tsx
import React, { createContext, useContext } from 'react';
import { useStaffOrder } from '../hooks/useStaffOrder';

const StaffOrderContext = createContext<ReturnType<typeof useStaffOrder> | null>(null);

export const StaffOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const staffOrderService = useStaffOrder();

  return (
    <StaffOrderContext.Provider value={staffOrderService}>
      {children}
    </StaffOrderContext.Provider>
  );
};

export const useStaffOrderContext = () => {
  const context = useContext(StaffOrderContext);
  if (!context) {
    throw new Error('useStaffOrderContext must be used within StaffOrderProvider');
  }
  return context;
};