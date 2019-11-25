import React from "react";
import { Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import TransactionDetail from "./containers/TransactionDetail";
import TransactionTable from "./containers/TransactionTable";
import WorkflowList from "./containers/WorkflowList";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Route path="/" component={TransactionTable} exact />
      <Route path="/:transactionId" component={TransactionDetail} exact />
      <Route path="/definition/workflow" component={WorkflowList} exact />
    </BrowserRouter>
  );
};

export default App;
