import React from "react";
import { Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import TransactionDetail from "./containers/TransactionDetail";
import TransactionTable from "./containers/TransactionTable";
import WorkflowDefinitionDetail from "./containers/WorkflowDefinitionDetail";
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
      <Route
        path="/definition/workflow/:name/:rev"
        component={WorkflowDefinitionDetail}
        exact
      />
    </BrowserRouter>
  );
};

export default App;
