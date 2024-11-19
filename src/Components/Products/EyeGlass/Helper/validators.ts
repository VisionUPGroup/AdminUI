// validators.ts

export interface EyeGlassImage {
    id: number;
    eyeGlassID?: number;
    angleView: number;
    url: string;
}

export interface EyeGlassFormData {
    name: string;
    price: string;
    quantity: string;
    material: string;
    color: string;
    style: string;
    design: string;
    eyeGlassTypeID: string;
    status: boolean;
    lensWidth: string;
    lensHeight: string;
    bridgeWidth: string;
    templeLength: string;
    frameWidth: string;
    weight: string;
    images: EyeGlassImage[];
}

export interface ValidationErrors extends Omit<Record<keyof EyeGlassFormData, string>, 'status'> {
    images: string;
}

type ValidFieldNames = keyof Omit<EyeGlassFormData, 'status'>;

export const validateField = (name: string, value: any, isAdd: boolean = false): string => {
    const fieldName = name as ValidFieldNames;
    
    switch (fieldName) {
        case 'name':
            if (!value?.toString().trim()) return 'Product name is required';
            if (value.length < 3) return 'Product name must be at least 3 characters';
            if (value.length > 100) return 'Product name must not exceed 100 characters';
            return '';

        case 'price':
            if (!value) return 'Price is required';
            if (isNaN(value) || Number(value) <= 0) return 'Price must be a positive number';
            if (Number(value) > 1000000000) return 'Price is too high';
            return '';

        case 'quantity':
            if (!value) return 'Quantity is required';
            if (!Number.isInteger(Number(value))) return 'Quantity must be a whole number';
            if (Number(value) < 0) return 'Quantity cannot be negative';
            if (Number(value) > 1000000) return 'Quantity is too high';
            return '';

        case 'material':
            if (!value?.toString().trim()) return 'Material is required';
            if (value.length < 2) return 'Material must be at least 2 characters';
            if (value.length > 50) return 'Material must not exceed 50 characters';
            return '';

        case 'color':
            if (!value && value !== 0) return 'Color is required';
            return '';

        case 'design':
            if (!value?.toString().trim()) return 'Design is required';
            if (value.length < 2) return 'Design must be at least 2 characters';
            if (value.length > 50) return 'Design must not exceed 50 characters';
            return '';

        case 'eyeGlassTypeID':
            if (!value) return 'Glass type is required';
            return '';

        case 'style':
            if (!value?.toString().trim()) return 'Style is required';
            return '';

        case 'images':
            if (isAdd) {
                if (!value || !Array.isArray(value) || value.length === 0) {
                    return 'At least one image is required';
                }
                const hasValidImage = value.some(img => img.url && img.url.trim() !== '');
                if (!hasValidImage) {
                    return 'At least one valid image is required';
                }
            }
            return '';

        case 'lensWidth':
        case 'lensHeight':
        case 'bridgeWidth':
        case 'templeLength':
        case 'frameWidth':
            if (!value) return `${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
            if (isNaN(value) || Number(value) <= 0) return `${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()} must be a positive number`;
            if (Number(value) > 1000) return `${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()} is too large`;
            return '';

        case 'weight':
            if (!value) return 'Weight is required';
            if (isNaN(value) || Number(value) <= 0) return 'Weight must be a positive number';
            if (Number(value) > 1000) return 'Weight is too large';
            return '';

        default:
            return '';
    }
};

export const validateForm = (formData: EyeGlassFormData, isAdd: boolean = false): ValidationErrors => {
    return {
        name: validateField('name', formData.name, isAdd),
        price: validateField('price', formData.price, isAdd),
        quantity: validateField('quantity', formData.quantity, isAdd),
        material: validateField('material', formData.material, isAdd),
        color: validateField('color', formData.color, isAdd),
        design: validateField('design', formData.design, isAdd),
        eyeGlassTypeID: validateField('eyeGlassTypeID', formData.eyeGlassTypeID, isAdd),
        style: validateField('style', formData.style, isAdd),
        lensWidth: validateField('lensWidth', formData.lensWidth, isAdd),
        lensHeight: validateField('lensHeight', formData.lensHeight, isAdd),
        bridgeWidth: validateField('bridgeWidth', formData.bridgeWidth, isAdd),
        templeLength: validateField('templeLength', formData.templeLength, isAdd),
        frameWidth: validateField('frameWidth', formData.frameWidth, isAdd),
        weight: validateField('weight', formData.weight, isAdd),
        images: validateField('images', formData.images, isAdd)
    };
};

export const isFormValid = (errors: ValidationErrors): boolean => {
    return !Object.values(errors).some(error => error !== '');
};