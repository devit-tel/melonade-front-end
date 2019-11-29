import { WorkflowDefinition } from "@melonade/melonade-declaration";
import { Button, Table, Typography } from "antd";
import { ColumnProps } from "antd/lib/table";
import * as R from "ramda";
import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import styled from "styled-components";
import { listWorkflowDefinitions } from "../../services/procressManager/http";

const Container = styled.div`
  & > button {
    margin-bottom: 12px;
  }
`;

interface IProps extends RouteComponentProps {}

interface IState {
  workflowDefinitions: WorkflowDefinition.IWorkflowDefinition[];
  isLoading: boolean;
}

const sortByPath = (path: (string | number)[]) => (a: any, b: any): number => {
  if ((R.path(path, a) as any) > (R.path(path, b) as any)) return 1;
  return -1;
};

const columns: ColumnProps<WorkflowDefinition.IWorkflowDefinition>[] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (name: string, { rev }: WorkflowDefinition.IWorkflowDefinition) => (
      <Link to={`/definition/workflow/${name}/${rev}`}>{name}</Link>
    ),
    sortDirections: ["ascend", "descend"],
    sorter: sortByPath(["name"])
  },
  {
    title: "Revision",
    dataIndex: "rev",
    key: "rev",
    render: (rev: string, { name }: WorkflowDefinition.IWorkflowDefinition) => (
      <Link to={`/definition/workflow/${name}/${rev}`}>{rev}</Link>
    ),
    sortDirections: ["ascend", "descend"],
    sorter: sortByPath(["rev"])
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    render: (description: string) => (
      <Typography.Text>{description}</Typography.Text>
    )
  },
  {
    title: "Failure Strategy",
    dataIndex: "failureStrategy",
    key: "failureStrategy",
    render: (failureStrategy: string) => (
      <Typography.Text code>{failureStrategy}</Typography.Text>
    ),
    sortDirections: ["ascend", "descend"],
    sorter: sortByPath(["failureStrategy"])
  },
  {
    title: "Retry Limit",
    dataIndex: "retry.limit",
    key: "retry.limit",
    render: (limit: number) => <Typography.Text>{limit}</Typography.Text>,
    sortDirections: ["ascend", "descend"],
    sorter: sortByPath(["retry", "limit"])
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

  listWorkflowDefinitions = async () => {
    this.setState({ isLoading: true });
    try {
      const workflowDefinitions = await listWorkflowDefinitions();
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
      <Container>
        <Button
          type="primary"
          onClick={() => this.props.history.push("/definition/workflow/create")}
        >
          Create Workflow Definition
        </Button>
        <Table
          columns={columns}
          dataSource={workflowDefinitions}
          pagination={false}
          loading={isLoading}
        />
      </Container>
    );
  }
}

export default TransactionTable;
