import { State } from "@melonade/melonade-declaration";
import { Select } from "antd";
import { param } from "change-case";
import React from "react";

declare module "antd/lib/select" {
  export interface OptionProps {
    label?: string;
  }
}

const { Option } = Select;

const AllTransactionStates = [
  State.TransactionStates.Cancelled,
  State.TransactionStates.Compensated,
  State.TransactionStates.Completed,
  State.TransactionStates.Failed,
  State.TransactionStates.Paused,
  State.TransactionStates.Running
];

interface IProps {
  handleChange?: (
    value: State.TransactionStates[],
    option: React.ReactElement<any> | React.ReactElement<any>[]
  ) => void;
  onBlur?: (value: State.TransactionStates[]) => void;
  size?: "default" | "large" | "small";
  value?: State.TransactionStates[];
}

export default (props: IProps) => (
  <Select
    mode="multiple"
    placeholder=""
    onChange={props.handleChange}
    optionLabelProp="label"
    size={props.size}
    value={props.value}
    onBlur={props.onBlur}
  >
    {AllTransactionStates.map((state: State.TransactionStates) => (
      <Option key={state} value={state} label={param(state)}>
        {param(state)}
      </Option>
    ))}
  </Select>
);
