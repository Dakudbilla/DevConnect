import { createStore, compose, applyMiddleware } from "redux";
import reducers from "./reducers/index";
import reduxThunk from "redux-thunk";
const initialState = {};
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const middleware = [reduxThunk];
const store = createStore(
  reducers,
  initialState,
  composeEnhancers(applyMiddleware(...middleware))
);

export default store;
