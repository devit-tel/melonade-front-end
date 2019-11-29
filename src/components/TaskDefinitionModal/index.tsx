import { Task, TaskDefinition } from "@melonade/melonade-declaration";
import { Form, Input, InputNumber, Modal, Select } from "antd";
import * as R from "ramda";
import React from "react";
import styled from "styled-components";

const { Option } = Select;

const StyledNumberInput = styled(InputNumber)`
  width: 100%;
`;

interface IProps {
  visible?: boolean;
  onSubmit: (task: TaskDefinition.ITaskDefinition) => void;
  onCancel: () => void;
  taskDefinition?: TaskDefinition.ITaskDefinition;
  title: string;
}

interface IState {
  taskDefinition?: TaskDefinition.ITaskDefinition;
}

export class CreateTaskModal extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      taskDefinition: undefined
    };
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        taskDefinition: nextProps.taskDefinition
      });
    }
  }

  onInputChanged = (path: (string | number)[], value: any) => {
    this.setState({
      taskDefinition: R.set(R.lensPath(path), value, this.state.taskDefinition)
    });
  };

  render() {
    return (
      <Modal
        title={this.props.title}
        visible={this.props.visible}
        onOk={() =>
          this.props.onSubmit(
            this.state.taskDefinition as TaskDefinition.ITaskDefinition
          )
        }
        onCancel={this.props.onCancel}
      >
        <Form>
          <Form.Item label="Type">
            <Select
              defaultValue={Task.TaskTypes.Task}
              value={R.path(["type"], this.state.taskDefinition) as any}
              onSelect={(value: Task.TaskTypes) =>
                this.onInputChanged(["type"], value)
              }
            >
              <Option value={Task.TaskTypes.Task}>Task</Option>
              <Option value={Task.TaskTypes.Parallel}>Parallel</Option>
              <Option value={Task.TaskTypes.Decision}>Decision</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Task ReferenceName">
            <Input
              placeholder="Task ReferenceName"
              value={
                R.path(["taskReferenceName"], this.state.taskDefinition) as any
              }
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                this.onInputChanged(["taskReferenceName"], event.target.value);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
