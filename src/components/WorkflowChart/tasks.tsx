import { Task, WorkflowDefinition } from "@melonade/melonade-declaration";
import { Typography } from "antd";
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
  padding: 12px;
`;

const TaskModelContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  background-color: pink;
  padding: 12px;
  margin: 6px;
  align-items: center;
  align-self: center;
`;

const ParallelModelContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 12px;
  margin: 6px;
  align-items: center;
  border-top: 4px solid black;
  border-bottom: 4px solid black;
  align-self: center;
`;

const ParallelModelChildContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 6px;
  align-items: flex-start;
`;

const DecisionModelContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 12px;
  margin: 6px;
  align-items: center;
  align-self: center;
`;

const DecisionModelChildContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 6px;
  align-items: flex-start;
`;

interface ITaskProps {
  task: WorkflowDefinition.ITaskTask;
}

const TaskModel = (props: ITaskProps) => (
  <TaskModelContainer>
    <Typography.Text>{props.task.taskReferenceName}</Typography.Text>
    <Typography.Text code>{props.task.name}</Typography.Text>
  </TaskModelContainer>
);

interface IParallelProps {
  task: WorkflowDefinition.IParallelTask;
}

const ParallelModel = (props: IParallelProps) => (
  <ParallelModelContainer>
    <Typography.Text>{props.task.taskReferenceName}</Typography.Text>

    <ParallelModelChildContainer>
      {props.task.parallelTasks.map(
        (tasks: WorkflowDefinition.AllTaskType[]) => (
          <RenderChildTasks tasks={tasks} />
        )
      )}
    </ParallelModelChildContainer>
  </ParallelModelContainer>
);

interface IDecisionProps {
  task: WorkflowDefinition.IDecisionTask;
}

const DecisionModel = (props: IDecisionProps) => (
  <DecisionModelContainer>
    <Typography.Text>{props.task.taskReferenceName}</Typography.Text>

    <DecisionModelChildContainer>
      {R.toPairs(props.task.decisions).map(
        ([_case, tasks]: [string, WorkflowDefinition.AllTaskType[]]) => (
          <RenderChildTasks tasks={tasks} />
        )
      )}

      <RenderChildTasks tasks={props.task.defaultDecision} />
    </DecisionModelChildContainer>
  </DecisionModelContainer>
);

interface IProps {
  tasks: WorkflowDefinition.AllTaskType[];
}

const RenderChildTasks = (props: IProps) => (
  <TasksContainer>
    {props.tasks.map((task: WorkflowDefinition.AllTaskType) => {
      switch (task.type) {
        case Task.TaskTypes.Task:
          return <TaskModel task={task} />;
        case Task.TaskTypes.Parallel:
          return <ParallelModel task={task} />;
        case Task.TaskTypes.Decision:
          return <DecisionModel task={task} />;
        default:
          return <div />;
      }
    })}
  </TasksContainer>
);

export default (props: IProps) => (
  <ChartContainer>
    <StartModel />
    <RenderChildTasks tasks={props.tasks} />
    <EndModel />
  </ChartContainer>
);
