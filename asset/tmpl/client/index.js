import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from '~/client/script/component/Router';
import '~/client/style/index.css';

function Application() {
  return (
    <div style={{ height: '100%', }}>
      <Router />
    </div>
  );
}

const domNode = document.getElementById('root');
const root = ReactDOM.createRoot(domNode);
root.render(<Application />);
