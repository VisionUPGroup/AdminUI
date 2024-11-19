// src/types/react-range-slider-input.d.ts
declare module 'react-range-slider-input' {
    import { FC } from 'react';
  
    interface RangeSliderProps {
      min: number;
      max: number;
      step: number;
      value: number[];
      onInput: (value: number[]) => void;
      onThumbDragEnd?: () => void;
      [key: string]: any;
    }
  
    const RangeSlider: FC<RangeSliderProps>;
    export default RangeSlider;
  }