// types/lens.ts
export interface Lens {
    id: number;
    lensName: string;
    lensDescription: string;
    lensPrice: number;
    lensTypeID: number;
    status: boolean;
    rate: number;
    rateCount: number;
    lensImages: LensImage[];
    lensType: LensType;
  }
  
  export interface LensImage {
    id: number;
    url: string;
  }
  
  export interface LensType {
    id: number;
    description: string;
    status: boolean;
  }
  
  export interface PrescriptionData {
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
  
  export interface MeasurementRecord {
    id: number;
    startTime: string;
    kiosks: {
      id: number;
      name: string;
      address: string;
    }[];
  }
  
  export interface MeasurementResult {
    eyeSide: number; // 0: left, 1: right
    spherical: number;
    cylindrical: number;
    axis: number;
    pupilDistance?: number;
    lastCheckupDate: string;
  }
  
  export type LensMode = 'same' | 'custom';
  export type PrescriptionSource = 'previous' | 'new';

  export interface PrescriptionInput {
    eye: 'right' | 'left' | 'both';
    type: 'sphere' | 'cylinder' | 'axis' | 'add' | 'pd';
    value: number;
  }
  
  export interface LensSelectionState {
    mode: LensMode | null;
    prescriptionSource: PrescriptionSource | null;
    leftLens: Lens | null;
    rightLens: Lens | null;
    prescriptionData: PrescriptionData;
    activeEye: 'right' | 'left';
  }