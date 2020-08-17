import { Input } from "antd";
import React, { useState } from "react";
import JsonView from "react-json-view";
import styled from "styled-components";

const JsonEditorContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  .react-json-view {
    display: flex;
    flex: 1 1 50%;
    width: 50%;
  }
`;

interface IStyledTextAreaProp {
  isError: boolean;
}

const StyledTextArea = styled(Input.TextArea)`
  display: flex;
  flex: 1 1 50%;
  font-family: monospace;
  min-height: 250px !important;
  line-height: 1.8em !important;

  ${(props: IStyledTextAreaProp) =>
    props.isError ? "background-color: red;" : ""}
`;

interface IProps {
  onChange?: (data: any) => void;
  data?: object;
}

export default (props: IProps) => {
  const [isError, setIsError] = useState(false);
  return (
    <JsonEditorContainer>
      <JsonView
        name={false}
        src={props.data || {}}
        onEdit={(data: any) => {
          props.onChange && props.onChange(data.updated_src);
        }}
        onAdd={(data: any) => {
          props.onChange && props.onChange(data.updated_src);
        }}
      />
      <StyledTextArea
        isError={isError}
        defaultValue={JSON.stringify(props.data || {}, null, 2)}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
          try {
            props.onChange && props.onChange(JSON.parse(event.target.value));
            setIsError(false);
          } catch (error) {
            setIsError(true);
          }
        }}
      />
    </JsonEditorContainer>
  );
};
