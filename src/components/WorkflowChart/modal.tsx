import {
  Task,
  TaskDefinition,
  WorkflowDefinition
} from "@melonade/melonade-declaration";
import { Form, Input, InputNumber, Modal, Select } from "antd";
import * as R from "ramda";
import React from "react";
import styled from "styled-components";
import JsonEditor from "../../components/JsonEditor";

const { Option } = Select;

const StyledNumberInput = styled(InputNumber)`
  width: 100%;
`;

const StyledModal = styled(Modal)`
  min-width: 70vw;
`;

interface ICreateTaskModalProps {
  visible?: boolean;
  onSubmit: (task: WorkflowDefinition.AllTaskType) => void;
  onCancel: () => void;
  task?: WorkflowDefinition.ITaskTask;
  taskDefinitions: TaskDefinition.ITaskDefinition[];
}

interface ICreateTaskModalState {
  task?: WorkflowDefinition.ITaskTask;
}

export class CreateTaskModal extends React.Component<
  ICreateTaskModalProps,
  ICreateTaskModalState
> {
  constructor(props: ICreateTaskModalProps) {
    super(props);

    this.state = {
      task: {
        type: Task.TaskTypes.Task
      } as any
    };
  }

  componentWillReceiveProps(nextProps: ICreateTaskModalProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        task: nextProps.task
      });
    }
  }

  onInputChanged = (path: (string | number)[], value: any) => {
    this.setState({
      task: R.set(R.lensPath(path), value, this.state.task)
    });
  };

  render() {
    return (
      <StyledModal
        title="Insert task"
        visible={this.props.visible}
        onOk={() => {
          this.props.onSubmit(this.state.task as WorkflowDefinition.ITaskTask);
        }}
        onCancel={this.props.onCancel}
      >
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
                  showSearch
                  value={R.path(["name"], this.state.task) as any}
                  onSelect={(value: Task.TaskTypes) =>
                    this.onInputChanged(["name"], value)
                  }
                >
                  {this.props.taskDefinitions.map(
                    (taskDefinition: TaskDefinition.ITaskDefinition) => {
                      return (
                        <Option
                          key={taskDefinition.name}
                          value={taskDefinition.name}
                        >
                          {taskDefinition.name}
                        </Option>
                      );
                    }
                  )}
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

              <JsonEditor
                data={R.path(["inputParameters"], this.state.task) || {}}
                onChange={(data: any) => {
                  this.onInputChanged(["inputParameters"], data);
                }}
              />
            </React.Fragment>
          )}

          {R.pathEq(["task", "type"], Task.TaskTypes.Decision, this.state) && (
            <Form.Item label="Case path">
              <Input
                // eslint-disable-next-line no-template-curly-in-string
                placeholder="path it get case value (e.g. ${workflow.input.paymentType})"
                value={
                  R.path(["inputParameters", "case"], this.state.task) as string
                }
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  this.onInputChanged(
                    ["inputParameters", "case"],
                    event.target.value
                  );
                }}
              />
            </Form.Item>
          )}
        </Form>
      </StyledModal>
    );
  }
}

interface ICreateDecisionCaseModalProps {
  visible?: boolean;
  onSubmit: (caseName: string) => void;
  onCancel: () => void;
  decisionCases?: { [caseName: string]: WorkflowDefinition.AllTaskType[] };
  caseName?: string;
}

interface ICreateDecisionCaseModalState {
  caseName?: string;
}

export class CreateDecisionCaseModal extends React.Component<
  ICreateDecisionCaseModalProps,
  ICreateDecisionCaseModalState
> {
  constructor(props: ICreateDecisionCaseModalProps) {
    super(props);

    this.state = {
      caseName: ""
    };
  }

  componentWillReceiveProps(nextProps: ICreateDecisionCaseModalProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        caseName: nextProps.caseName
      });
    }
  }

  render() {
    const { visible, onSubmit, onCancel, decisionCases } = this.props;
    const { caseName } = this.state;
    return (
      <StyledModal
        title="Insert task"
        visible={visible}
        onOk={() => onSubmit(this.state.caseName || "")}
        onCancel={onCancel}
        okButtonProps={{
          disabled: !!caseName && !!decisionCases && !!decisionCases[caseName]
        }}
      >
        <Form>
          <Form.Item label="Decision case">
            <Input
              placeholder="Decision case"
              value={caseName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({
                  caseName: event.target.value
                });
              }}
            />
          </Form.Item>
        </Form>
      </StyledModal>
    );
  }
}
