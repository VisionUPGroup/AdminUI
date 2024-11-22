import React from 'react';
import Image from 'next/image';
import styles from '../styles/ProductSelection.module.scss';
import { EyeGlass } from '../types/product';

interface ProductCardProps {
    product: EyeGlass;
    onSelect: () => void;
  }

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div className={styles.productCard} onClick={onSelect}>
      <div className={styles.imageContainer}>
        <Image
          src={product.eyeGlassImages[0]?.url || '/placeholder.png'}
          alt={product.name}
          width={200}
          height={200}
          objectFit="cover"
        />
      </div>
      
      <div className={styles.productInfo}>
        <h3>{product.name}</h3>
        <p className={styles.type}>{product.eyeGlassTypes.glassType}</p>
        <div className={styles.details}>
          <span>Material: {product.material}</span>
          <span>Color: {product.color}</span>
        </div>
        <div className={styles.price}>
          {product.price.toLocaleString('vi-VN')} VND
        </div>
      </div>
    </div>
  );
};

export default ProductCard;