import React from 'react';
import style from './index.module.css';

export default function locationTemplate(token, idx){
  const { type, elem, } = token;
  switch (type) {
    case 'slash':
      return <span key={idx} className={style.slash}>{elem}</span>;
    case 'namespace':
      return <span key={idx} className={style.namespace}>{elem}</span>;
    case 'dot':
      return <span key={idx} className={style.dot}>{elem}</span>;
    case 'filename':
      return <span key={idx} className={style.filename}>{elem}</span>;
    case 'format':
      return <span key={idx} className={style.format}>{elem}</span>;
    case 'colon':
      return <span key={idx} className={style.colon}>{elem}</span>;
    case 'ipv4Subnet':
      return <span key={idx} className={style.ipv4Subnet}>{elem}</span>;
    case 'ipv6Subnet':
      return <span key={idx} className={style.ipv6Subnet}>{elem}</span>;
    default:
      throw new Error('[Error] The type of token is not within the processing range');
  }
}
