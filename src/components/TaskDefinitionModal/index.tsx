import { TaskDefinition } from "@melonade/melonade-declaration";
import { Form, Input, InputNumber, Modal, Typography } from "antd";
import * as R from "ramda";
import React from "react";
import styled from "styled-components";

const StyledNumberInput = styled(InputNumber)`
  width: 100%;
`;

interface IProps {
  visible?: boolean;
  onSubmit: (taskDefinition: TaskDefinition.ITaskDefinition) => void;
  onCancel: () => void;
  taskDefinition?: TaskDefinition.ITaskDefinition;
  title: string;
  errorMessage?: string;
}

interface IState {
  taskDefinition?: TaskDefinition.ITaskDefinition;
}

export default class TaskDefinitionModal extends React.Component<
  IProps,
  IState
> {
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
    const { errorMessage } = this.props;
    const { taskDefinition } = this.state;
    return (
      <Modal
        title={this.props.title}
        visible={this.props.visible}
        onOk={() =>
          this.props.onSubmit(taskDefinition as TaskDefinition.ITaskDefinition)
        }
        onCancel={this.props.onCancel}
      >
        <Form>
          <Form.Item label="Name">
            <Input
              placeholder="The uniq name of task"
              value={R.path(["name"], taskDefinition) as any}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                this.onInputChanged(["name"], event.target.value);
              }}
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input
              placeholder="The description of task"
              value={R.path(["description"], taskDefinition) as any}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                this.onInputChanged(["description"], event.target.value);
              }}
            />
          </Form.Item>
          <Form.Item label="Ack Timeout">
            <StyledNumberInput
              placeholder="Time before task time out (ms)"
              value={R.path(["ackTimeout"], taskDefinition) as any}
              onChange={(value?: number) => {
                this.onInputChanged(["ackTimeout"], value);
              }}
            />
          </Form.Item>
          <Form.Item label="Timeout">
            <StyledNumberInput
              placeholder="Time before task time out (ms)"
              value={R.path(["timeout"], taskDefinition) as any}
              onChange={(value?: number) => {
                this.onInputChanged(["timeout"], value);
              }}
            />
          </Form.Item>
          <Form.Item label="Retry Delay">
            <StyledNumberInput
              placeholder="Wait (ms) before restart the task"
              value={R.path(["retry", "delay"], taskDefinition) as any}
              onChange={(value?: number) => {
                this.onInputChanged(["retry", "delay"], value);
              }}
            />
          </Form.Item>
          <Form.Item label="Retry Limit">
            <StyledNumberInput
              placeholder="Time that task can retry if failed"
              value={R.path(["retry", "limit"], taskDefinition) as any}
              onChange={(value?: number) => {
                this.onInputChanged(["retry", "limit"], value);
              }}
            />
          </Form.Item>
          {errorMessage ? (
            <Typography.Text type="danger">{errorMessage}</Typography.Text>
          ) : null}
        </Form>
      </Modal>
    );
  }
}
