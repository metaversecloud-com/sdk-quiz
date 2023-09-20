import React from "react";
import PageRoutes from './pages/PageRoutes';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { Auth0Provider } from "@auth0/auth0-react";
import "./pages/App.scss";

import store from './redux/store';

function App() {
  return (
    <Auth0Provider>
      <Provider store={store}
        redirectUri={window.location.origin}>
        <Toaster />
        <PageRoutes />
      </Provider>
    </Auth0Provider >
  );
}

export default App;