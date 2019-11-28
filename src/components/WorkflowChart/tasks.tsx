import { Task, WorkflowDefinition } from "@melonade/melonade-declaration";
import { Button, Icon, Typography } from "antd";
import * as R from "ramda";
import React from "react";
import styled from "styled-components";

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

interface IAddButtonProps {
  path: (string | number)[];
  editing?: boolean;
  onInsertTask?: (
    task: WorkflowDefinition.AllTaskType,
    path: (string | number)[],
    mode: taskMode
  ) => void;
}

const AddButton = (props: IAddButtonProps) => {
  return props.editing ? (
    <Button
      type="primary"
      shape="circle"
      size="small"
      icon="plus"
      onClick={() =>
        props.onInsertTask &&
        props.onInsertTask(
          {
            name: "hello",
            taskReferenceName: "hello",
            type: Task.TaskTypes.Task,
            inputParameters: {}
          },
          props.path,
          taskMode.insert
        )
      }
    />
  ) : (
    <Icon type="caret-down" />
  );
};

interface ITaskProps extends IAddButtonProps {
  task: WorkflowDefinition.ITaskTask;
}

const TaskModel = (props: ITaskProps) => (
  <TaskModelContainer>
    <Typography.Text>{props.task.taskReferenceName}</Typography.Text>
    <Typography.Text code>{props.task.name}</Typography.Text>
  </TaskModelContainer>
);

interface IParallelProps extends IAddButtonProps {
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
      onInsertTask={props.onInsertTask}
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
                onInsertTask={props.onInsertTask}
                path={[...path, -1]}
              />
              <RenderChildTasks
                tasks={tasks}
                path={path}
                editing={props.editing}
                onInsertTask={props.onInsertTask}
              />
            </ParallelModelChildContainer>
          );
        }
      )}
    </ParallelModelChildsContainer>
  </ParallelModelContainer>
);

interface IDecisionCaseProps extends IAddButtonProps {
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
      onInsertTask={props.onInsertTask}
      path={[...props.path, -1]}
    />
    <RenderChildTasks
      tasks={props.tasks}
      path={props.path}
      editing={props.editing}
      onInsertTask={props.onInsertTask}
    />
  </DecisionCaseContainer>
);

interface IDecisionProps extends IAddButtonProps {
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
      onInsertTask={props.onInsertTask}
      path={props.path}
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
              onInsertTask={props.onInsertTask}
            />
          );
        }
      )}
      <DecisionCase
        tasks={props.task.defaultDecision}
        caseKey="default"
        path={[...props.path, "defaultDecision"]}
        editing={props.editing}
        onInsertTask={props.onInsertTask}
      />
    </DecisionModelChildContainer>
  </DecisionModelContainer>
);

interface IAllTaskProps extends IAddButtonProps {
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
          onInsertTask={props.onInsertTask}
        />
      );
    case Task.TaskTypes.Parallel:
      return (
        <ParallelModel
          task={task}
          path={props.path}
          editing={props.editing}
          onInsertTask={props.onInsertTask}
        />
      );
    case Task.TaskTypes.Decision:
      return (
        <DecisionModel
          task={task}
          path={props.path}
          editing={props.editing}
          onInsertTask={props.onInsertTask}
        />
      );
    default:
      return <Icon type="warning" />;
  }
};

interface IChildTasksProps extends IAddButtonProps {
  tasks: WorkflowDefinition.AllTaskType[];
}

const RenderChildTasks = (props: IChildTasksProps) => (
  <TasksContainer>
    {props.tasks.map((task: WorkflowDefinition.AllTaskType, index: number) => {
      const path = [...props.path, index];
      return (
        <React.Fragment key={path.join(".")}>
          <AllTaskModel
            task={task}
            path={path}
            editing={props.editing}
            onInsertTask={props.onInsertTask}
          />

          <AddButton
            editing={props.editing}
            onInsertTask={props.onInsertTask}
            path={path}
          />
        </React.Fragment>
      );
    })}
  </TasksContainer>
);

interface IProps {
  tasks: WorkflowDefinition.AllTaskType[];
  editing?: IAddButtonProps["editing"];
  onInsertTask?: IAddButtonProps["onInsertTask"];
}

export default (props: IProps) => (
  <ChartContainer>
    <StartModel />
    <AddButton
      editing={props.editing}
      onInsertTask={props.onInsertTask}
      path={[-1]}
    />
    <RenderChildTasks
      tasks={props.tasks}
      path={[]}
      editing={props.editing}
      onInsertTask={props.onInsertTask}
    />
    <EndModel />
  </ChartContainer>
);
