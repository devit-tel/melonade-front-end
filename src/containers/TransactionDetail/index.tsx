import { Event, State, Task, WorkflowDefinition } from "@melonade/melonade-declaration";
import { Button, Icon, Table, Tabs, Typography } from "antd";
import { headerCase } from "change-case";
import moment from "moment";
import * as R from "ramda";
import React from "react";
import { Chart } from "react-google-charts";
import { RouteComponentProps } from "react-router";
import styled from "styled-components";
import JsonViewModal from "../../components/JsonViewModal";
import StatusText from "../../components/StatusText";
import TimelineChart from '../../components/TimelineChart';
import WorkflowChart from "../../components/WorkflowChart";
import { getTransactionData } from "../../services/eventLogger/http";

const { TabPane } = Tabs;

const Container = styled.div`
  overflow: hidden;
`;

const StyledTabs = styled(Tabs)``;

interface ITransactionParams {
  transactionId: string;
}

interface IProps extends RouteComponentProps<ITransactionParams> { }

interface IState {
  events: Event.AllEvent[];
  isLoading: boolean;
  selectedEventIndex?: number;
}

const isNumber = R.is(Number);

const getName = (event: Event.AllEvent) => {
  switch (true) {
    case event.isError === false && event.type === "WORKFLOW":
      return (
        <Typography.Text code>
          {`${event.details.workflowDefinition.name} / ${event.details.workflowDefinition.rev}`}
        </Typography.Text>
      );
    case event.isError === false && event.type === "TASK":
      return (
        <Typography.Text code>
          {`${event.details.taskName || "-"} (${
            event.details.taskReferenceName
            })`}
        </Typography.Text>
      );
    default:
      return undefined;
  }
};

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

const getTimelineDataFromEvents = (
  events: Event.AllEvent[]
): [string, string, Date, Date][] => {
  const validEvents = R.reverse(
    events.filter((event: Event.AllEvent) => !event.isError)
  );

  const startNodeOfEachType = validEvents.filter((event: Event.AllEvent) => {
    if (event.isError === true) return false;

    if (event.type === "TASK") {
      if (event.details.status === State.TaskStates.Scheduled) return true;
      return false;
    }

    if (event.type === "WORKFLOW") {
      if (event.details.status === State.WorkflowStates.Running) return true;
      return false;
    }

    if (event.type === "TRANSACTION") {
      if (event.details.status === State.TransactionStates.Running) return true;
      return false;
    }

    return false;
  });

  return startNodeOfEachType.map((event: Event.AllEvent) => {
    if (event.type === "TASK") {
      const lastTaskEvent = R.findLast(
        (taskEvent: Event.AllEvent) =>
          taskEvent.type === "TASK" &&
          event.details.taskId === taskEvent.details.taskId &&
          taskEvent.details.status !== State.TaskStates.Scheduled,
        validEvents as Event.ITaskEvent[]
      );

      let endTimestamp: number = lastTaskEvent
        ? lastTaskEvent.timestamp
        : Date.now();

      if (endTimestamp < event.timestamp) endTimestamp = event.timestamp + 1;

      if (
        [Task.TaskTypes.Task, Task.TaskTypes.Compensate].includes(
          R.pathOr(Task.TaskTypes.Task, ["details", "type"], event)
        )
      ) {
        return [
          "Task",
          R.pathOr("-", ["details", "taskName"], event),
          new Date(event.timestamp),
          new Date(endTimestamp)
        ];
      }
      return [
        "Task",
        R.pathOr("-", ["details", "type"], event),
        new Date(event.timestamp),
        new Date(endTimestamp)
      ];
    }

    if (event.type === "WORKFLOW") {
      const lastWorkflowEvent = R.findLast(
        (workflowEvent: Event.AllEvent) =>
          workflowEvent.type === "WORKFLOW" &&
          event.details.workflowId === workflowEvent.details.workflowId &&
          workflowEvent.details.status !== State.WorkflowStates.Running,
        validEvents as Event.IWorkflowEvent[]
      );

      let endTimestamp: number = lastWorkflowEvent
        ? lastWorkflowEvent.timestamp
        : Date.now();

      if (endTimestamp < event.timestamp) endTimestamp = event.timestamp + 1;

      return [
        "Workflow",
        `${R.pathOr(
          "-",
          ["details", "workflowDefinition", "name"],
          event
        )} / ${R.pathOr("-", ["details", "workflowDefinition", "rev"], event)}`,
        new Date(event.timestamp),
        new Date(endTimestamp)
      ];
    }

    if (event.type === "TRANSACTION") {
      const lastTransactionEvent = R.findLast(
        (transactionEvent: Event.AllEvent) =>
          transactionEvent.type === "TRANSACTION" &&
          event.details.transactionId ===
          transactionEvent.details.transactionId &&
          transactionEvent.details.status !== State.TransactionStates.Running,
        validEvents as Event.ITransactionEvent[]
      );

      let endTimestamp: number = lastTransactionEvent
        ? lastTransactionEvent.timestamp
        : Date.now();

      if (endTimestamp < event.timestamp) endTimestamp = event.timestamp + 1;

      return [
        "Transaction",
        event.details.transactionId,
        new Date(event.timestamp),
        new Date(endTimestamp)
      ];
    }

    return [event.type, "Error", new Date(event.timestamp), new Date()];
  });
};

