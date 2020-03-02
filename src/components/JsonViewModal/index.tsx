import { Modal } from "antd";
import React from "react";
import JsonView from "react-json-view";

interface IProps {
  onClose?: () => void;
  title?: "default" | "large" | "small";
  visible?: boolean;
  data: Object;
}

export default (props: IProps) => (
  <Modal
    width="700"
    centered
    title={props.title}
    visible={props.visible}
    onOk={props.onClose}
    onCancel={props.onClose}
  >
    <JsonView src={props.data} name={false} />
  </Modal>
);
