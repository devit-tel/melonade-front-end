import React from "react";
// @ts-ignore
import JSONInput from 'react-json-editor-ajrm';
import JsonView from "react-json-view";
import styled from "styled-components";


const JsonEditorContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

interface IProps {
  onChange?: (data: any) => void;
  data?: object;
}

export default (props: IProps) => (
  <JsonEditorContainer>
    <JsonView
      src={props.data || {}}
      onEdit={(data: any) => {
        console.log(data)
        props.onChange && props.onChange(data.updated_src)
      }}
      onAdd={(data: any) => {
        props.onChange && props.onChange(data.updated_src)
      }} />
    <JSONInput
      placeholder={props.data || {}}
      theme="light_mitsuketa_tribute"
      width="100%"
      height="100%"
      onChange={(data: any) => {
        props.onChange && props.onChange(data.jsObject)
      }}
    />
  </JsonEditorContainer>
);
