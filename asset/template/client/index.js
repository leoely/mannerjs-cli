import React, { StrictMode, } from 'react';
import ReactDOM from 'react-dom/client';
import Application from '~/client/script/component/Application';
import '~/client/style/index.css';

function Website() {
  return (
    <StrictMode>
      <div style={{ height: '100%', }}>
        <Application mode="default" />
      </div>
    </StrictMode>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Website />);
