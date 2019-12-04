import {
  Task,
  TaskDefinition,
  WorkflowDefinition
} from "@melonade/melonade-declaration";
import * as R from "ramda";
import React from "react";
import styled from "styled-components";
import Tasks from "./tasks";

interface IProps {
  workflowDefinition?: WorkflowDefinition.IWorkflowDefinition;
  taskDefinitions?: TaskDefinition.ITaskDefinition[];
  editing?: boolean;
  workflowDefinitionChanged?: (
    workflowDefinition: WorkflowDefinition.IWorkflowDefinition
  ) => void;
  tasksData?: {
    [taskReferenceName: string]: Task.ITask;
  };
}

const WorkflowChartDefinitionContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;

  background: linear-gradient(90deg, #fff 20px, transparent 1%) center,
    linear-gradient(#fff 20px, transparent 1%) center, #ddd;
  background-size: 22px 22px;
`;

export default (props: IProps) => (
  <WorkflowChartDefinitionContainer>
    <Tasks
      taskDefinitions={props.taskDefinitions || []}
      tasks={R.pathOr([], ["workflowDefinition", "tasks"], props)}
      editing={props.editing}
      onTaskUpdated={tasks => {
        props.workflowDefinitionChanged &&
          props.workflowDefinitionChanged({
            ...props.workflowDefinition,
            tasks
          } as any);
      }}
      tasksData={props.tasksData}
    />
  </WorkflowChartDefinitionContainer>
);
