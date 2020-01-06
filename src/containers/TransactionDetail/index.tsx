import {
  Event,
  State,
  Task,
  WorkflowDefinition
} from "@melonade/melonade-declaration";
import { Button, Modal, Tabs } from "antd";
import * as R from "ramda";
import React from "react";
import { RouteComponentProps } from "react-router";
import styled from "styled-components";
import EventTable from "../../components/EventTable";
import TimelineChart from "../../components/TimelineChart";
import WorkflowChart from "../../components/WorkflowChart";
import { getTransactionData } from "../../services/eventLogger/http";
import { cancelTranasaction } from "../../services/procressManager/http";

const { TabPane } = Tabs;

const Container = styled.div`
  overflow: hidden;
`;

const StyledTabs = styled(Tabs)``;

interface ITransactionParams {
  transactionId: string;
}

interface IProps extends RouteComponentProps<ITransactionParams> {}

interface IState {
  events: Event.AllEvent[];
  isLoading: boolean;
}

const groupWorkflowById = (
  events: Event.AllEvent[]
): {
  [workflowId: string]: {
    workflowDefinition: WorkflowDefinition.IWorkflowDefinition;
    tasksData: { [taskReferenceName: string]: Task.ITask };
  };
} => {
  return R.reverse(R.sortBy(R.pathOr(0, ["timestamp"]), events)).reduce(
    (
      groupedTask: {
        [workflowId: string]: {
          workflowDefinition: WorkflowDefinition.IWorkflowDefinition;
          tasksData: { [taskReferenceName: string]: Task.ITask };
        };
      },
      event: Event.AllEvent
    ) => {
      if (event.isError === false && event.type === "TASK") {
        // it's already sorted new => old
        if (
          R.path(
            [
              event.details.workflowId,
              "tasksData",
              event.details.taskReferenceName
            ],
            groupedTask
          )
        ) {
          return groupedTask;
        }
        return R.set(
          R.lensPath([
            event.details.workflowId,
            "tasksData",
            event.details.taskReferenceName
          ]),
          event.details,
          groupedTask
        );
      } else if (event.isError === false && event.type === "WORKFLOW") {
        return R.set(
          R.lensPath([event.details.workflowId]),
          {
            tasksData: R.path(
              [event.details.workflowId, "tasksData"],
              groupedTask
            ),
            workflowDefinition: event.details.workflowDefinition,
            timestamp: event.details.createTime
          },
          groupedTask
        );
      }
      return groupedTask;
    },
    {}
  );
};

class TransactionTable extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      events: [],
      isLoading: false
    };
  }

  getTransactionData = async () => {
    this.setState({ isLoading: true });
    const { transactionId } = this.props.match.params;
    try {
      const events = await getTransactionData(transactionId);
      this.setState({
        events,
        isLoading: false
      });
    } catch (error) {
      this.setState({ isLoading: false });
    }
  };

  onCancelButtonClick = (transactionId: string) => {
    Modal.confirm({
      title: "Do you Want to cancel this transaction?",
      onOk() {
        cancelTranasaction(transactionId);
      }
    });
  };

  componentDidMount = async () => {
    this.getTransactionData();
    setInterval(() => {
      this.getTransactionData();
    }, 5000);
  };

  render() {
    const { events, isLoading } = this.state;
    const { transactionId } = this.props.match.params;
    const groupedWorkflow = groupWorkflowById(events);
    return (
      <Container>
        <Button type="primary" icon="reload" onClick={this.getTransactionData}>
          Refresh
        </Button>
        {!events.find(
          (event: Event.AllEvent) =>
            event.type === "TRANSACTION" &&
            event.isError === false &&
            [
              State.TransactionStates.Cancelled,
              State.TransactionStates.Compensated,
              State.TransactionStates.Completed,
              State.TransactionStates.Failed
            ].includes(event.details.status)
        ) && (
          <Button
            type="danger"
            icon="rollback"
            onClick={() => this.onCancelButtonClick(transactionId)}
          >
            Cancel transaction
          </Button>
        )}

        <StyledTabs>
          <TabPane tab="Timeline view" key="1">
            <TimelineChart events={events} />
            <EventTable events={events || []} isLoading={isLoading} />
          </TabPane>
          <TabPane tab="Workflows view" key="2">
            {Object.keys(groupedWorkflow)
              .sort((workflowIdA: string, workflowIdB: string) => {
                const workflowDataA = groupedWorkflow[workflowIdA];
                const workflowDataB = groupedWorkflow[workflowIdB];
                return (
                  R.pathOr(0, ["timestamp"], workflowDataA) -
                  R.pathOr(0, ["timestamp"], workflowDataB)
                );
              })
              .map((workflowId: string) => {
                const workflowData = groupedWorkflow[workflowId];
                return (
                  <WorkflowChart
                    key={workflowId}
                    workflowDefinition={workflowData.workflowDefinition}
                    tasksData={workflowData.tasksData}
                  />
                );
              })}
          </TabPane>
        </StyledTabs>
      </Container>
    );
  }
}

export default TransactionTable;
