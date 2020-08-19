import React, { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import Landing from "./components/layout/Landing";
import "./App.css";
import setAuthToken from "./utils/setAuthToken";
import { loadUser } from "./store/actions/auth";
import store from "./store/store";
import Routes from "./components/routing/Routes";

///Add token to all requests
if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  ///Load user componentDidmount
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Router>
      <Fragment>
        <NavBar />
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route component={Routes} />
        </Switch>
      </Fragment>
    </Router>
  );
};

export default App;
