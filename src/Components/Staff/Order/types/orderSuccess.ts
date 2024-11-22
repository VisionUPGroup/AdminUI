// types/orderSuccess.ts

export interface PaymentDetail {
    id: number;
    totalAmount: number;
    date: string;
    paymentMethod: string;
  }
  
  export interface ProductDetail {
    productGlassID: number;
    eyeGlass: {
      id: number;
      name: string;
      eyeGlassImage: string;
    };
    leftLen: {
      id: number;
      lensName: string;
      lensDescription: string;
      leftLensImage: string | null;
    };
    rightLen: {
      id: number;
      lensName: string;
      lensDescription: string;
      rightLensImage: string | null;
    };
  }
  
  export interface OrderSuccessData {
    orderID: number;
    code: string;
    orderTime: string;
    totalAmount: number;
    isDeposit: boolean;
    receiverAddress: string | null;
    kioskID?: number;
    process: number;
    productGlass: ProductDetail[];
    totalPaid: number;
    remainingAmount: number;
    voucher: {
      id: number;
      code: string;
      discountValue: number;
    } | null;
    payments: PaymentDetail[];
  }

  // types/order.ts

export interface ProductGlassRequest {
    eyeGlassID: number;
    leftLenID: number;
    rightLenID: number;
    accountID: number;
    sphereOD: number;
    cylinderOD: number;
    axisOD: number;
    sphereOS: number;
    cylinderOS: number;
    axisOS: number;
    addOD: number;
    addOS: number;
    pd: number;
}

export interface OrderDetail {
    quantity: number;
    productGlassRequest: ProductGlassRequest;
}

export interface CreateOrderRequest {
    receiverAddress: string | null;
    kioskID?: number;
    voucherID?: number;
    isDeposit: boolean;
    orderDetails: OrderDetail[];
}

export interface OrderResponse {
    id: number;
    accountID: number;
    orderTime: string;
    status: boolean;
    kioskID?: number;
    receiverAddress: string | null;
    total: number;
    voucherID: number | null;
    isDeposit: boolean;
    code: string;
    process: number;
    orderDetails: Array<{
        id: number;
        orderID: number;
        productGlass: {
            id: number;
            eyeGlassID: number;
            leftLenID: number;
            rightLenID: number;
            accountID: number;
            total: number;
            status: boolean;
        };
        quantity: number;
        status: boolean;
    }>;
}

export interface PaymentDetailsResponse {
    orderID: number;
    productGlass: Array<{
        productGlassID: number;
        eyeGlass: {
            id: number;
            name: string;
            eyeGlassImage: string;
        };
        leftLen: {
            id: number;
            lensName: string;
            lensDescription: string;
            leftLensImage: string;
        };
        rightLen: {
            id: number;
            lensName: string;
            lensDescription: string;
            rightLensImage: string;
        };
    }>;
    voucher: null | {
        id: number;
        code: string;
        discountValue: number;
    };
    process: number;
    isDeposit: boolean;
    totalAmount: number;
    totalPaid: number;
    remainingAmount: number;
    payments: any[];
}

// types/product.ts
export interface EyeGlassImage {
    id: number;
    eyeGlassID: number; 
    angleView: number;
    url: string;
  }
  
  export interface EyeGlassType {
    id: number;
    glassType: string;
    status: boolean;
  }
  
  export interface EyeGlass {
    id: number;
    eyeGlassTypeID: number;
    name: string;
    price: number;
    rate: number;
    rateCount: number;
    quantity: number;
    material: string;
    color: string;
    lensWidth: number;
    lensHeight: number;
    bridgeWidth: number;
    templeLength: number;
    frameWidth: number;
    style: string;
    weight: number;
    design: string;
    status: boolean;
    eyeGlassTypes: EyeGlassType;
    eyeGlassImages: EyeGlassImage[];
  }

  // types/company.ts

export interface CompanyInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo: string;
    taxId: string;
    website: string; 
  }

  // types/lens.ts
export interface LensType {
    id: number;
    description: string;
    status: boolean;
  }
  
  export interface EyeReflactive {
    id: number;
    reflactiveName: string;
    status: boolean;
  }
  
  export interface LensImage {
    id: number;
    lensID: number;
    angleView: number;
    url: string;
  }
  
  export interface Lens {
    id: number;
    lensName: string;
    lensDescription: string;
    lensPrice: number;
    quantity: number;
    status: boolean;
    rate: number;
    rateCount: number;
    lensTypeID: number;
    eyeReflactiveID: number;
    eyeReflactive: EyeReflactive;
    lensType: LensType;
    lensImages: LensImage[];
  }