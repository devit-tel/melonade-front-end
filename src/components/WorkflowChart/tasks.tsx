import {
  Task,
  TaskDefinition,
  WorkflowDefinition
} from "@melonade/melonade-declaration";
import { Button, Icon, Typography } from "antd";
import * as R from "ramda";
import React from "react";
import styled from "styled-components";
import { CreateTaskModal } from "./modal";

const YellowButton = styled(Button)`
  background-color: #ffd800;
  border-color: #ffd800;

  :hover {
    background-color: #e3b04b;
    border-color: #e3b04b;
  }
`;

const TaskWithActionContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const ActionContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  & > button {
    margin-top: 6px;
  }
`;

const ChartContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 24px;
  align-items: center;
`;

const StartModel = styled.div`
  position: relative;
  height: 35px;
  width: 35px;
  margin: 6px;
  background-color: black;
  border-radius: 50%;
  display: inline-block;
`;

const EndModel = styled(StartModel)`
  &:before {
    position: absolute;
    content: "";
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: 2px;
    right: 2px;
    border-radius: 50%;
    border: 4px solid white;
  }
`;

const TasksContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;

  :hover {
    background-color: rgba(0, 0, 255, 0.2);
  }
`;

const TaskModelContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 12px;
  margin: 6px;
  align-items: center;
  align-self: center;
  background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
  border-radius: 4px;
`;

const SystemTaskModelContainer = styled(TaskModelContainer)`
  background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
  border-radius: 14px;
`;

const ParallelModelContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 6px;
  align-items: center;
  align-self: center;

  :hover {
    background-color: rgba(0, 0, 255, 0.2);
  }
`;

const ParallelModelChildsContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 6px;
  align-items: stretch;

  border-top: 8px solid black;
  border-bottom: 8px solid black;
`;

const ParallelModelChildContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
`;

const DecisionModelContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 6px;
  align-items: center;
  align-self: center;

  :hover {
    background-color: rgba(0, 0, 255, 0.2);
  }
`;

const DecisionModelChildContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 6px;
  align-items: stretch;

  border-top: 8px dashed black;
  border-bottom: 8px dashed black;
`;

const DecisionCaseContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 6px;
  align-items: center;
  justify-content: flex-start;

  :hover {
    background-color: rgba(0, 0, 255, 0.2);
  }
`;

const DecisionCaseModelContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to top right, orange 50%, transparent 50%) top
      right,
    linear-gradient(to top left, orange 50%, transparent 50%) top left,
    linear-gradient(to bottom right, orange 50%, transparent 50%) bottom right,
    linear-gradient(to bottom left, orange 50%, transparent 50%) bottom left;
  background-size: 50% 50%;
  background-repeat: no-repeat;

  width: 160px;
  height: 80px;
  margin: 6px;
