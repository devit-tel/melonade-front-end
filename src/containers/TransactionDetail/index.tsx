import { Event } from "@melonade/melonade-declaration";
import { Icon, Table, Typography } from "antd";
import moment from "moment";
import * as R from "ramda";
import React from "react";
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
        <Typography.Text
          code
        >{`${event.details.workflowDefinition.name} / ${event.details.workflowDefinition.rev}`}</Typography.Text>
      );
    case event.isError === false && event.type === "TASK":
      return (
        <Typography.Text code>{`${event.details.taskName || "-"} (${
          event.details.taskReferenceName
        })`}</Typography.Text>
      );
    default:
      return undefined;
  }
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
