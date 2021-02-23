import { WorkflowDefinition } from "@melonade/melonade-declaration";
import { Modal } from "antd";
import React from "react";
import WorkflowDefinitionDetail from "../../containers/WorkflowDefinitionDetail";

interface IProps {
  onClose?: () => void;
  visible?: boolean;
  transactionId?: string;
  workflowDefinition?: WorkflowDefinition.IWorkflowDefinition;
  workflowInput: any;
}

const RestartTransactionModel = (props: IProps) => {
  return (
    <Modal
      width="700"
      centered
      title="Start transaction"
      visible={props.visible}
      onOk={props.onClose}
      onCancel={props.onClose}
    >
      <WorkflowDefinitionDetail
        transactionId={props.transactionId}
        workflowDefinition={props.workflowDefinition}
        workflowInput={props.workflowInput}
      />
    </Modal>
  );
};

export default RestartTransactionModel;
