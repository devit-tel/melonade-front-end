import {
  TaskDefinition,
  WorkflowDefinition
} from "@melonade/melonade-declaration";
import { Tabs } from "antd";
import React from "react";
import JsonView, { InteractionProps } from "react-json-view";
import { RouteComponentProps } from "react-router-dom";
import styled from "styled-components";
import WorkflowChart from "../../components/WorkflowChart";
import {
  getWorkflowDefinitionData,
  listTaskDefinitions
} from "../../services/procressManager/http";

const { TabPane } = Tabs;

const StyledTabs = styled(Tabs)`
  width: 100%;
  height: 100%;
`;

const WorkflowDefinitionDetailContainer = styled.div`
  display: flex;
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

  componentDidMount = async () => {
    this.getWorkflowAndTasksDefinitionData();
  };

  render() {
    const { workflowDefinition, taskDefinitions } = this.state;
    return (
      <WorkflowDefinitionDetailContainer>
        <StyledTabs>
          <TabPane tab="Workflow View" key="1">
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
          <TabPane tab="JSON View" key="2">
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
