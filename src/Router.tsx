import React from "react";
import { Route, RouteComponentProps } from "react-router";
import Layout from "./components/OutterLayout";
import Dashboard from "./containers/Dashboard";
import TaskDefinitionList from "./containers/TaskDefinitionList";
import TransactionDetail from "./containers/TransactionDetail";
import TransactionList from "./containers/TransactionList";
import WorkflowDefinitionDetail from "./containers/WorkflowDefinitionDetail";
import WorkflowDefinitionList from "./containers/WorkflowDefinitionList";

interface IProps extends RouteComponentProps {}

export default (props: IProps) => {
  return (
    <Layout {...props}>
      <Route path="/dashboard/" component={Dashboard} exact />
      <Route path="/transaction/" component={TransactionList} exact />
      <Route
        path="/transaction/:transactionId"
        component={TransactionDetail}
        exact
      />
      <Route
        path="/definition/workflow"
        component={WorkflowDefinitionList}
        exact
      />
      <Route path="/definition/task" component={TaskDefinitionList} exact />
      <Route
        path="/definition/workflow/:name/:rev"
        component={WorkflowDefinitionDetail}
        exact
      />
      <Route
        path="/definition/workflow/create"
        component={WorkflowDefinitionDetail}
        exact
      />
    </Layout>
  );
};
