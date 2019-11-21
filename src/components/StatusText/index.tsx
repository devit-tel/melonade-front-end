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
  status: State.TransactionStates;
}

const getStatusType = (status: State.TransactionStates) => {
  switch (status) {
    case State.TransactionStates.Running:
      return "processing";
    case State.TransactionStates.Completed:
      return "success";
    case State.TransactionStates.Cancelled:
    case State.TransactionStates.Compensated:
      return "warning";
    case State.TransactionStates.Failed:
      return "error";
    case State.TransactionStates.Paused:
    default:
      return "default";
  }
};

export default (props: IProps) => (
  <Badge status={getStatusType(props.status)} text={param(props.status)} />
);
