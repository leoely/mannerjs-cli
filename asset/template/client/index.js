import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from '~/client/script/component/Router';
import global from '~/client/script/obj/global';

const root = ReactDOM.createRoot(document.getElementById('root'));
global.router = <Router />;
root.render(global.router);
