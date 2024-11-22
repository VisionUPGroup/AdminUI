import React from 'react';
import styles from './styles/SelectLens.module.scss';

export const PrescriptionInput = ({
  label,
  subLabel,
  handleChangeValue,
  fields,
  data
}) => {
  const safeData = data || {};

  // Hàm validate và format giá trị theo yêu cầu backend
  const validateValue = (value, field) => {
    // Convert empty string to 0
    if (value === '') return 0;

    const numValue = parseFloat(value);
    
    // Validate axis fields (phải là số nguyên và từ 0-180)
    if (field.includes('axis')) {
      const intValue = Math.round(numValue);
      return Math.min(Math.max(intValue, 0), 180);
    }
    
    // Validate Sphere/Cylinder (-12 đến +12 với 2 số thập phân)
    if (field.includes('sphere') || field.includes('cylinder')) {
      return Math.min(Math.max(parseFloat(numValue.toFixed(2)), -12), 12);
    }
    
    // Validate ADD (0 đến +4 với 2 số thập phân)
    if (field.includes('add')) {
      return Math.min(Math.max(parseFloat(numValue.toFixed(2)), 0), 4);
    }
    
    // Validate PD (50 đến 80 với 2 số thập phân)
    if (field.includes('pd')) {
      return Math.min(Math.max(parseFloat(numValue.toFixed(2)), 50), 80);
    }

    return numValue;
  };

  return (
    <div className={styles.prescriptionRow}>
      <div className={styles.label}>
        <span className={styles.main}>{label}</span>
        {subLabel && <span className={styles.sub}>{subLabel}</span>}
      </div>
      
      {fields.map((field) => {
        const currentValue = safeData[field] !== undefined && safeData[field] !== null 
          ? safeData[field].toString() 
          : '';
        
        let min, max, step;
        if (field.includes('axis')) {
          min = 0;
          max = 180;
          step = 1; // Axis chỉ nhận số nguyên
        } else if (field.includes('sphere') || field.includes('cylinder')) {
          min = -12;
          max = 12;
          step = 0.25; // Bước nhảy 0.25 cho độ cận/loạn
        } else if (field.includes('add')) {
          min = 0;
          max = 4;
          step = 0.25; // Bước nhảy 0.25 cho ADD
        } else if (field.includes('pd')) {
          min = 50;
          max = 80;
          step = 0.5; // Bước nhảy 0.5 cho PD
        }

        return (
          <input
            key={field}
            type="number"
            step={step}
            min={min}
            max={max}
            value={currentValue}
            onChange={(e) => {
              const validatedValue = validateValue(e.target.value, field);
              handleChangeValue(
                { target: { value: validatedValue }},
                field
              );
            }}
            className={styles.input}
            placeholder={`${min} to ${max}`}
            // Thêm tooltip để hiển thị range hợp lệ
            title={`Valid range: ${min} to ${max}`}
          />
        );
      })}
    </div>
  );
};