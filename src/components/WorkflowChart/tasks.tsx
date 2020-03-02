import {
  State,
  Task,
  TaskDefinition,
  WorkflowDefinition
} from "@melonade/melonade-declaration";
import { Button, Icon, Typography } from "antd";
import * as R from "ramda";
import React from "react";
import styled from "styled-components";
import { CreateDecisionCaseModal, CreateTaskModal } from "./modal";

const EmptyTask = styled.div`
  padding: 20px 40px;
  margin: 6px;
  border: 2px dashed gray;
  display: flex;
  align-items: center;
`;

const StyledButton = styled(Button)``;

const Text = styled(Typography.Text)`
  white-space: nowrap;
  font-size: 14px;
`;

const YellowButton = styled(StyledButton)`
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
  justify-content: center;
  align-items: flex-start;
`;

const ActionContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  flex: 1 1 100%;

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
  flex: 0 0 35px;
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
  flex: 1 1 100%;

  :hover {
    background-color: rgba(0, 0, 255, 0.2);
  }
`;

interface ITaskModelContainer {
  backgroundColor: string;
}

const TaskModelContainer = styled.div<ITaskModelContainer>`
  display: flex;
  flex-flow: column nowrap;
  padding: 12px;
  margin: 6px;
  align-items: center;
  align-self: center;
  // background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
  background-color: ${(props: ITaskModelContainer) =>
    props.backgroundColor || "white"}
  border-radius: 4px;
  border: 1px solid black;
`;

const SystemTaskModelContainer = styled(TaskModelContainer)`
  // background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
  border-radius: 30px;
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
  align-self: stretch;
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
  flex: 0 0 60px;
  margin: 6px;
`;

interface IDownArrowProps {
  lockHeight?: boolean;
}

const ArrowContainer = styled.div<IDownArrowProps>`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  flex: ${(props: IDownArrowProps) => (props.lockHeight ? "0 0" : "1 1 100%")};
`;

const ArrowLine = styled.div`
  width: 2px;
  min-height: 10px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.65);
