import { Task, WorkflowDefinition } from "@melonade/melonade-declaration";
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
  onSubmit: (task: WorkflowDefinition.AllTaskType) => void;
}

interface IState {
  task: WorkflowDefinition.ITaskTask;
}

export class CreateTaskModal extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      task: {
        type: Task.TaskTypes.Task
      } as any
    };
  }

  onInputChanged = (path: (string | number)[], value: any) => {
    this.setState({
      task: R.set(R.lensPath(path), value, this.state.task)
    });
  };

  render() {
    return (
      <Modal title="Insert task" visible={this.props.visible}>
        <Form>
          <Form.Item label="Type">
            <Select
              defaultValue={Task.TaskTypes.Task}
              value={R.path(["type"], this.state.task) as any}
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
              value={R.path(["taskReferenceName"], this.state.task) as any}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                this.onInputChanged(["taskReferenceName"], event.target.value);
              }}
            />
          </Form.Item>
          {R.pathEq(["task", "type"], Task.TaskTypes.Task, this.state) && (
            <React.Fragment>
              <Form.Item label="Task Name">
                <Select
                  value={R.path(["name"], this.state.task) as any}
                  onSelect={(value: Task.TaskTypes) =>
                    this.onInputChanged(["name"], value)
                  }
                >
                  <Option value={Task.TaskTypes.Task}>Task</Option>
                  <Option value={Task.TaskTypes.Parallel}>Parallel</Option>
                  <Option value={Task.TaskTypes.Decision}>Decision</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Retry Limit">
                <StyledNumberInput
                  min={0}
                  placeholder="Retry Limit"
                  value={R.path(["retry", "limit"], this.state.task) as any}
                  onChange={(value?: number) => {
                    this.onInputChanged(["retry", "limit"], value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Retry Delay">
                <StyledNumberInput
                  min={0}
                  placeholder="Retry Delay"
                  value={R.path(["retry", "delay"], this.state.task) as any}
                  onChange={(value?: number) => {
                    this.onInputChanged(["retry", "delay"], value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Ack Timeout">
                <StyledNumberInput
                  min={0}
                  placeholder="Ack Timeout"
                  value={R.path(["ackTimeout"], this.state.task) as any}
                  onChange={(value?: number) => {
                    this.onInputChanged(["ackTimeout"], value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Timeout">
                <StyledNumberInput
                  min={0}
                  placeholder="Timeout"
                  value={R.path(["timeout"], this.state.task) as any}
                  onChange={(value?: number) => {
                    this.onInputChanged(["timeout"], value);
                  }}
                />
              </Form.Item>
            </React.Fragment>
          )}
        </Form>
      </Modal>
    );
  }
}
