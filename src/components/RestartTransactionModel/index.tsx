import { Modal } from "antd";
import React from "react";
import WorkflowDefinitionDetail from "../../containers/WorkflowDefinitionDetail";

interface IProps {
  onClose?: () => void;
  title?: "default" | "large" | "small";
  visible?: boolean;
  data: Object;
}

export default (props: IProps) => {
  return (
    <Modal
      width="700"
      centered
      title={props.title}
      visible={props.visible}
      onOk={props.onClose}
      onCancel={props.onClose}
    >
      <WorkflowDefinitionDetail />
    </Modal>
  );
};
