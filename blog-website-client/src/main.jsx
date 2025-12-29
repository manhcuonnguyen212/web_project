import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "./redux/store.js";
import { BrowserRouter } from "react-router-dom";

import GlobalStyles from "./GlobalStyles/GlobalStyles.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate persistor={persistor} loading={null}>
      <BrowserRouter>
        <GlobalStyles>
          <StrictMode>
            <App />
          </StrictMode>
        </GlobalStyles>
      </BrowserRouter>
    </PersistGate>
  </Provider>
);
