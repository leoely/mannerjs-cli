import React from 'react';
import style from './index.module.css';

export default function locationTemplate(e) {
  const { type, elem, } = e;
  switch (type) {
    case '/':
      return <span className={style.slash}>/</span>;
    case 'namespace':
      return (
        <span className={style.namespace}>{elem}</span>
      );
  }
}
