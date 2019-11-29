import {
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
}

const WorkflowChartDefinitionContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
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
    />
  </WorkflowChartDefinitionContainer>
);
