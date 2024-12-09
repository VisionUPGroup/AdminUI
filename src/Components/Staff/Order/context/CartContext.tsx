import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { EyeGlass, Lens } from '../types/product';

interface PrescriptionData {
  sphereOD?: number;
  cylinderOD?: number;
  axisOD?: number;
  sphereOS?: number;
  cylinderOS?: number;
  axisOS?: number;
  addOD?: number;
  addOS?: number;
  pd?: number;
}

export interface CartItem {
  id: string; // Unique ID for cart item
  eyeGlass: EyeGlass;
  leftLens: Lens;
  rightLens: Lens;
  prescriptionData: PrescriptionData;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | undefined>(undefined);

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.eyeGlass.price + item.leftLens.lensPrice + item.rightLens.lensPrice) * item.quantity;
  }, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      const updatedItems = [...state.items, action.payload];
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        items: filteredItems,
        total: calculateTotal(filteredItems),
      };

    case 'UPDATE_QUANTITY':
      const updatedItemsWithQuantity = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        items: updatedItemsWithQuantity,
        total: calculateTotal(updatedItemsWithQuantity),
      };

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
      };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
  });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};