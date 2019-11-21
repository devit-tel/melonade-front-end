import { Event, State } from "@melonade/melonade-declaration";
import { Table, Typography } from "antd";
import moment from "moment";
import * as R from "ramda";
import React from "react";
import { RouteComponentProps } from "react-router";
import JsonViewModal from "../../components/JsonViewModal";
import StatusText from "../../components/StatusText";
import { getTransactionData } from "../../services/eventLogger/http";

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
      title: "TransactionId",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (text: string, _event: Event.AllEvent, index: number) => (
        <a onClick={() => this.setState({ selectedEventIndex: index })}>
          {text}
        </a>
      )
    },
    {
      title: "Status",
      dataIndex: "details.status",
      key: "details.status",
      render: (status: State.TransactionStates) => (
        <StatusText status={status} />
      )
    },
    // {
    //   title: "Workflow",
    //   dataIndex: "details.workflowDefinition.name",
    //   key: "details.workflowDefinition.name",
    //   render: (_text: string, event: Event.AllEvent) => (
    //     <Typography.Text code>
    //       {`${event.details.workflowDefinition.name} / ${event.details.workflowDefinition.rev}`}
    //     </Typography.Text>
    //   )
    // },
    {
      title: "Updated at",
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
        />
      </div>
    );
  }
}

export default TransactionTable;
