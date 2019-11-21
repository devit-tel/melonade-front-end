import { State } from "@melonade/melonade-declaration";
import { Badge } from "antd";
import { param } from "change-case";
import React from "react";

declare module "antd/lib/select" {
  export interface OptionProps {
    label?: string;
  }
}

interface IProps {
  status: State.TransactionStates | State.WorkflowStates | State.TaskStates;
}

const getStatusType = (status: IProps["status"]) => {
  switch (status) {
    case State.TransactionStates.Running:
    case State.WorkflowStates.Running:
    case State.TaskStates.Inprogress:
      return "processing";
    case State.TransactionStates.Completed:
    case State.WorkflowStates.Completed:
    case State.TaskStates.Completed:
      return "success";
    case State.TransactionStates.Cancelled:
    case State.TransactionStates.Compensated:
    case State.WorkflowStates.Cancelled:
      return "warning";
    case State.TransactionStates.Failed:
    case State.WorkflowStates.Failed:
    case State.WorkflowStates.Timeout:
    case State.TaskStates.AckTimeOut:
    case State.TaskStates.Failed:
    case State.TaskStates.Timeout:
      return "error";
    case State.TransactionStates.Paused:
    case State.WorkflowStates.Paused:
    case State.TaskStates.Scheduled:
    default:
      return "default";
  }
};

export default (props: IProps) => (
  <Badge status={getStatusType(props.status)} text={param(props.status)} />
);
