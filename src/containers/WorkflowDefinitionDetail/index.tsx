import { WorkflowDefinition } from "@melonade/melonade-declaration";
import React from "react";
import JsonView from "react-json-view";
import { RouteComponentProps } from "react-router-dom";
import styled from "styled-components";
import WorkflowChart from "../../components/WorkflowChart";
import { getWorkflowDefinitionData } from "../../services/procressManager/http";

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

  getWorkflowDefinitionData = async () => {
    this.setState({ isLoading: true });
    try {
      const { name, rev } = this.props.match.params;
      const workflowDefinition = await getWorkflowDefinitionData(name, rev);
      this.setState({
        workflowDefinition,
        isLoading: false
      });
    } catch (error) {
      this.setState({
        isLoading: false,
        workflowDefinition: undefined
      });
    }
  };

  componentDidMount = async () => {
    this.getWorkflowDefinitionData();
  };

  render() {
    const { workflowDefinition } = this.state;
    return (
      <WorkflowDefinitionDetailContainer>
        <WorkflowChart workflowDefinition={workflowDefinition} />
        <JsonView src={workflowDefinition || {}} />
      </WorkflowDefinitionDetailContainer>
    );
  }
}

export default TransactionTable;
