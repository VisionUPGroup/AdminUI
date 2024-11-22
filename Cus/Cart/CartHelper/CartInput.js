import React, { useState } from 'react';
import { VisaIcon, MastercardIcon, AmexIcon } from './CreditCardIcons';
import styles from './CardInput.module.scss';

const CardInput = ({ register, errors }) => {
  const [cardType, setCardType] = useState('');

  const getCardType = (number) => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) {
        return type;
      }
    }
    return '';
  };

  const handleCardInput = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Format card number with spaces
    if (value.length > 16) value = value.substr(0, 16);
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }
    
    e.target.value = formattedValue;
    setCardType(getCardType(value));
  };

  return (
    <div className={styles.formGroup}>
      <label>Card Number *</label>
      <div className={styles.cardNumberInput}>
        <input
          type="text"
          placeholder="1234 5678 9012 3456"
          {...register('cardNumber', {
            required: 'Card number is required',
            pattern: {
              value: /^[\d\s]{19}$/,
              message: 'Please enter a valid card number'
            },
            onChange: handleCardInput
          })}
          className={`${styles.input} ${errors.cardNumber ? styles.error : ''}`}
          maxLength="19"
        />
        <div className={styles.cardIcons}>
          <div className={`${styles.cardIcon} ${cardType === 'visa' ? styles.active : ''}`}>
            <VisaIcon />
          </div>
          <div className={`${styles.cardIcon} ${cardType === 'mastercard' ? styles.active : ''}`}>
            <MastercardIcon />
          </div>
          <div className={`${styles.cardIcon} ${cardType === 'amex' ? styles.active : ''}`}>
            <AmexIcon />
          </div>
        </div>
      </div>
      {errors.cardNumber && (
        <span className={styles.errorMessage}>{errors.cardNumber.message}</span>
      )}
    </div>
  );
};

export default CardInput;