`;

export enum taskMode {
  modify = "MODIFY",
  insert = "INSERT",
  delete = "DELETE"
}

interface IActionButtonProps {
  path: (string | number)[];
  editing?: boolean;
  onTaskUpdate?: (path: (string | number)[], mode: taskMode) => void;
}

const EditButton = (props: IActionButtonProps) => {
  return props.editing ? (
    <YellowButton
      size="small"
      icon="edit"
      onClick={() =>
        props.onTaskUpdate && props.onTaskUpdate(props.path, taskMode.modify)
      }
    />
  ) : null;
};

const DeleteButton = (props: IActionButtonProps) => {
  return props.editing ? (
    <Button
      type="danger"
      size="small"
      icon="delete"
      onClick={() =>
        props.onTaskUpdate && props.onTaskUpdate(props.path, taskMode.delete)
      }
    />
  ) : null;
};

const AddButton = (props: IActionButtonProps) => {
  return props.editing ? (
    <Button
      type="primary"
      shape="circle"
      size="small"
      icon="plus"
      onClick={() =>
        props.onTaskUpdate && props.onTaskUpdate(props.path, taskMode.insert)
      }
    />
  ) : (
    <Icon type="caret-down" />
  );
};

interface ITaskProps extends IActionButtonProps {
  task: WorkflowDefinition.ITaskTask;
}

const TaskModel = (props: ITaskProps) => (
  <TaskModelContainer>
    <Typography.Text>{props.task.taskReferenceName}</Typography.Text>
    <Typography.Text code>{props.task.name}</Typography.Text>
  </TaskModelContainer>
);

interface IParallelProps extends IActionButtonProps {
  task: WorkflowDefinition.IParallelTask;
}

const ParallelModel = (props: IParallelProps) => (
  <ParallelModelContainer>
    <SystemTaskModelContainer>
      <Typography.Text>{props.task.taskReferenceName}</Typography.Text>
      <Typography.Text code>PARALLEL</Typography.Text>
    </SystemTaskModelContainer>

    <AddButton
      editing={props.editing}
      onTaskUpdate={props.onTaskUpdate}
      path={[
        ...props.path,
        "parallelTasks",
        props.task.parallelTasks.length,
        -1
      ]}
    />

    <ParallelModelChildsContainer>
      {props.task.parallelTasks.map(
        (tasks: WorkflowDefinition.AllTaskType[], index: number) => {
          const path = [...props.path, "parallelTasks", index];
          return (
            <ParallelModelChildContainer key={path.join(".")}>
              <AddButton
                editing={props.editing}
                onTaskUpdate={props.onTaskUpdate}
                path={[...path, -1]}
              />
              <RenderChildTasks
                tasks={tasks}
                path={path}
                editing={props.editing}
                onTaskUpdate={props.onTaskUpdate}
              />
            </ParallelModelChildContainer>
          );
        }
      )}
    </ParallelModelChildsContainer>
  </ParallelModelContainer>
);

interface IDecisionCaseProps extends IActionButtonProps {
  tasks: WorkflowDefinition.AllTaskType[];
  caseKey: string;
}

const DecisionCase = (props: IDecisionCaseProps) => (
  <DecisionCaseContainer>
    <DecisionCaseModelContainer>
      <Typography.Text>{props.caseKey}</Typography.Text>
    </DecisionCaseModelContainer>

    <AddButton
      editing={props.editing}
      onTaskUpdate={props.onTaskUpdate}
      path={[...props.path, -1]}
    />
    <RenderChildTasks
      tasks={props.tasks}
      path={props.path}
      editing={props.editing}
      onTaskUpdate={props.onTaskUpdate}
    />
  </DecisionCaseContainer>
);

interface IDecisionProps extends IActionButtonProps {
  task: WorkflowDefinition.IDecisionTask;
}

const DecisionModel = (props: IDecisionProps) => (
  <DecisionModelContainer>
    <SystemTaskModelContainer>
      <Typography.Text>{props.task.taskReferenceName}</Typography.Text>
      <Typography.Text code>DECISION</Typography.Text>
    </SystemTaskModelContainer>

    {/* TODO Add decision */}
    <AddButton
      editing={props.editing}
      onTaskUpdate={props.onTaskUpdate}
      path={[...props.path, "decisions", Date.now().toString(), -1]}
    />

    <DecisionModelChildContainer>
      {R.toPairs(props.task.decisions).map(
        ([caseKey, tasks]: [string, WorkflowDefinition.AllTaskType[]]) => {
          const path = [...props.path, "decisions", caseKey];
          return (
            <DecisionCase
              key={path.join(".")}
              tasks={tasks}
              caseKey={caseKey}
              path={path}
              editing={props.editing}
              onTaskUpdate={props.onTaskUpdate}
            />
          );
        }
      )}
      <DecisionCase
        tasks={props.task.defaultDecision}
        caseKey="default"
        path={[...props.path, "defaultDecision"]}
        editing={props.editing}
        onTaskUpdate={props.onTaskUpdate}
      />
    </DecisionModelChildContainer>
  </DecisionModelContainer>
);

interface IAllTaskProps extends IActionButtonProps {
  task: WorkflowDefinition.AllTaskType;
}

const AllTaskModel = (props: IAllTaskProps) => {
  const { task } = props;
  switch (task.type) {
    case Task.TaskTypes.Task:
      return (
        <TaskModel
          task={task}
          path={props.path}
          editing={props.editing}
          onTaskUpdate={props.onTaskUpdate}
        />
      );
    case Task.TaskTypes.Parallel:
      return (
        <ParallelModel
          task={task}
          path={props.path}
          editing={props.editing}
          onTaskUpdate={props.onTaskUpdate}
        />
      );
    case Task.TaskTypes.Decision:
      return (
        <DecisionModel
          task={task}
          path={props.path}
          editing={props.editing}
          onTaskUpdate={props.onTaskUpdate}
        />
      );
    default:
      return <Icon type="warning" />;
  }
};

interface IChildTasksProps extends IActionButtonProps {
  tasks: WorkflowDefinition.AllTaskType[];
}

const RenderChildTasks = (props: IChildTasksProps) => (
  <TasksContainer>
    {props.tasks.map((task: WorkflowDefinition.AllTaskType, index: number) => {
      const path = [...props.path, index];
      return (
        <React.Fragment key={path.join(".")}>
          <TaskWithActionContainer>
            <AllTaskModel
              task={task}
              path={path}
              editing={props.editing}
              onTaskUpdate={props.onTaskUpdate}
            />
            <ActionContainer>
              <EditButton
                editing={props.editing}
                onTaskUpdate={props.onTaskUpdate}
                path={path}
              />
              <DeleteButton
                editing={props.editing}
                onTaskUpdate={props.onTaskUpdate}
                path={path}
              />
            </ActionContainer>
          </TaskWithActionContainer>

          <AddButton
            editing={props.editing}
            onTaskUpdate={props.onTaskUpdate}
            path={path}
          />
        </React.Fragment>
      );
    })}
  </TasksContainer>
);

const pickTaskProperties = (
  task: WorkflowDefinition.AllTaskType
): WorkflowDefinition.AllTaskType => {
  switch (task.type) {
    case Task.TaskTypes.Task:
      return {
        name: task.name,
        taskReferenceName: task.taskReferenceName,
        ackTimeout: task.ackTimeout,
        inputParameters: task.inputParameters || {},
        retry: task.retry,
        timeout: task.timeout,
        type: task.type
      } as WorkflowDefinition.ITaskTask;
    case Task.TaskTypes.Decision:
      return {
        taskReferenceName: task.taskReferenceName,
        inputParameters: task.inputParameters || {},
        decisions: {},
        defaultDecision: [],
        type: task.type
      } as WorkflowDefinition.IDecisionTask;
    case Task.TaskTypes.Parallel:
      return {
        taskReferenceName: task.taskReferenceName,
        parallelTasks: [],
        inputParameters: {},
        type: task.type
      } as WorkflowDefinition.IParallelTask;
    default:
      return task;
  }
};

interface IProps {
  taskDefinitions: TaskDefinition.ITaskDefinition[];
  tasks: WorkflowDefinition.AllTaskType[];
  editing?: IActionButtonProps["editing"];
  onTaskUpdated?: (tasks: WorkflowDefinition.AllTaskType[]) => void;
}

interface IState {
  selectingPath?: (string | number)[];
  mode?: taskMode;
}

export default class WorkflowChart extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      selectingPath: undefined,
      mode: undefined
    };
  }

  handleTaskUpdate = (path: (string | number)[], mode: taskMode) => {
    if (this.props.onTaskUpdated) {
      switch (mode) {
        case taskMode.insert:
        case taskMode.modify:
          this.setState({
            selectingPath: path,
            mode
          });
          break;
        case taskMode.delete:
          const childPath = R.init(path);
          const childTasks = R.pathOr([], childPath, this.props.tasks);
          this.props.onTaskUpdated(
            R.set(
              R.lensPath(childPath),
              R.remove(R.last(path) as number, 1, childTasks),
              this.props.tasks as any
            )
          );
          break;

        default:
          break;
      }
    }
  };

  render() {
    return (
      <ChartContainer>
        <CreateTaskModal
          taskDefinitions={this.props.taskDefinitions}
          onCancel={() => {
            this.setState({
              selectingPath: undefined,
              mode: undefined
            });
          }}
          onSubmit={(task: WorkflowDefinition.AllTaskType) => {
            if (this.props.onTaskUpdated) {
              switch (this.state.mode) {
                case taskMode.insert:
                  const childPath = R.init(
                    this.state.selectingPath as (string | number)[]
                  );
                  const childTasks = R.pathOr([], childPath, this.props.tasks);

                  this.props.onTaskUpdated(
                    R.set(
                      R.lensPath(childPath),
                      R.insert(
                        (R.last(
                          this.state.selectingPath as (string | number)[]
                        ) as number) + 1,
                        pickTaskProperties(task),
                        childTasks
                      ),
                      this.props.tasks as any
                    )
                  );
                  break;
                case taskMode.modify:
                  this.props.onTaskUpdated(
                    R.set(
                      R.lensPath(
                        this.state.selectingPath as (string | number)[]
                      ),
                      pickTaskProperties(task),
                      this.props.tasks
                    )
                  );
                  break;
              }
            }

            this.setState({
              selectingPath: undefined,
              mode: undefined
            });
          }}
          visible={!!this.state.selectingPath}
          task={
            this.state.selectingPath
              ? R.path(this.state.selectingPath, this.props.tasks)
              : ({} as any)
          }
        />
        <StartModel />
        <AddButton
          editing={this.props.editing}
          onTaskUpdate={this.handleTaskUpdate}
          path={[-1]}
        />
        <RenderChildTasks
          tasks={this.props.tasks}
          path={[]}
          editing={this.props.editing}
          onTaskUpdate={this.handleTaskUpdate}
        />
        <EndModel />
      </ChartContainer>
    );
  }
}
