import { Event, State } from "@melonade/melonade-declaration";
import { Icon, Table, Typography } from "antd";
import moment from "moment";
import * as R from "ramda";
import React from "react";
import { Chart } from "react-google-charts";
import { RouteComponentProps } from "react-router";
import styled from "styled-components";
import JsonViewModal from "../../components/JsonViewModal";
import StatusText from "../../components/StatusText";
import { getTransactionData } from "../../services/eventLogger/http";

const StyledTable = styled(Table)`
  .ant-table-row {
    cursor: pointer;
  }
`;

interface ITransactionParams {
  transactionId: string;
}

interface IProps extends RouteComponentProps<ITransactionParams> {}

interface IState {
  events: Event.AllEvent[];
  mode: "table" | "timeline" | "uml";
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
  });

  return startNodeOfEachType.map((event: Event.AllEvent) => {
    if (event.type === "TASK") {
      const lastTaskEvent = R.findLast(
        (taskEvent: Event.ITaskEvent) =>
          event.details.taskId === taskEvent.details.taskId &&
          taskEvent.details.status !== State.TaskStates.Scheduled,
        validEvents as Event.ITaskEvent[]
      );

      let endTimestamp: number = lastTaskEvent
        ? lastTaskEvent.timestamp
        : Date.now();

      if (endTimestamp < event.timestamp) endTimestamp = event.timestamp + 1;

      return [
        "Task",
        R.pathOr("-", ["details", "taskName"], event),
        new Date(event.timestamp),
        new Date(endTimestamp)
      ];
    }

    if (event.type === "WORKFLOW") {
      const lastWorkflowEvent = R.findLast(
        (workflowEvent: Event.IWorkflowEvent) =>
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
        (transactionEvent: Event.ITransactionEvent) =>
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

const DateFormat = moment()
  .locale(navigator.languages ? navigator.languages[0] : navigator.language)
  .localeData()
  .longDateFormat("LLL");

class TransactionTable extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      events: [],
      mode: "table",
      isLoading: false,
      selectedEventIndex: undefined
    };
  }

  columns = [
    {
      title: "Event Type",
      dataIndex: "type",
      key: "type"
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
          {moment(timestamp).format(DateFormat)}
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
    return (
      <div>
        <Chart
          width={"100%"}
          height={"300px"}
          chartType="Timeline"
          loader={<div>Loading Chart</div>}
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
        <JsonViewModal
          // @ts-ignore: Fuck the TS lint
          data={isEventSelecting ? events[selectedEventIndex] : []}
          visible={isEventSelecting}
          onClose={() => this.setState({ selectedEventIndex: undefined })}
        />
        <Table
          columns={this.columns}
          dataSource={events}
          pagination={false}
          loading={isLoading}
          onRowClick={(_event: Event.AllEvent, index: number) =>
            this.setState({ selectedEventIndex: index })
          }
        />
      </div>
    );
  }
}

export default TransactionTable;
