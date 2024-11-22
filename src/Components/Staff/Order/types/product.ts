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