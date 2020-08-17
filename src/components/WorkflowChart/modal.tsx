import {
  Task,
  TaskDefinition,
  WorkflowDefinition,
} from "@melonade/melonade-declaration";
import { Form, Input, Modal, Select } from "antd";
import * as R from "ramda";
import React from "react";
import styled from "styled-components";
import JsonEditor from "../../components/JsonEditor";

const { Option } = Select;

const StyledInput = styled(Input)`
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
        type: Task.TaskTypes.Task,
      } as any,
    };
  }

  componentWillReceiveProps(nextProps: ICreateTaskModalProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        task: nextProps.task,
      });
    }
  }

  onInputChanged = (path: (string | number)[], value: any) => {
    this.setState({
      task: R.set(R.lensPath(path), value, this.state.task),
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
              <Option value={Task.TaskTypes.Schedule}>Schedule</Option>
              <Option value={Task.TaskTypes.SubTransaction}>
                Sub-transaction
              </Option>
              <Option value={Task.TaskTypes.DynamicTask}>Dynamic Task</Option>
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
                <StyledInput
                  placeholder="Retry Limit"
                  value={R.path(["retry", "limit"], this.state.task) as any}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    this.onInputChanged(["retry", "limit"], e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Retry Delay">
                <StyledInput
                  placeholder="Retry Delay"
                  value={R.path(["retry", "delay"], this.state.task) as any}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    this.onInputChanged(["retry", "delay"], e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Ack Timeout">
                <StyledInput
                  placeholder="Ack Timeout"
                  value={R.path(["ackTimeout"], this.state.task) as any}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    this.onInputChanged(["ackTimeout"], e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Timeout">
                <StyledInput
                  placeholder="Timeout"
                  value={R.path(["timeout"], this.state.task) as any}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    this.onInputChanged(["timeout"], e.target.value);
                  }}
                />
              </Form.Item>

              <JsonEditor
                key={`${this.props.visible}`} // Remount every time
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

          {R.pathEq(["task", "type"], Task.TaskTypes.Schedule, this.state) && (
            <React.Fragment>
              <p>
                You still able to use input template e.g. $
                {"{workflow.input.whenToStart}"}
              </p>
              <Form.Item label="Completed After">
                <Input
                  placeholder="Delay milliseconds before task completed"
                  value={R.path(
                    ["inputParameters", "completedAfter"],
                    this.state.task
                  )}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const value = isNaN(event.target.value as any)
                      ? event.target.value
                      : +event.target.value;

                    this.onInputChanged(
                      ["inputParameters", "completedAfter"],
                      value
                    );
                  }}
                />
              </Form.Item>
              <Form.Item label="Completed At">
                <Input
                  placeholder="ISO 8601 date"
                  value={
                    R.path(
                      ["inputParameters", "completedAt"],
                      this.state.task
                    ) as string
                  }
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    this.onInputChanged(
                      ["inputParameters", "completedAt"],
                      event.target.value
                    );
                  }}
                />{" "}
              </Form.Item>
              <Form.Item label="Completed When">
                <Input
                  placeholder='crontab e.g. "*/5 * * * 0"'
                  value={
                    R.path(
                      ["inputParameters", "completedWhen"],
                      this.state.task
                    ) as string
                  }
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    this.onInputChanged(
                      ["inputParameters", "completedWhen"],
                      event.target.value
                    );
                  }}
                />
              </Form.Item>
            </React.Fragment>
          )}

          {R.pathEq(
            ["task", "type"],
            Task.TaskTypes.SubTransaction,
            this.state
          ) && (
            <React.Fragment>
              <p>
                You still able to use input template e.g. $
                {"{workflow.input.workflowToStart}"}
              </p>
              <Form.Item label="Workflow name">
                <Input
                  placeholder="Name of the workflow"
                  value={R.path(
                    ["inputParameters", "workflowName"],
                    this.state.task
                  )}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const value = isNaN(event.target.value as any)
                      ? event.target.value
                      : +event.target.value;

                    this.onInputChanged(
                      ["inputParameters", "workflowName"],
                      value
                    );
                  }}
                />
              </Form.Item>
              <Form.Item label="Workflow rev">
                <Input
                  placeholder="Revision of the workflow"
                  value={
                    R.path(
                      ["inputParameters", "workflowRev"],
                      this.state.task
                    ) as string
                  }
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    this.onInputChanged(
                      ["inputParameters", "workflowRev"],
                      event.target.value
                    );
                  }}
                />{" "}
              </Form.Item>
              <JsonEditor
                key={`${this.props.visible}`} // Remount every time
                data={
                  R.path(["inputParameters", "input"], this.state.task) || {}
                }
                onChange={(data: any) => {
                  this.onInputChanged(["inputParameters", "input"], data);
                }}
              />
            </React.Fragment>
          )}
          {R.pathEq(
            ["task", "type"],
            Task.TaskTypes.DynamicTask,
            this.state
          ) && (
            <Form.Item label="Task list">
              <Input
                // eslint-disable-next-line no-template-curly-in-string
                placeholder="list of task to create  (Array of Task e.g. ${workflow.input.tasks})"
                value={
                  R.path(
                    ["inputParameters", "tasks"],
                    this.state.task
                  ) as string
                }
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  this.onInputChanged(
                    ["inputParameters", "tasks"],
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
      caseName: "",
    };
  }

  componentWillReceiveProps(nextProps: ICreateDecisionCaseModalProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        caseName: nextProps.caseName,
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
          disabled: !!caseName && !!decisionCases && !!decisionCases[caseName],
        }}
      >
        <Form>
          <Form.Item label="Decision case">
            <Input
              placeholder="Decision case"
              value={caseName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                this.setState({
                  caseName: event.target.value,
                });
              }}
            />
          </Form.Item>
        </Form>
      </StyledModal>
    );
  }
}
