import {
  TaskDefinition,
  WorkflowDefinition
} from "@melonade/melonade-declaration";
import { Button, Form, Input, InputNumber, Modal, Tabs } from "antd";
import * as R from "ramda";
import React from "react";
import JsonView, { InteractionProps } from "react-json-view";
import { RouteComponentProps } from "react-router-dom";
import styled from "styled-components";
import WorkflowChart from "../../components/WorkflowChart";
import {
  createWorkflowDefinitions,
  getWorkflowDefinitionData,
  listTaskDefinitions,
  updateWorkflowDefinitions
} from "../../services/procressManager/http";

const { TabPane } = Tabs;

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

interface IWorkflowDefinitionParams {
  name: string;
  rev: string;
}

interface IProps extends RouteComponentProps<IWorkflowDefinitionParams> {}

interface IState {
  workflowDefinition?: WorkflowDefinition.IWorkflowDefinition;
  taskDefinitions?: TaskDefinition.ITaskDefinition[];
  isLoading: boolean;
}

class TransactionTable extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      workflowDefinition: undefined,
      isLoading: false
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
        isLoading: false
      });
    } catch (error) {
      this.setState({
        isLoading: false,
        workflowDefinition: undefined,
        taskDefinitions: undefined
      });
    }
  };

  saveWorkflowDefinition = async () => {
    try {
      if (this.props.location.pathname === "/definition/workflow/create") {
        await createWorkflowDefinitions(
          this.state
            .workflowDefinition as WorkflowDefinition.IWorkflowDefinition
        );
      } else {
        await updateWorkflowDefinitions(
          this.state
            .workflowDefinition as WorkflowDefinition.IWorkflowDefinition
        );
      }
      Modal.success({
        title: "Saved successfully"
      });
    } catch (error) {
      Modal.error({
        title: "This is an error message",
        content: "some messages...some messages..."
      });
    }
  };

  onInputChanged = (path: (string | number)[], value: any) => {
    this.setState({
      workflowDefinition: R.set(
        R.lensPath(path),
        value,
        this.state.workflowDefinition
      )
    });
  };

  componentDidMount = async () => {
    this.getWorkflowAndTasksDefinitionData();
  };

  render() {
    const { workflowDefinition, taskDefinitions } = this.state;
    return (
      <WorkflowDefinitionDetailContainer>
        <Button type="primary" onClick={this.saveWorkflowDefinition}>
          Save Workflow Definition
        </Button>
        <StyledTabs>
          <TabPane tab="Form View" key="1">
            <Form.Item label="Name">
              <Input
                disabled={
                  this.props.location.pathname !== "/definition/workflow/create"
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
                  this.props.location.pathname !== "/definition/workflow/create"
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
            <Form.Item label="Retry Limit">
              <StyledNumberInput
                placeholder="Number that workflow can retry if failed"
                value={R.path(["retry", "limit"], workflowDefinition) as any}
                onChange={(value?: number) => {
                  this.onInputChanged(["retry", "limit"], value);
                }}
              />
            </Form.Item>
          </TabPane>
          <TabPane tab="Workflow View" key="2">
            <WorkflowChart
              workflowDefinition={workflowDefinition}
              taskDefinitions={taskDefinitions}
              editing
              workflowDefinitionChanged={workflowDefinition => {
                this.setState({
                  workflowDefinition
                });
              }}
            />
          </TabPane>
          <TabPane tab="JSON View" key="3">
            <JsonView
              src={workflowDefinition || {}}
              onEdit={(edit: InteractionProps) => {
                this.setState({
                  workflowDefinition: edit.updated_src as any
                });
              }}
              onAdd={(edit: InteractionProps) => {
                this.setState({
                  workflowDefinition: edit.updated_src as any
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
