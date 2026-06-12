import React, { StrictMode, } from 'react';
import ReactDOM from 'react-dom/client';
import Application from '~/client/script/component/Application';
import '~/client/style/index.css';

function App() {
  return (
    <StrictMode>
      <div style={{ height: '100%', }}>
        <Application />
      </div>
    </StrictMode>
  );
}

const domNode = document.getElementById('root');
const root = ReactDOM.createRoot(domNode);
root.render(<App />);
