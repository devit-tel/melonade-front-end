import { Event, State } from "@melonade/melonade-declaration";
import {
  Button,
  DatePicker,
  Icon,
  Input,
  Pagination,
  Table,
  Typography
} from "antd";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import StatusSelects from "../../components/StatusSelects";
import StatusText from "../../components/StatusText";
import {
  ITransactionEventPaginate,
  listTransaction
} from "../../services/eventLogger/http";

const TRANSACTION_PER_PAGE = 50;

const ToolBarContainer = styled.div`
  display: flex;
  flex-flow: row no-wrap;
  flex: 1 0 100%;
  justify-content: flex-end;
  padding: 12px;

  & > * {
    margin-left: 8px;
  }
  & > *:first-child {
    margin-left: 0px;
  }
`;

const TransactionInput = styled(Input)`
  height: 32px;
  max-width: 320px;

  .ant-input-prefix {
    color: rgba(0, 0, 0, 0.25);
  }
`;

const DateRange = styled(DatePicker.RangePicker)`
  width: 270px;
`;

interface IProps {}

interface IState {
  currentPage: number;
  transactionEvents: ITransactionEventPaginate;
  search: {
    transactionId: string;
    dateRange: [moment.Moment, moment.Moment];
    statuses: State.TransactionStates[];
  };
  isLoading: boolean;
}

const AllTransactionStates = [
  State.TransactionStates.Cancelled,
  State.TransactionStates.Compensated,
  State.TransactionStates.Completed,
  State.TransactionStates.Failed,
  State.TransactionStates.Paused,
  State.TransactionStates.Running
];

const columns = [
  {
    title: "TransactionId",
    dataIndex: "transactionId",
    key: "transactionId",
    render: (text: string) => <Link to={`transaction/${text}`}>{text}</Link>
  },
  {
    title: "Status",
    dataIndex: "details.status",
    key: "details.status",
    render: (status: State.TransactionStates) => <StatusText status={status} />
  },
  {
    title: "Workflow",
    dataIndex: "details.workflowDefinition.name",
    key: "details.workflowDefinition.name",
    render: (_text: string, event: Event.ITransactionEvent) => (
      <Typography.Text code>
        {`${event.details.workflowDefinition.name} / ${event.details.workflowDefinition.rev}`}
      </Typography.Text>
    )
  },
  {
    title: "Updated at",
    dataIndex: "timestamp",
    key: "timestamp",
    render: (timestamp: number) => (
      <Typography.Text>
        {moment(timestamp).format("YYYY/MM/DD HH:mm:ss.SSS")}
      </Typography.Text>
    )
  }
];

class TransactionTable extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      currentPage: 1,
      transactionEvents: {
        total: 0,
        events: []
      },
      search: {
        transactionId: "",
        dateRange: [moment().startOf("week"), moment().endOf("week")],
        statuses: AllTransactionStates
      },
      isLoading: false
    };
  }

  search = async (page?: number) => {
    this.setState({ isLoading: true });
    const {
      currentPage,
      search: { transactionId, dateRange, statuses }
    } = this.state;
    const searchPage = page || currentPage;
    try {
      const transactionEvents = await listTransaction(
        statuses,
        +dateRange[0],
        +dateRange[1],
        transactionId,
        (searchPage - 1) * TRANSACTION_PER_PAGE,
        TRANSACTION_PER_PAGE
      );
      this.setState({
        transactionEvents,
        isLoading: false,
        currentPage: searchPage
      });
    } catch (error) {
      this.setState({
        isLoading: false,
        transactionEvents: {
          events: [],
          total: this.state.transactionEvents.total
        }
      });
    }
  };

  componentDidMount = async () => {
    this.search();
  };

  handleStatusChange = (statuses: State.TransactionStates[]) => {
    this.setState({
      search: {
        ...this.state.search,
        statuses
      }
    });
  };

  handleTransactionIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      search: {
        ...this.state.search,
        transactionId: event.target.value
      }
    });
  };

  handleDateRangeChange = (dateRange: (moment.Moment | undefined)[]) => {
    this.setState({
      search: {
        ...this.state.search,
        dateRange: [
          dateRange[0] ? dateRange[0].startOf("day") : moment().startOf("week"),
          dateRange[1] ? dateRange[1].endOf("day") : moment().endOf("week")
        ]
      }
    });
  };

  render() {
    const {
      currentPage,
      transactionEvents,
      search: { transactionId, dateRange, statuses },
      isLoading
    } = this.state;
    return (
      <div>
        <ToolBarContainer>
          <TransactionInput
            placeholder="Find transaction ID"
            prefix={<Icon type="number" />}
            value={transactionId}
            onChange={this.handleTransactionIdChange}
            onPressEnter={() => this.search()}
          />
          <StatusSelects
            handleChange={this.handleStatusChange}
            size="default"
            value={statuses}
            onBlur={() => this.search()}
          />
          <DateRange
            size="default"
            onChange={this.handleDateRangeChange}
            value={dateRange}
          />
          <Button
            type="primary"
            icon="search"
            onClick={() => this.search()}
            disabled={isLoading}
          >
            Search
          </Button>
        </ToolBarContainer>
        <Table
          columns={columns}
          dataSource={transactionEvents.events}
          pagination={false}
          loading={isLoading}
        />
        <Pagination
          onChange={(page: number) => {
            this.search(page);
          }}
          current={currentPage}
          pageSize={TRANSACTION_PER_PAGE}
          total={transactionEvents.total}
        />
      </div>
    );
  }
}

export default TransactionTable;