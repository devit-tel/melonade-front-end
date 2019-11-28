import { WorkflowDefinition } from "@melonade/melonade-declaration";
import * as R from "ramda";
import React from "react";
import styled from "styled-components";
import Tasks, { taskMode } from "./tasks";

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
      onInsertTask={(task, path, mode) => {
        if (props.workflowDefinitionChanged) {
          switch (mode) {
            case taskMode.insert:
              const childPath = ["tasks", ...R.init(path)];
              const childTasks = R.pathOr(
                [],
                childPath,
                props.workflowDefinition
              );
              console.log(path, childPath, childTasks);
              return props.workflowDefinitionChanged(
                R.set(
                  R.lensPath(childPath),
                  R.insert((R.last(path) as number) + 1, task, childTasks),
                  props.workflowDefinition as any
                )
              );

            default:
              break;
          }
        }
      }}
    />
  </WorkflowChartDefinitionContainer>
);
