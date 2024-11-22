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