`;

const DownArrow = (props: IDownArrowProps) => (
  <ArrowContainer lockHeight={props.lockHeight}>
    <ArrowLine />
    <Icon type="caret-down" />
  </ArrowContainer>
);

export enum taskMode {
  modify = "MODIFY",
  insert = "INSERT",
  delete = "DELETE"
}

interface ITaskDataProps {
  tasksData?: {
    [taskReferenceName: string]: Task.ITask;
  };
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
    <StyledButton
      type="danger"
      size="small"
      icon="delete"
      onClick={() =>
        props.onTaskUpdate && props.onTaskUpdate(props.path, taskMode.delete)
      }
    />
  ) : null;
};

const AddButton = (props: IActionButtonProps & IDownArrowProps) => {
  return props.editing ? (
    <StyledButton
      type="primary"
      shape="circle"
      size="small"
      icon="plus"
      onClick={() =>
        props.onTaskUpdate && props.onTaskUpdate(props.path, taskMode.insert)
      }
    />
  ) : (
    <DownArrow lockHeight={props.lockHeight} />
  );
};

const EmptyButton = (props: IActionButtonProps) => {
  return props.editing ? (
    <EmptyTask>
      <StyledButton
        type="primary"
        shape="circle"
        size="small"
        icon="plus"
        onClick={() =>
          props.onTaskUpdate && props.onTaskUpdate(props.path, taskMode.insert)
        }
      />
    </EmptyTask>
  ) : null;
};

interface ITaskProps extends IActionButtonProps, ITaskDataProps {
  task: WorkflowDefinition.ITaskTask | WorkflowDefinition.ICompensateTask;
}

const getBackgroundTasksData = (
  taskReferenceName: string,
  tasksData?: { [taskReferenceName: string]: Task.ITask }
) => {
  if (!tasksData) return "white";

  const status = R.path<State.TaskStates>(
    [taskReferenceName, "status"],
    tasksData
  );

  switch (status) {
    case State.TaskStates.Scheduled:
      return "#b2b2b2";
    case State.TaskStates.Inprogress:
      return "#2b6cff";
    case State.TaskStates.Completed:
      return "#16c172";
    case State.TaskStates.AckTimeOut:
    case State.TaskStates.Timeout:
    case State.TaskStates.Failed:
      return "#c91a1a";
    default:
      return "#ffffff";
  }
};

const TaskModel = (props: ITaskProps) => (
  <TaskModelContainer
    backgroundColor={getBackgroundTasksData(
      props.task.taskReferenceName,
      props.tasksData
    )}
  >
    <Text>{props.task.taskReferenceName}</Text>
    <Text code>{props.task.name}</Text>
  </TaskModelContainer>
);

interface IParallelProps extends IActionButtonProps, ITaskDataProps {
  task: WorkflowDefinition.IParallelTask;
}

const ParallelModel = (props: IParallelProps) => (
  <ParallelModelContainer>
    <SystemTaskModelContainer
      backgroundColor={getBackgroundTasksData(
        props.task.taskReferenceName,
        props.tasksData
      )}
    >
      <Text>{props.task.taskReferenceName}</Text>
      <Text code>PARALLEL</Text>
    </SystemTaskModelContainer>

    <ParallelModelChildsContainer>
      {props.task.parallelTasks.map(
        (tasks: WorkflowDefinition.AllTaskType[], index: number) => {
          const path = [...props.path, "parallelTasks", index];
          return (
            <TaskWithActionContainer key={path.join(".")}>
              <ParallelModelChildContainer>
                <AddButton
                  editing={props.editing}
                  onTaskUpdate={props.onTaskUpdate}
                  path={[...path, -1]}
                  lockHeight
                />
                <RenderChildTasks
                  tasks={tasks}
                  path={path}
                  editing={props.editing}
                  onTaskUpdate={props.onTaskUpdate}
                  tasksData={props.tasksData}
                />
              </ParallelModelChildContainer>
              <ActionContainer>
                <DeleteButton
                  editing={props.editing}
                  onTaskUpdate={props.onTaskUpdate}
                  path={path}
                />
              </ActionContainer>
            </TaskWithActionContainer>
          );
        }
      )}
      <EmptyButton
        editing={props.editing}
        onTaskUpdate={props.onTaskUpdate}
        path={[
          ...props.path,
          "parallelTasks",
          props.task.parallelTasks.length,
          -1
        ]}
      />
    </ParallelModelChildsContainer>
  </ParallelModelContainer>
);

interface IDecisionCaseProps extends IActionButtonProps, ITaskDataProps {
  tasks: WorkflowDefinition.AllTaskType[];
  caseKey: string;
}

const DecisionCase = (props: IDecisionCaseProps) => (
  <DecisionCaseContainer>
    <DownArrow lockHeight />
    <DecisionCaseModelContainer>
      <Text>{props.caseKey}</Text>
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
      tasksData={props.tasksData}
    />
  </DecisionCaseContainer>
);

interface IDecisionProps extends IActionButtonProps, ITaskDataProps {
  task: WorkflowDefinition.IDecisionTask;
}

const DecisionModel = (props: IDecisionProps) => (
  <DecisionModelContainer>
    <SystemTaskModelContainer
      backgroundColor={getBackgroundTasksData(
        props.task.taskReferenceName,
        props.tasksData
      )}
    >
      <Text>{props.task.taskReferenceName}</Text>
      <Text code>DECISION</Text>
    </SystemTaskModelContainer>

    <DecisionModelChildContainer>
      {R.toPairs(props.task.decisions).map(
        ([caseKey, tasks]: [string, WorkflowDefinition.AllTaskType[]]) => {
          const path = [...props.path, "decisions", caseKey];
          return (
            <TaskWithActionContainer key={path.join(".")}>
              <DecisionCase
                tasks={tasks}
                caseKey={caseKey}
                path={path}
                editing={props.editing}
                onTaskUpdate={props.onTaskUpdate}
                tasksData={props.tasksData}
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
          );
        }
      )}

      <EmptyButton
        editing={props.editing}
        onTaskUpdate={props.onTaskUpdate}
        path={[...props.path, "decisions", "placeholder"]}
      />

      <DecisionCase
        tasks={props.task.defaultDecision}
        caseKey="default"
        path={[...props.path, "defaultDecision"]}
        editing={props.editing}
        onTaskUpdate={props.onTaskUpdate}
        tasksData={props.tasksData}
      />
    </DecisionModelChildContainer>
  </DecisionModelContainer>
);

interface IAllTaskProps extends IActionButtonProps, ITaskDataProps {
  task: WorkflowDefinition.AllTaskType;
}

const AllTaskModel = (props: IAllTaskProps) => {
  const { task } = props;
  switch (task.type) {
    case Task.TaskTypes.Task:
    case Task.TaskTypes.Compensate:
      return (
        <TaskModel
          task={task}
          path={props.path}
          editing={props.editing}
          onTaskUpdate={props.onTaskUpdate}
          tasksData={props.tasksData}
        />
      );
    case Task.TaskTypes.Parallel:
      return (
        <ParallelModel
          task={task}
          path={props.path}
          editing={props.editing}
          onTaskUpdate={props.onTaskUpdate}
          tasksData={props.tasksData}
        />
      );
    case Task.TaskTypes.Decision:
      return (
        <DecisionModel
          task={task}
          path={props.path}
          editing={props.editing}
          onTaskUpdate={props.onTaskUpdate}
          tasksData={props.tasksData}
        />
      );
    default:
      return <Icon type="warning" />;
  }
};

interface IChildTasksProps extends IActionButtonProps, ITaskDataProps {
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
              tasksData={props.tasksData}
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
        decisions: task.decisions || {},
        defaultDecision: task.defaultDecision || [],
        type: task.type
      } as WorkflowDefinition.IDecisionTask;
    case Task.TaskTypes.Parallel:
      return {
        taskReferenceName: task.taskReferenceName,
        parallelTasks: task.parallelTasks || [],
        inputParameters: task.inputParameters || {},
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
  tasksData?: {
    [taskReferenceName: string]: Task.ITask;
  };
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
              R.is(Array, childTasks)
                ? R.remove(R.last(path) as number, 1, childTasks)
                : R.omit([R.last(path) as string], childTasks),
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
          visible={
            !!this.state.selectingPath &&
            R.nth(-2, this.state.selectingPath) !== "decisions"
          }
          task={
            this.state.selectingPath && this.state.mode === taskMode.modify
              ? R.path(this.state.selectingPath, this.props.tasks)
              : ({} as any)
          }
        />
        <CreateDecisionCaseModal
          decisionCases={
            this.state.selectingPath
              ? R.path(R.init(this.state.selectingPath), this.props.tasks)
              : undefined
          }
          visible={
            !!this.state.selectingPath &&
            R.nth(-2, this.state.selectingPath) === "decisions"
          }
          onCancel={() => {
            this.setState({
              selectingPath: undefined,
              mode: undefined
            });
          }}
          onSubmit={(caseName: string) => {
            if (
              this.props.onTaskUpdated &&
              caseName &&
              this.state.selectingPath
            ) {
              this.props.onTaskUpdated(
                R.set(
                  R.lensPath(R.dropLast(1, this.state.selectingPath)),
                  {
                    ...R.omit(
                      [R.last(this.state.selectingPath) as string],
                      R.pathOr(
                        {},
                        R.dropLast(1, this.state.selectingPath),
                        this.props.tasks as any
                      )
                    ),
                    [caseName]: R.pathOr(
                      [],
                      this.state.selectingPath,
                      this.props.tasks as any
                    )
                  },
                  this.props.tasks as any
                )
              );
            }

            this.setState({
              selectingPath: undefined,
              mode: undefined
            });
          }}
        />
        <StartModel />
        <AddButton
          editing={this.props.editing}
          onTaskUpdate={this.handleTaskUpdate}
          path={[-1]}
        />
        {console.log(this.props.tasksData)}
        <RenderChildTasks
          tasks={this.props.tasks}
          path={[]}
          editing={this.props.editing}
          onTaskUpdate={this.handleTaskUpdate}
          tasksData={this.props.tasksData}
        />
        <EndModel />
      </ChartContainer>
    );
  }
}
