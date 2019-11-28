import { WorkflowDefinition } from "@melonade/melonade-declaration";
import * as R from "ramda";
import React from "react";
import styled from "styled-components";
import Tasks from "./tasks";

interface IProps {
  workflowDefinition?: WorkflowDefinition.IWorkflowDefinition;
  editing?: boolean;
  workflowDefinitionChanged?: (
    workflowDefinition: WorkflowDefinition.IWorkflowDefinition
  ) => void;
}

const WorkflowChartDefinitionContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

export default (props: IProps) => (
  <WorkflowChartDefinitionContainer>
    <Tasks
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
