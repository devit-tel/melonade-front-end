import { Task, WorkflowDefinition } from "@melonade/melonade-declaration";
import { Icon, Typography } from "antd";
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

const ParallelModelChildContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 6px;
  align-items: flex-start;

  border-top: 8px solid black;
  border-bottom: 8px solid black;
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
  align-items: flex-start;

  border-top: 8px dashed black;
  border-bottom: 8px dashed black;
`;

const DecisionCaseContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 6px;
  align-items: center;
  justify-content: space-between;
  width: 100%;

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
    <SystemTaskModelContainer>
      <Typography.Text>{props.task.taskReferenceName}</Typography.Text>
      <Typography.Text code>PARALLEL</Typography.Text>
    </SystemTaskModelContainer>

    <Icon type="arrow-down" />

    <ParallelModelChildContainer>
      {props.task.parallelTasks.map(
        (tasks: WorkflowDefinition.AllTaskType[]) => (
          <RenderChildTasks tasks={tasks} />
        )
      )}
    </ParallelModelChildContainer>
  </ParallelModelContainer>
);

interface IDecisionCaseProps {
  tasks: WorkflowDefinition.AllTaskType[];
  caseKey: string;
}

const DecisionCase = (props: IDecisionCaseProps) => (
  <DecisionCaseContainer>
    <DecisionCaseModelContainer>
      <Typography.Text>{props.caseKey}</Typography.Text>
    </DecisionCaseModelContainer>
    <Icon type="arrow-down" />
    <RenderChildTasks tasks={props.tasks} />
  </DecisionCaseContainer>
);

interface IDecisionProps {
  task: WorkflowDefinition.IDecisionTask;
}

const DecisionModel = (props: IDecisionProps) => (
  <DecisionModelContainer>
    <SystemTaskModelContainer>
      <Typography.Text>{props.task.taskReferenceName}</Typography.Text>
      <Typography.Text code>DECISION</Typography.Text>
    </SystemTaskModelContainer>

    <Icon type="arrow-down" />

    <DecisionModelChildContainer>
      {R.toPairs(props.task.decisions).map(
        ([caseKey, tasks]: [string, WorkflowDefinition.AllTaskType[]]) => (
          <DecisionCase tasks={tasks} caseKey={caseKey} />
        )
      )}
      <DecisionCase tasks={props.task.defaultDecision} caseKey="default" />
    </DecisionModelChildContainer>
  </DecisionModelContainer>
);

interface IAllTaskProps {
  task: WorkflowDefinition.AllTaskType;
}

const AllTaskModel = (props: IAllTaskProps) => {
  const { task } = props;
  switch (task.type) {
    case Task.TaskTypes.Task:
      return <TaskModel task={task} />;
    case Task.TaskTypes.Parallel:
      return <ParallelModel task={task} />;
    case Task.TaskTypes.Decision:
      return <DecisionModel task={task} />;
    default:
      return <Icon type="warning" />;
  }
};

interface IProps {
  tasks: WorkflowDefinition.AllTaskType[];
}

const RenderChildTasks = (props: IProps) => (
  <TasksContainer>
    {props.tasks.map((task: WorkflowDefinition.AllTaskType) => (
      <React.Fragment>
        <AllTaskModel task={task} />
        <Icon type="arrow-down" />
      </React.Fragment>
    ))}
  </TasksContainer>
);

export default (props: IProps) => (
  <ChartContainer>
    <StartModel />
    <Icon type="arrow-down" />
    <RenderChildTasks tasks={props.tasks} />
    <EndModel />
  </ChartContainer>
);
