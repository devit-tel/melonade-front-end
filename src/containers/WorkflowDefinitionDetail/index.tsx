import {
  State,
  TaskDefinition,
  WorkflowDefinition,
} from "@melonade/melonade-declaration";
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
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import styled from "styled-components";
import uuid from "uuid/v4";
import JsonEditor from "../../components/JsonEditor";
import WorkflowChart from "../../components/WorkflowChart";
import {
  createWorkflowDefinition,
  deleteWorkflowDefinition,
  getWorkflowDefinitionData,
  listTaskDefinitions,
  startTranasaction,
  updateWorkflowDefinition,
} from "../../services/procressManager/http";

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

const ButtonContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-self: stretch;
`;

const StartTransactionButton = styled(Button)`
  margin: 20px 0;
`;

interface IWorkflowDefinitionParams {
  name: string;
  rev: string;
}

interface IProps extends RouteComponentProps<IWorkflowDefinitionParams> {}

interface IState {
  workflowDefinition?: WorkflowDefinition.IWorkflowDefinition;
  taskDefinitions?: TaskDefinition.ITaskDefinition[];
  isLoading: boolean;
  editing: boolean;
  saveCount: number;
  workflowInput: any;
  currentTab: string;
}

class TransactionTable extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      workflowDefinition: undefined,
      isLoading: false,
      editing: true,
      saveCount: 0,
      workflowInput: {},
      currentTab: "1",
    };
  }

  getWorkflowAndTasksDefinitionData = async () => {
    this.setState({ isLoading: true });
    try {
      const { name, rev } = this.props.match.params;
      const workflowDefinition = await getWorkflowDefinitionData(name, rev);
      const taskDefinitions = await listTaskDefinitions();
      this.setState({
        workflowDefinition,
        taskDefinitions,
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        isLoading: false,
        workflowDefinition: undefined,
        taskDefinitions: undefined,
      });
    }
  };

  saveWorkflowDefinition = async () => {
    try {
      // Validate workflow
      new WorkflowDefinition.WorkflowDefinition(
        this.state.workflowDefinition as WorkflowDefinition.IWorkflowDefinition
      );

      if (
        this.props.location.pathname === "/definition/workflow/create" &&
        this.state.saveCount === 0
      ) {
        await createWorkflowDefinition(
          this.state
            .workflowDefinition as WorkflowDefinition.IWorkflowDefinition
        );
      } else {
        await updateWorkflowDefinition(
          this.state
            .workflowDefinition as WorkflowDefinition.IWorkflowDefinition
        );
      }
      Modal.success({
        title: "Saved successfully",
      });
      this.setState({
        saveCount: this.state.saveCount + 1,
      });
    } catch (error) {
      Modal.error({
        title: "Save failed",
        content: error.toString(),
      });
    }
  };

  deleteWorkflowDefinition = () => {
    Modal.confirm({
      title: "Are you sure delete this workflow definition?",
      content: `You will not able to start transaction with this workflow anymore.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteWorkflowDefinition(
            R.pathOr("", ["workflowDefinition", "name"], this.state),
            R.pathOr("", ["workflowDefinition", "rev"], this.state)
          );
          this.props.history.push("/definition/workflow");
        } catch (error) {
          Modal.error({
            title: "Failed to delete workflow definition",
            content: error.toString(),
          });
        }
      },
    });
  };

  onInputChanged = (path: (string | number)[], value: any) => {
    this.setState({
      workflowDefinition: R.set(
        R.lensPath(path),
        value,
        this.state.workflowDefinition
      ),
    });
  };

  componentDidMount = async () => {
    this.getWorkflowAndTasksDefinitionData();
  };

  startTransaction = async () => {
    const transactionId = `web-${uuid()}`;

    try {
      await startTranasaction(
        {
          name: this.state.workflowDefinition?.name || "",
          rev: this.state.workflowDefinition?.rev || "",
        },
        this.state.workflowInput,
        transactionId,
        ["web"]
      );
      window.open(`/transaction/${transactionId}`, transactionId);
    } catch (error) {
      Modal.error({
        title: "Cannot start transaction",
        content: error.toString(),
      });
    }
  };

  render() {
    const {
      workflowDefinition,
      taskDefinitions,
      editing,
      workflowInput,
      currentTab,
    } = this.state;
    return (
      <WorkflowDefinitionDetailContainer>
        <ButtonContainer>
          <Button type="primary" onClick={this.saveWorkflowDefinition}>
            Save Workflow Definition
          </Button>
          <Button type="danger" onClick={this.deleteWorkflowDefinition}>
            Delete Workflow Definition
          </Button>
        </ButtonContainer>

        <StyledTabs
          onChange={(currentTab: string) => this.setState({ currentTab })}
        >
          <TabPane tab="Form View" key="1">
            <Form>
              <Form.Item label="Name">
                <Input
                  disabled={
                    this.props.location.pathname !==
                    "/definition/workflow/create"
                  }
                  placeholder="The name of workflow"
                  value={R.path(["name"], workflowDefinition) as any}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    this.onInputChanged(["name"], event.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Rev">
                <Input
                  disabled={
                    this.props.location.pathname !==
                    "/definition/workflow/create"
                  }
                  placeholder="The revision of workflow"
                  value={R.path(["rev"], workflowDefinition) as any}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    this.onInputChanged(["rev"], event.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Description">
                <Input
                  placeholder="The description of workflow"
                  value={R.path(["description"], workflowDefinition) as any}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    this.onInputChanged(["description"], event.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Failure Strategies">
                <Select
                  value={
                    R.path(
                      ["failureStrategy"],
                      workflowDefinition
                    ) as State.WorkflowFailureStrategies
                  }
                  onSelect={(value: State.WorkflowFailureStrategies) =>
                    this.onInputChanged(["failureStrategy"], value)
                  }
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
                    value={
                      R.path(["retry", "limit"], workflowDefinition) as any
                    }
                    onChange={(value?: number) => {
                      this.onInputChanged(["retry", "limit"], value);
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
              onChange={(checked) =>
                this.setState({
                  editing: checked,
                })
              }
            />
            <WorkflowChart
              workflowDefinition={workflowDefinition}
              taskDefinitions={taskDefinitions}
              editing={editing}
              workflowDefinitionChanged={(workflowDefinition) => {
                this.setState({
                  workflowDefinition,
                });
              }}
            />
          </TabPane>
          <TabPane tab="JSON View" key="3">
            <JsonEditor
              key={currentTab} // Make sure it unmount when tab change
              data={workflowDefinition || {}}
              onChange={(data: any) => {
                this.setState({
                  workflowDefinition: data,
                });
              }}
            />
          </TabPane>
          <TabPane tab="Start" key="4">
            <StartTransactionButton
              type="ghost"
              onClick={this.startTransaction}
              icon="play-circle"
            >
              Start Workflow
            </StartTransactionButton>
            <JsonEditor
              key={currentTab}
              data={workflowInput || {}}
              onChange={(data: any) => {
                this.setState({
                  workflowInput: data,
                });
              }}
            />
          </TabPane>
        </StyledTabs>
      </WorkflowDefinitionDetailContainer>
    );
  }
}

export default TransactionTable;
