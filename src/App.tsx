import React from "react";
import { Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import TransactionDetail from "./containers/TransactionDetail";
import TransactionTable from "./containers/TransactionTable";
import WorkflowDefinitionList from "./containers/WorkflowDefinitionList";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Route path="/" component={TransactionTable} exact />
      <Route path="/:transactionId" component={TransactionDetail} exact />
      <Route
        path="/definition/workflow"
        component={WorkflowDefinitionList}
        exact
      />
    </BrowserRouter>
  );
};

export default App;
