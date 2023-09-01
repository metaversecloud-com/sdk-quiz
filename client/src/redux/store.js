import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";

import { createReduxHistoryContext } from "redux-first-history";
import { createBrowserHistory } from "history";

import { session } from "./reducers/session";

const { createReduxHistory, routerMiddleware, routerReducer } =
  createReduxHistoryContext({
    history: createBrowserHistory(),
    savePreviousLocations: 1,
  });

const middleware = [routerMiddleware];

export const store = configureStore({
  reducer: combineReducers({
    router: routerReducer,
    session: session.reducer,
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export const history = createReduxHistory(store);

export default store;