class TransactionTable extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      events: [],
      isLoading: false,
      selectedEventIndex: undefined
    };
  }

  columns = [
    {
      title: "Event Type",
      dataIndex: "type",
      key: "type",
      render: (type: string, _event: Event.AllEvent, index: number) => (
        <Button
          type="link"
          block
          onClick={() =>
            this.setState({
              selectedEventIndex: index
            })
          }
        >
          {headerCase(type)}
        </Button>
      )
    },
    {
      title: "Is Valid",
      dataIndex: "isError",
      key: "isError",
      render: (isError: boolean, event: Event.AllEvent) =>
        isError ? (
          <span>
            <Icon
              type="exclamation-circle"
              theme="twoTone"
              twoToneColor="#eb2f96"
            />
            {R.path(["error"], event)}
          </span>
        ) : (
            <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
          )
    },
    {
      title: "Workflow / Task",
      key: "details",
      render: (_text: string, event: Event.AllEvent) => getName(event)
    },
    {
      title: "Type",
      dataIndex: "details.type",
      key: "details.type",
      render: (type: Event.AllEvent["details"]["type"]) =>
        type ? <Typography.Text code>{type}</Typography.Text> : undefined
    },
    {
      title: "Status",
      dataIndex: "details.status",
      key: "details.status",
      render: (status: Event.AllEvent["details"]["status"]) => (
        <StatusText status={status} />
      )
    },
    {
      title: "Updated At",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: number) => (
        <Typography.Text>
          {moment(timestamp).format("YYYY/MM/DD HH:mm:ss.SSS")}
        </Typography.Text>
      )
    }
  ];

  getTransactionData = async () => {
    this.setState({ isLoading: true });
    const { transactionId } = this.props.match.params;

    try {
      const events = await getTransactionData(transactionId);
      this.setState({ events, isLoading: false });
    } catch (error) {
      this.setState({ isLoading: false });
    }
  };

  componentDidMount = async () => {
    this.getTransactionData();
  };

  render() {
    const { events, isLoading, selectedEventIndex } = this.state;
    const isEventSelecting = isNumber(selectedEventIndex);
    const groupedWorkflow = groupWorkflowById(events);
    return (
      <Container>
        <StyledTabs>
          <TabPane tab="Timeline view" key="1">
            <JsonViewModal
              // @ts-ignore: Fuck the TS lint
              data={isEventSelecting ? events[selectedEventIndex] : []}
              visible={isEventSelecting}
              onClose={() => this.setState({ selectedEventIndex: undefined })}
            />
            <TimelineChart events={events} />
            <Chart
              width={"100%"}
              height={"250px"}
              chartType="Timeline"
              data={[
                [
                  { type: "string", id: "Type" },
                  { type: "string", id: "Name" },
                  { type: "date", id: "Start" },
                  { type: "date", id: "End" }
                ],
                ...getTimelineDataFromEvents(events)
              ]}
            />
            <Table
              columns={this.columns}
              dataSource={events}
              pagination={false}
              loading={isLoading}
            />
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
