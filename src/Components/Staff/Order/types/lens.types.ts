export interface LensSelectionState {
    profileId: number | null;
    refractionRecordId: number | null;
    measurements: MeasurementRecord[];
    prescriptionData: PrescriptionData;
    mode?: LensMode;
    leftLens?: Lens | null;
    rightLens?: Lens | null;
    prescriptionSource?: 'previous' | 'new';
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
    recordID: number;
    employeeID: number;
    testType: number;
    spherical: number;
    cylindrical: number;
    axis: number;
    pupilDistance: number;
    eyeSide: number; // 0: left, 1: right
    lastCheckupDate: string;
    nextCheckupDate: string;
    notes: string;
  }
  
  export interface Profile {
    id: number;
    accountID: number;
    fullName: string;
    phoneNumber: string;
    address: string;
    urlImage: string;
    birthday: string;
    status: boolean;
    refractionRecords: RefractionRecord[];
  }
  
  export interface RefractionRecord {
    id: number;
    profileID: number;
    startTime: string;
    status: boolean;
    kiosks: Kiosk[];
    isJoin: boolean;
  }
  
  export interface Kiosk {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
    openingHours: string;
    status: boolean;
  }
  
  export type LensMode = 'same' | 'custom';
  
  export interface Lens {
    id: number;
    lensName: string;
    lensDescription: string;
    lensPrice: number;
    lensImages: { url: string }[];
    rate: number;
    rateCount: number;
    status: boolean;
    features?: string[];
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