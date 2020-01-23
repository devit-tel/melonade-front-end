import { TaskDefinition } from "@melonade/melonade-declaration";
import { Button, Table, Typography } from "antd";
import { ColumnProps } from "antd/lib/table";
import * as R from "ramda";
import React from "react";
import styled from "styled-components";
import TaskDefinitionModal from "../../components/TaskDefinitionModal";
import { createTaskDefinitions, listTaskDefinitions, updateTaskDefinitions } from "../../services/procressManager/http";

const Container = styled.div`
  & > button {
    margin-bottom: 12px;
  }
`;

interface IProps { }

interface IState {
  taskDefinitions: TaskDefinition.ITaskDefinition[];
  isLoading: boolean;
  editingTask?: TaskDefinition.ITaskDefinition;
  showModal: boolean;
  errorMessage?: string;
}

const sortByPath = (path: (string | number)[]) => (a: any, b: any): number => {
  if ((R.path(path, a) as any) > (R.path(path, b) as any)) return 1;
  return -1;
};

class TransactionTable extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      taskDefinitions: [],
      isLoading: false,
      showModal: false
    };
  }

  columns: ColumnProps<TaskDefinition.ITaskDefinition>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, data: TaskDefinition.ITaskDefinition) => (
        <Button
          type="link"
          onClick={() => {
            this.setState({
              showModal: true,
              editingTask: data
            });
          }}
        >
          {name}
        </Button>
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

  handleModalSubmit = async (
    taskDefinition: TaskDefinition.ITaskDefinition
  ) => {
    try {
      if (this.state.editingTask) {
        // Create
        await updateTaskDefinitions(taskDefinition);
      } else {
        // Update
        await createTaskDefinitions(taskDefinition);
      }
      this.setState({
        showModal: false,
        editingTask: undefined
      });

    } catch (error) {
      const errorResp = R.path(["response", "data", "error", "message"], error);

      this.setState({
        errorMessage: errorResp ? JSON.stringify(errorResp) : error.toString()
      });
    } finally {
      await this.listTaskDefinitions();
    }
  };

  componentDidMount = async () => {
    this.listTaskDefinitions();
  };

  render() {
    const {
      taskDefinitions,
      isLoading,
      editingTask,
      errorMessage
    } = this.state;
    return (
      <Container>
        <Button
          type="primary"
          onClick={() => this.setState({ showModal: true })}
        >
          Create Task Definition
        </Button>
        <Table
          columns={this.columns}
          dataSource={taskDefinitions}
          pagination={false}
          loading={isLoading}
        />
        <TaskDefinitionModal
          title={
            R.isNil(editingTask)
              ? "Create Task Definition"
              : "Edit Task Definition"
          }
          visible={this.state.showModal}
          onCancel={() =>
            this.setState({ showModal: false, editingTask: undefined })
          }
          onSubmit={this.handleModalSubmit}
          taskDefinition={editingTask}
          errorMessage={errorMessage}
        />
      </Container>
    );
  }
}

export default TransactionTable;
