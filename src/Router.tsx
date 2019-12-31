import { State } from "@melonade/melonade-declaration";
import React from "react";
import { Route, RouteComponentProps, StaticContext } from "react-router";
import { BrowserRouter, Redirect } from "react-router-dom";
import Layout from "./components/OutterLayout";
import Dashboard from "./containers/Dashboard";
import RunningTransactionList from "./containers/RunningTransactionList";
import TaskDefinitionList from "./containers/TaskDefinitionList";
import TransactionDetail from "./containers/TransactionDetail";
import TransactionList from "./containers/TransactionList";
import WorkflowDefinitionDetail from "./containers/WorkflowDefinitionDetail";
import WorkflowDefinitionList from "./containers/WorkflowDefinitionList";

interface ILayoutRouterProps extends RouteComponentProps {}

const LayoutRouter = (props: ILayoutRouterProps) => (
  <Layout {...props}>
    <Route path="/dashboard/" component={Dashboard} exact />
    <Route
      path="/transaction/"
      render={(props: RouteComponentProps<any, StaticContext, any>) => (
        <TransactionList
          {...props}
          statuses={[State.TransactionStates.Running]}
        />
      )}
      exact
    />
    <Route
      path="/running-transaction/"
      component={RunningTransactionList}
      exact
    />
    <Route
      path="/completed-transaction/"
      render={(props: RouteComponentProps<any, StaticContext, any>) => (
        <TransactionList
          {...props}
          statuses={[State.TransactionStates.Completed]}
        />
      )}
      exact
    />
    <Route
      path="/compensated-transaction/"
      render={(props: RouteComponentProps<any, StaticContext, any>) => (
        <TransactionList
          {...props}
          statuses={[State.TransactionStates.Compensated]}
        />
      )}
      exact
    />
    <Route
      path="/cancelled-transaction/"
      render={(props: RouteComponentProps<any, StaticContext, any>) => (
        <TransactionList
          {...props}
          statuses={[State.TransactionStates.Cancelled]}
        />
      )}
      exact
    />
    <Route
      path="/failed-transaction/"
      render={(props: RouteComponentProps<any, StaticContext, any>) => (
        <TransactionList
          {...props}
          statuses={[State.TransactionStates.Failed]}
        />
      )}
      exact
    />
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

interface IProps {}

export default (props: IProps) => {
  return (
    <BrowserRouter>
      <Route path="/" exact component={() => <Redirect to="/dashboard" />} />
      <Route component={LayoutRouter} />
    </BrowserRouter>
  );
};
