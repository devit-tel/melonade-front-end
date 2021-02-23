import { State, WorkflowDefinition } from "@melonade/melonade-declaration";
import { ITaskDefinition } from "@melonade/melonade-declaration/build/taskDefinition";
import { IWorkflowDefinition } from "@melonade/melonade-declaration/build/workflowDefinition";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Tabs,
} from "antd";
import * as R from "ramda";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import uuid from "uuid/v4";
import JsonEditor from "../../components/JsonEditor";
import WorkflowChart from "../../components/WorkflowChart";
import {
  createWorkflowDefinition,
  deleteWorkflowDefinition,
  getWorkflowDefinitionData,
  listTaskDefinitions,
  startTransaction,
  updateWorkflowDefinition,
} from "../../services/processManager/http";

const { TabPane } = Tabs;
const { Option } = Select;

const StyledTabs = styled(Tabs)`
  width: 100%;
  height: 100%;
`;

const StyledNumberInput = styled(InputNumber)`
  width: 100%;
`;

const WorkflowDefinitionDetailContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-end;
`;

const RowContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-self: stretch;
  padding-bottom: 5px;
`;

interface IProps {
  name?: string;
  rev?: string;
  workflowDefinition?: WorkflowDefinition.IWorkflowDefinition;
  workflowInput?: any;
  transactionId?: string;
}

