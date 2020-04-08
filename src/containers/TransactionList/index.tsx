import {
  Event,
  State,
  WorkflowDefinition,
} from "@melonade/melonade-declaration";
import { Icon, Input, Pagination, Select, Table, Tag, Typography } from "antd";
import debounce from "lodash.debounce";
import moment from "moment";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import DateRangePicker from "../../components/DateRangePicker";
import { DateRangeContext } from "../../contexts/DateRangeContext";
import {
  ITransactionEventPaginate,
  listTransactions,
} from "../../services/eventLogger/http";
import { listWorkflowDefinitions } from "../../services/procressManager/http";

const { Option } = Select;

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

const StyledSelect = (styled(Select)`
  min-width: 180px;
` as unknown) as typeof Select;

interface IProps {
  statuses: State.TransactionStates[];
}

const columns = [
  {
    title: "TransactionId",
    dataIndex: "transactionId",
    key: "transactionId",
    render: (text: string) => <Link to={`transaction/${text}`}>{text}</Link>,
  },
  {
    title: "Workflow",
    dataIndex: "details.workflowDefinition.name",
    key: "details.workflowDefinition.name",
    render: (_text: string, event: Event.ITransactionEvent) => (
      <Typography.Text code>
        {`${event.details.workflowDefinition.name} / ${event.details.workflowDefinition.rev}`}
      </Typography.Text>
    ),
  },
  {
    title: "Updated at",
    dataIndex: "timestamp",
    key: "timestamp",
    render: (timestamp: number) => (
      <Typography.Text>
        {moment(timestamp).format("YYYY/MM/DD HH:mm:ss.SSS")}
      </Typography.Text>
    ),
  },
  {
    title: "Tags",
    dataIndex: "details.tags",
    key: "details.tags",
    render: (tags: string[] = []) => (
      <React.Fragment>
        {tags.map((tag: string) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </React.Fragment>
    ),
  },
];

export default (props: IProps) => {
  const [dateRange] = useContext(DateRangeContext);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionEvents, setTransactionEvents] = useState<
    ITransactionEventPaginate
  >({ events: [], total: 0 });
  const [transactionId, setTransactionId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);

  const [workflowName, setWorkflowName] = useState<string>("");
  const [workflowRev, setWorkflowRev] = useState<string>("");
  const [workflowDefs, setWorkflowDefs] = useState<
    WorkflowDefinition.IWorkflowDefinition[]
  >([]);

  const throttled = useRef(
    debounce((transactionId: string) => setTransactionId(transactionId), 200)
  );

  useEffect(() => {
    (async () => {
      const workflowDefs = await listWorkflowDefinitions();
      setWorkflowDefs(workflowDefs);

      console.log(workflowDefs);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const transactionEvents = await listTransactions(
          +dateRange[0],
          +dateRange[1],
          transactionId,
          tags,
          (currentPage - 1) * TRANSACTION_PER_PAGE,
          TRANSACTION_PER_PAGE,
          props.statuses,
          workflowName,
          workflowRev
        );

        setTransactionEvents(transactionEvents);
      } catch (error) {
        setTransactionEvents({
          events: [],
          total: 0,
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [
    currentPage,
    transactionId,
    dateRange,
    tags,
    props.statuses,
    workflowName,
    workflowRev,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [transactionId, dateRange, tags]);

  return (
    <div>
      <ToolBarContainer>
        <StyledSelect
          placeholder="Find by workflow definition"
          onChange={(i: number) => {
            setWorkflowName(workflowDefs[i]?.name);
            setWorkflowRev(workflowDefs[i]?.rev);
          }}
        >
          {workflowDefs.map(
            (wd: WorkflowDefinition.IWorkflowDefinition, i: number) => (
              <Option key={`${wd.name}-${wd.rev}`} value={i}>
                {wd.name} / {wd.rev}
              </Option>
            )
          )}
        </StyledSelect>
        <TransactionInput
          placeholder="Find transaction ID"
          prefix={<Icon type="number" />}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            throttled.current(event.target.value);
          }}
        />
        <StyledSelect
          placeholder="Find by tag"
          mode="tags"
          onChange={setTags}
          size="default"
          value={tags}
        />
        <DateRangePicker />
      </ToolBarContainer>
      <Table
        columns={columns}
        dataSource={transactionEvents.events}
        pagination={false}
        loading={isLoading}
      />
      <Pagination
        onChange={(page: number) => {
          setCurrentPage(page);
        }}
        current={currentPage}
        pageSize={TRANSACTION_PER_PAGE}
        total={transactionEvents.total}
      />
    </div>
  );
};
