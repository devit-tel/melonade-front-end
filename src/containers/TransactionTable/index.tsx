import { Event } from "@melonade/melonade-declaration";
import { Divider, Table, Tag } from "antd";
import React from "react";
import { listTransaction } from "../../services/eventLogger/http";

interface IProps {}

interface IState {
  transactionEvents: Event.ITransactionEvent[];
}

const columns = [
  {
    title: "TransactionId",
    dataIndex: "transactionId",
    key: "transactionId",
    render: (text: string) => <a>{text}</a>
  },
  {
    title: "Status",
    dataIndex: "details.status",
    key: "details.status",
    render: (status: string) => (
      <Tag color="green" key={status}>
        {status.toUpperCase()}
      </Tag>
    )
  },
  {
    title: "Workflow",
    dataIndex: "details.workflowDefinition.name",
    key: "details.workflowDefinition.name",
    render: (_text: string, event: Event.ITransactionEvent) => (
      <span>
        <a>{event.details.workflowDefinition.name}</a>
        <Divider type="vertical" />
        <a>{event.details.workflowDefinition.rev}</a>
      </span>
    )
  },
  {
    title: "Updated at",
    dataIndex: "timestamp",
    key: "timestamp",
    render: (timestamp: number) => (
      <span>
        <a>{timestamp}</a>
      </span>
    )
  }
];

class TransactionTable extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      transactionEvents: []
    };
  }

  componentDidMount = async () => {
    const transactionEvents = await listTransaction([], 0, Date.now(), 0, 100);
    this.setState({ transactionEvents });
  };

  render() {
    const { transactionEvents } = this.state;
    return (
      <div>
        <Table columns={columns} dataSource={transactionEvents} />
      </div>
    );
  }
}

export default TransactionTable;
