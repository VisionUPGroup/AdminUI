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