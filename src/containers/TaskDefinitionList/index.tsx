import { TaskDefinition } from "@melonade/melonade-declaration";
import { Table, Typography } from "antd";
import { ColumnProps } from "antd/lib/table";
import * as R from "ramda";
import React from "react";
import { Link } from "react-router-dom";
import { listTaskDefinitions } from "../../services/procressManager/http";

interface IProps {}

interface IState {
  taskDefinitions: TaskDefinition.ITaskDefinition[];
  isLoading: boolean;
  editingTaskIndex?: number;
}

const sortByPath = (path: (string | number)[]) => (a: any, b: any): number => {
  if ((R.path(path, a) as any) > (R.path(path, b) as any)) return 1;
  return -1;
};

const columns: ColumnProps<TaskDefinition.ITaskDefinition>[] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (name: string) => (
      <Link to={`/definition/task/${name}`}>{name}</Link>
    ),
    sortDirections: ["ascend", "descend"],
    sorter: sortByPath(["name"])
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    render: (description: string) => (
      <Typography.Text>{description}</Typography.Text>
    ),
    sortDirections: ["ascend", "descend"],
    sorter: sortByPath(["description"])
  },
  {
    title: "Ack Timeout (ms)",
    dataIndex: "ackTimeout",
    key: "ackTimeout",
    render: (ackTimeout: number) => (
      <Typography.Text>{ackTimeout}</Typography.Text>
    ),
    sortDirections: ["ascend", "descend"],
    sorter: sortByPath(["ackTimeout"])
  },
  {
    title: "Timeout (ms)",
    dataIndex: "timeout",
    key: "timeout",
    render: (Timeout: number) => <Typography.Text>{Timeout}</Typography.Text>,
    sortDirections: ["ascend", "descend"],
    sorter: sortByPath(["timeout"])
  },
  {
    title: "Retry Limit",
    dataIndex: "retry.limit",
    key: "retry.limit",
    render: (limit: number) => <Typography.Text>{limit}</Typography.Text>,
    sortDirections: ["ascend", "descend"],
    sorter: sortByPath(["retry", "limit"])
  },
  {
    title: "Retry Delay (ms)",
    dataIndex: "retry.delay",
    key: "retry.delay",
    render: (delay: number) => <Typography.Text>{delay}</Typography.Text>,
    sortDirections: ["ascend", "descend"],
    sorter: sortByPath(["retry", "delay"])
  }
];

class TransactionTable extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      taskDefinitions: [],
      isLoading: false
    };
  }

  listTaskDefinitions = async () => {
    this.setState({ isLoading: true });
    try {
      const taskDefinitions = await listTaskDefinitions();
      this.setState({
        taskDefinitions: taskDefinitions,
        isLoading: false
      });
    } catch (error) {
      this.setState({
        isLoading: false,
        taskDefinitions: []
      });
    }
  };

  componentDidMount = async () => {
    this.listTaskDefinitions();
  };

  render() {
    const { taskDefinitions: workflowDefinitions, isLoading } = this.state;
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