const WorkflowDefinitionDetail = (props: IProps) => {
  const [saveCount, setSaveCount] = useState(0);
  const [workflowDefinition, setWorkflowDefinition] = useState(
    props.workflowDefinition
  );
  const [taskDefinitions, setTaskDefinitions] = useState<ITaskDefinition[]>([]);
  const [currentTab, setCurrentTab] = useState("1");
  const [editing, setEditing] = useState(true);
  const [workflowInput, setWorkflowInput] = useState<any>({});
  const [transactionId, setTransactionId] = useState(
    props.transactionId ?? `web-${uuid()}`
  );
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const taskDefinitions = await listTaskDefinitions();
      setTaskDefinitions(taskDefinitions);
      if (props.name && props.rev) {
        const workflowDefinition = await getWorkflowDefinitionData(
          props.name,
          props.rev
        );
        setWorkflowDefinition(workflowDefinition);
      } else if (props.workflowDefinition && props.workflowInput) {
        setWorkflowDefinition(props.workflowDefinition);
        setWorkflowInput(props.workflowInput);
        setSaveCount(-1);
      }
    })();
  }, [props.name, props.rev, props.workflowDefinition, props.workflowInput]);

  return (
    <WorkflowDefinitionDetailContainer>
      {saveCount >= 0 && (
        <RowContainer>
          <Button
            type="primary"
            onClick={async () => {
              try {
                if (workflowDefinition) {
                  // Validate workflow
                  new WorkflowDefinition.WorkflowDefinition(workflowDefinition);

                  if (
                    history.location.pathname ===
                      "/definition/workflow/create" &&
                    saveCount === 0
                  ) {
                    await createWorkflowDefinition(workflowDefinition);
                  } else {
                    await updateWorkflowDefinition(workflowDefinition);
                  }
                  Modal.success({
                    title: "Saved successfully",
                  });

                  setSaveCount(saveCount + 1);
                }
              } catch (error) {
                Modal.error({
                  title: "Save failed",
                  content: error.toString(),
                });
              }
            }}
          >
            Save Workflow Definition
          </Button>
          <Button
            type="danger"
            onClick={() =>
              Modal.confirm({
                title: "Are you sure delete this workflow definition?",
                content: `You will not able to start transaction with this workflow anymore.`,
                okText: "Delete",
                okType: "danger",
                cancelText: "No",
                onOk: async () => {
                  try {
                    if (workflowDefinition) {
                      await deleteWorkflowDefinition(
                        workflowDefinition?.name,
                        workflowDefinition?.rev
                      );
                      history.push("/definition/workflow");
                    } else {
                      throw new Error(`workflow definition are not defined`);
                    }
                  } catch (error) {
                    Modal.error({
                      title: "Failed to delete workflow definition",
                      content: error.toString(),
                    });
                  }
                },
              })
            }
            disabled={
              history.location.pathname === "/definition/workflow/create" &&
              saveCount === 0
            }
          >
            Delete Workflow Definition
          </Button>
        </RowContainer>
      )}

      <StyledTabs onChange={setCurrentTab}>
        <TabPane tab="Form View" key="1">
          <Form>
            <Form.Item label="Name">
              <Input
                disabled={
                  history.location.pathname !== "/definition/workflow/create" ||
                  saveCount !== 0
                }
                placeholder="The name of workflow"
                value={workflowDefinition?.name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setWorkflowDefinition({
                    ...(workflowDefinition as IWorkflowDefinition),
                    name: event.target.value,
                  });
                }}
              />
            </Form.Item>
            <Form.Item label="Rev">
              <Input
                disabled={
                  history.location.pathname !== "/definition/workflow/create" ||
                  saveCount !== 0
                }
                placeholder="The revision of workflow"
                value={R.path(["rev"], workflowDefinition) as any}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setWorkflowDefinition({
                    ...(workflowDefinition as IWorkflowDefinition),
                    rev: event.target.value,
                  });
                }}
              />
            </Form.Item>
            <Form.Item label="Description">
              <Input
                placeholder="The description of workflow"
                value={R.path(["description"], workflowDefinition) as any}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setWorkflowDefinition({
                    ...(workflowDefinition as IWorkflowDefinition),
                    description: event.target.value,
                  });
                }}
              />
            </Form.Item>
            <Form.Item label="Failure Strategies">
              <Select
                value={workflowDefinition?.failureStrategy}
                onSelect={(
                  value: State.WorkflowFailureStrategies | undefined
                ) => {
                  if (value) {
                    setWorkflowDefinition({
                      ...(workflowDefinition as IWorkflowDefinition),
                      failureStrategy: value,
                    });
                  }
                }}
              >
                <Option
                  key={State.WorkflowFailureStrategies.Failed}
                  value={State.WorkflowFailureStrategies.Failed}
                >
                  {State.WorkflowFailureStrategies.Failed}
                </Option>
                <Option
                  key={State.WorkflowFailureStrategies.Retry}
                  value={State.WorkflowFailureStrategies.Retry}
                >
                  {State.WorkflowFailureStrategies.Retry}
                </Option>
                <Option
                  key={State.WorkflowFailureStrategies.Compensate}
                  value={State.WorkflowFailureStrategies.Compensate}
                >
                  {State.WorkflowFailureStrategies.Compensate}
                </Option>
                <Option
                  key={State.WorkflowFailureStrategies.CompensateThenRetry}
                  value={State.WorkflowFailureStrategies.CompensateThenRetry}
                >
                  {State.WorkflowFailureStrategies.CompensateThenRetry}
                </Option>
              </Select>
            </Form.Item>
            {[
              State.WorkflowFailureStrategies.Retry,
              State.WorkflowFailureStrategies.CompensateThenRetry,
            ].includes(
              R.path(
                ["failureStrategy"],
                workflowDefinition
              ) as State.WorkflowFailureStrategies
            ) ? (
              <Form.Item label="Retry Limit">
                <StyledNumberInput
                  placeholder="Number that workflow can retry if failed"
                  value={R.path(["retry", "limit"], workflowDefinition) as any}
                  onChange={(value?: number) => {
                    setWorkflowDefinition({
                      ...(workflowDefinition as IWorkflowDefinition),
                      retry: {
                        limit: value || 0,
                      },
                    });
                  }}
                />
              </Form.Item>
            ) : null}
          </Form>
        </TabPane>
        <TabPane tab="Workflow View" key="2">
          <Switch
            checkedChildren="Edit"
            unCheckedChildren=""
            checked={editing}
            onChange={setEditing}
          />
          <WorkflowChart
            workflowDefinition={workflowDefinition}
            taskDefinitions={taskDefinitions}
            editing={editing}
            workflowDefinitionChanged={setWorkflowDefinition}
          />
        </TabPane>
        <TabPane tab="JSON View" key="3">
          <JsonEditor
            key={currentTab} // Make sure it unmount when tab change
            data={workflowDefinition || {}}
            onChange={setWorkflowDefinition}
          />
        </TabPane>
        <TabPane tab="Start" key="4">
          <RowContainer>
            <Input
              placeholder="Transaction ID"
              value={transactionId}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setTransactionId(event.target.value);
              }}
            />
            <Button
              type="ghost"
              onClick={async () => {
                try {
                  if (workflowDefinition) {
                    await startTransaction(
                      workflowDefinition,
                      workflowInput,
                      transactionId,
                      ["web"]
                    );
                    window.open(`/transaction/${transactionId}`, transactionId);
                  } else {
                    throw new Error("workflow definition are not defined");
                  }
                } catch (error) {
                  Modal.error({
                    title: "Cannot start transaction",
                    content: error.toString(),
                  });
                }
              }}
              icon="play-circle"
            >
              Start Workflow
            </Button>
          </RowContainer>
          <JsonEditor
            key={currentTab}
            data={workflowInput || {}}
            onChange={setWorkflowInput}
          />
        </TabPane>
      </StyledTabs>
    </WorkflowDefinitionDetailContainer>
  );
};

export default WorkflowDefinitionDetail;
