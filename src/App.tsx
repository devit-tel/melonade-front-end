import React from "react";
import { Redirect, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import Router from "./Router";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Route path="/" exact component={() => <Redirect to="/transaction" />} />
      <Route component={Router} />
    </BrowserRouter>
  );
};

export default App;
