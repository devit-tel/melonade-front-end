import React from "react";
import { Route, RouteComponentProps } from "react-router";
import Layout from "./components/OutterLayout";
import TaskDefinitionList from "./containers/TaskDefinitionList";
import TransactionDetail from "./containers/TransactionDetail";
import TransactionTable from "./containers/TransactionTable";
import WorkflowDefinitionDetail from "./containers/WorkflowDefinitionDetail";
import WorkflowDefinitionList from "./containers/WorkflowDefinitionList";

interface IProps extends RouteComponentProps {}

export default (props: IProps) => {
  return (
    <Layout {...props}>
      <Route path="/transaction/" component={TransactionTable} exact />
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
    </Layout>
  );
};
