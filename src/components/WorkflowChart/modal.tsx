import {
  Task,
  TaskDefinition,
  WorkflowDefinition,
} from "@melonade/melonade-declaration";
import { Form, Input, Modal, Radio, Select } from "antd";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/themes/prism.css"; //Example style, you can use another
import * as R from "ramda";
import React from "react";
import Editor from "react-simple-code-editor";
import styled from "styled-components";

const { Option } = Select;

const StyledModal = styled(Modal)`
  min-width: 70vw;
`;

const StyledTag = styled.span`
  background-color: #4caf50; /* Green */
  border: none;
  color: white;
  text-align: center;
  text-decoration: none;
  margin: 2px;
  padding: 2px;
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

interface IPropsInput {
  placeholder?: string;
  value: string;
  onChange: (data: string) => void;
}

const InputCode = (props: IPropsInput) => {
  return (
    <div>
      <Editor
        value={props.value}
        onValueChange={(v) => {
          if (!v) {
            props.onChange(v);
            return;
          }
          try {
            props.onChange(JSON.parse(v));
          } catch (error) {
            props.onChange(v);
          }
        }}
        highlight={(code) => {
          switch (getType(props.value)) {
            case "javascript":
              const m = /^(```javascript\n)([\S\s]+)(```)$/gm.exec(code);
              if (!m) return code;
              return [
                m[1],
                highlight(m[2], languages.js, "javascript"),
                m[3],
              ].join("");

            case "json":
              return highlight(code, languages.json, "json");
            default:
              return code;
          }
        }}
        padding={10}
        style={{
          border: "1px solid #999",
        }}
      />
      <StyledTag>type: {getType(props.value)}</StyledTag>
    </div>
  );
};

const getType = (value: any) => {
  if (value === undefined) {
    return "undefined";
  }

  if (!Number.isNaN(+value)) {
    return "number";
  }

  if (typeof value === "string") {
    if (/^(```javascript\n)([\S\s]+)(```)$/gm.test(value)) {
      return "javascript";
    }

    return "string";
  }

  return "json";
};

interface IPropsInputJsonOrCode {
  value: any;
  onChange: (data: any) => void;
}

const InputJsonOrCode = (props: IPropsInputJsonOrCode) => {
  var data: string = "";

  if (typeof props.value === "object") {
    data = JSON.stringify(props.value, null, 4);
  } else {
    data = props.value;
  }

  return (
    <div>
      <Editor
        value={data}
        onValueChange={(v) => {
          if (!v) {
            props.onChange(v);
            return;
          }
          try {
            props.onChange(JSON.parse(v));
          } catch (error) {
            props.onChange(v);
          }
        }}
        highlight={(code) => {
          switch (getType(props.value)) {
            case "javascript":
              const m = /^(```javascript\n)([\S\s]+)(```)$/gm.exec(code);
              if (!m) return code;
              console.log(m);
              return [
                m[1],
                highlight(m[2], languages.js, "javascript"),
                m[3],
              ].join("");

            case "json":
              return highlight(code, languages.json, "json");
            default:
              return code;
          }
        }}
        padding={10}
        style={{
          border: "1px solid #999",
        }}
      />
      <StyledTag>type: {getType(props.value)}</StyledTag>
    </div>
  );
};

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
          {[Task.TaskTypes.Task, Task.TaskTypes.SubTransaction].includes(
            this.state.task?.type as Task.TaskTypes
          ) && (
            <>
              <Form.Item label="Retry Limit">
                <InputCode
                  placeholder="Retry Limit"
                  value={R.path(["retry", "limit"], this.state.task) as any}
                  onChange={(e) => {
                    this.onInputChanged(["retry", "limit"], e);
                  }}
                />
              </Form.Item>
              <Form.Item label="Retry Delay">
                <InputCode
                  placeholder="Retry Delay"
                  value={R.path(["retry", "delay"], this.state.task) as any}
                  onChange={(e) => {
                    this.onInputChanged(["retry", "delay"], e);
                  }}
                />
              </Form.Item>
            </>
          )}

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
              <Form.Item label="Ack Timeout">
                <InputCode
                  placeholder="Ack Timeout"
                  value={R.path(["ackTimeout"], this.state.task) as any}
                  onChange={(e) => {
                    this.onInputChanged(["ackTimeout"], e);
                  }}
                />
              </Form.Item>
              <Form.Item label="Timeout">
                <InputCode
                  placeholder="Timeout"
                  value={R.path(["timeout"], this.state.task) as any}
                  onChange={(e) => {
                    this.onInputChanged(["timeout"], e);
                  }}
                />
              </Form.Item>
              <Form.Item label="Sync Worker">
                <Radio.Group
                  onChange={(e) => {
                    this.onInputChanged(["syncWorker"], e.target.value);
                  }}
                  value={this.state.task?.syncWorker}
                >
                  <Radio value={undefined}>Unset</Radio>
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </Form.Item>

              <InputJsonOrCode
                value={R.path(["inputParameters"], this.state.task)}
                onChange={(data: any) => {
                  this.onInputChanged(["inputParameters"], data);
                }}
              />
            </React.Fragment>
          )}

          {R.pathEq(["task", "type"], Task.TaskTypes.Decision, this.state) && (
            <Form.Item label="Case path">
              <InputCode
                // eslint-disable-next-line no-template-curly-in-string
                placeholder="path it get case value (e.g. ${workflow.input.paymentType})"
                value={this.state.task?.inputParameters?.case ?? ""}
                onChange={(v) => {
                  this.onInputChanged(["inputParameters", "case"], v);
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
                <InputCode
                  placeholder="Delay milliseconds before task completed"
                  value={this.state.task?.inputParameters?.completedAfter ?? ""}
                  onChange={(v) => {
                    this.onInputChanged(
                      ["inputParameters", "completedAfter"],
                      v
                    );
                  }}
                />
              </Form.Item>
              <Form.Item label="Completed At">
                <InputCode
                  placeholder="ISO 8601 date"
                  value={this.state.task?.inputParameters?.completedAt ?? ""}
                  onChange={(v) => {
                    this.onInputChanged(["inputParameters", "completedAt"], v);
                  }}
                />{" "}
              </Form.Item>
              <Form.Item label="Completed When">
                <InputCode
                  placeholder='crontab e.g. "*/5 * * * 0"'
                  value={
                    this.state.task?.inputParameters?.completedWhen ??
                    ("" as string)
                  }
                  onChange={(v) => {
                    this.onInputChanged(
                      ["inputParameters", "completedWhen"],
                      v
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
                <InputCode
                  placeholder="Name of the workflow"
                  value={this.state.task?.inputParameters?.workflowName}
                  onChange={(v) => {
                    this.onInputChanged(["inputParameters", "workflowName"], v);
                  }}
                />
              </Form.Item>
              <Form.Item label="Workflow rev">
                <InputCode
                  placeholder="Revision of the workflow"
                  value={this.state.task?.inputParameters?.workflowRev}
                  onChange={(v) => {
                    this.onInputChanged(["inputParameters", "workflowRev"], v);
                  }}
                />{" "}
              </Form.Item>
              <InputJsonOrCode
                value={this.state.task?.inputParameters?.input || ""}
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
              <InputCode
                // eslint-disable-next-line no-template-curly-in-string
                placeholder="list of task to create  (Array of Task e.g. ${workflow.input.tasks})"
                value={this.state.task?.inputParameters?.tasks ?? ""}
                onChange={(v) => {
                  this.onInputChanged(["inputParameters", "tasks"], v);
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
