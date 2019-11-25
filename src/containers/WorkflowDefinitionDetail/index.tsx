import { WorkflowDefinition } from "@melonade/melonade-declaration";
import { Table, Typography } from "antd";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import { listWorkflowDefinitions } from "../../services/procressManager/http";

interface IProps {}

interface IState {
  workflowDefinitions: WorkflowDefinition.IWorkflowDefinition[];
  isLoading: boolean;
}

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (name: string, { rev }: WorkflowDefinition.IWorkflowDefinition) => (
      <Link to={`${name}/${rev}`}>{name}</Link>
    )
  },
  {
    title: "Revision",
    dataIndex: "rev",
    key: "rev",
    render: (rev: string, { name }: WorkflowDefinition.IWorkflowDefinition) => (
      <Link to={`${name}/${rev}`}>{rev}</Link>
    )
  },
  {
    title: "Failure Strategy",
    dataIndex: "failureStrategy",
    key: "failureStrategy",
    render: (failureStrategy: string) => (
      <Typography.Text code>{failureStrategy}</Typography.Text>
    )
  },
  {
    title: "Updated at",
    dataIndex: "timestamp",
    key: "timestamp",
    render: (timestamp: number) => (
      <Typography.Text>
        {moment(timestamp).format("YYYY/MM/DD HH:mm:ss.SSS")}
      </Typography.Text>
    )
  }
];

class TransactionTable extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      workflowDefinitions: [],
      isLoading: false
    };
  }

  listWorkflowDefinitions = async (page?: number) => {
    this.setState({ isLoading: true });
    try {
      const workflowDefinitions = await listWorkflowDefinitions();
      console.log(workflowDefinitions);
      this.setState({
        workflowDefinitions,
        isLoading: false
      });
    } catch (error) {
      this.setState({
        isLoading: false,
        workflowDefinitions: []
      });
    }
  };

  componentDidMount = async () => {
    this.listWorkflowDefinitions();
  };

  render() {
    const { workflowDefinitions, isLoading } = this.state;
    return (
      <div>
        <Table
          columns={columns}
          dataSource={workflowDefinitions}
          pagination={false}
          loading={isLoading}
        />
      </div>
    );
  }
}

export default TransactionTable;
