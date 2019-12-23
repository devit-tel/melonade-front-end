import { State } from "@melonade/melonade-declaration";
import React from "react";
import { Route, RouteComponentProps, StaticContext } from "react-router";
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
};
