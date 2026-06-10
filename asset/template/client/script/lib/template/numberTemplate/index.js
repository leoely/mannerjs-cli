import React from 'react';
import style from './index.module.css';

export default function locationTemplate(token, idx){
  const { type, elem, } = token;
  switch (type) {
    case 'number':
      return <span key={idx} className={style.number}>{elem}</span>;
    case 'point':
      return <span key={idx} className={style.point}>{elem}</span>;
    case 'separator':
      return <span key={idx} className={style.separator}>{elem}</span>;
    default:
      throw new Error('[Error] The type of token is not within the processing range');
  }
}
