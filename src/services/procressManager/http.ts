import {
  TaskDefinition,
  WorkflowDefinition
} from "@melonade/melonade-declaration";
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

export const listTaskDefinitions = async (): Promise<TaskDefinition.ITaskDefinition[]> => {
  const resp = await client({
    url: "/v1/definition/task",
    method: "GET"
  });

  return R.pathOr([], ["data", "data"], resp);
};

export const updateTaskDefinitions = async (
  taskDefinition: TaskDefinition.ITaskDefinition
): Promise<TaskDefinition.ITaskDefinition> => {
  const resp = await client({
    url: "/v1/definition/task",
    method: "PUT",
    data: taskDefinition
  });

  return R.path(["data", "data"], resp) as TaskDefinition.ITaskDefinition;
};

export const createTaskDefinitions = async (
  taskDefinition: TaskDefinition.ITaskDefinition
): Promise<TaskDefinition.ITaskDefinition> => {
  const resp = await client({
    url: "/v1/definition/task",
    method: "POST",
    data: taskDefinition
  });

  return R.path(["data", "data"], resp) as TaskDefinition.ITaskDefinition;
};
