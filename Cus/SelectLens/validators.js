export const validatePrescriptionData = (data) => {
    const requiredFields = [
      'odSphere',
      'odCylinder',
      'odAxis',
      'osSphere',
      'osCylinder',
      'osAxis',
      'pdType',
      'addOD',
      'addOS'
    ];
  
    return !requiredFields.some(field => {
      const value = data[field];
      return typeof value === 'number' && value < 1;
    });
  };