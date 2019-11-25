import { WorkflowDefinition } from "@melonade/melonade-declaration";
import axios from "axios";
import * as R from "ramda";
import { processManager } from "../../config";

const client = axios.create(processManager.http);

export const listWorkflowDefinitions = async (): Promise<WorkflowDefinition.IWorkflowDefinition[]> => {
  const resp = await client({
    url: "/v1/definition/workflow",
    method: "GET"
  });

  return R.pathOr([], ["data", "data"], resp);
};

export const getWorkflowDefinitionData = async (
  name: string,
  rev: string
): Promise<WorkflowDefinition.IWorkflowDefinition> => {
  const resp = await client({
    url: `/v1/definition/workflow/${name}/${rev}`,
    method: "GET"
  });

  return R.path(
    ["data", "data"],
    resp
  ) as WorkflowDefinition.IWorkflowDefinition;
};