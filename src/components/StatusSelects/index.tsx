import { State } from "@melonade/melonade-declaration";
import { Select } from "antd";
import { param } from "change-case";
import React from "react";
import styled from "styled-components";

const { Option } = Select;

const StyledSelect = (styled(Select)`
  min-width: 180px;
` as unknown) as typeof Select;

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
  <StyledSelect
    mode="multiple"
    placeholder=""
    onChange={props.handleChange || (() => undefined)}
    optionLabelProp="label"
    size={props.size}
    value={props.value}
    onBlur={props.onBlur || (() => undefined)}
  >
    {AllTransactionStates.map((state: State.TransactionStates) => (
      <Option key={state} value={state} label={param(state)}>
        {param(state)}
      </Option>
    ))}
  </StyledSelect>
);
