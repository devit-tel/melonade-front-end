import React from "react";
import { Route } from "react-router";
import TransactionTable from "./containers/TransactionTable";

const App: React.FC = () => {
  return (
    <React.Fragment>
      <Route path="/" component={TransactionTable} exact />
    </React.Fragment>
  );
};

export default App;
