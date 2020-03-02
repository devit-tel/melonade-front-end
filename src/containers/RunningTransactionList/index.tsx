import { Store, Transaction } from "@melonade/melonade-declaration";
import { Pagination, Table, Tag, Typography } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listRunningTransaction } from "../../services/procressManager/http";

const TRANSACTION_PER_PAGE = 50;

interface IProps {}

const columns = [
  {
    title: "TransactionId",
    dataIndex: "transactionId",
    key: "transactionId",
    render: (text: string) => <Link to={`transaction/${text}`}>{text}</Link>
  },
  {
    title: "Workflow",
    dataIndex: "workflowDefinition.name",
    key: "workflowDefinition.name",
    render: (_text: string, transaction: Transaction.ITransaction) => (
      <Typography.Text code>
        {`${transaction.workflowDefinition.name} / ${transaction.workflowDefinition.rev}`}
      </Typography.Text>
    )
  },
  {
    title: "Created at",
    dataIndex: "createTime",
    key: "createTime",
    render: (createdAt: number) => (
      <Typography.Text>
        {moment(createdAt).format("YYYY/MM/DD HH:mm:ss.SSS")}
      </Typography.Text>
    )
  },
  {
    title: "Tags",
    dataIndex: "tags",
    key: "tags",
    render: (tags: string[] = []) => (
      <React.Fragment>
        {tags.map((tag: string) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </React.Fragment>
    )
  }
];

export default (props: IProps) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Store.ITransactionPaginate>({
    transactions: [],
    total: 0
  });
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const transactionEvents = await listRunningTransaction(
          (currentPage - 1) * TRANSACTION_PER_PAGE,
          TRANSACTION_PER_PAGE
        );

        setTransactions(transactionEvents);
      } catch (error) {
        setTransactions({
          transactions: [],
          total: 0
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [currentPage]);

  return (
    <div>
      <Table
        columns={columns}
        dataSource={transactions.transactions}
        pagination={false}
        loading={isLoading}
      />
      <Pagination
        onChange={(page: number) => {
          setCurrentPage(page);
        }}
        current={currentPage}
        pageSize={TRANSACTION_PER_PAGE}
        total={transactions.total}
      />
    </div>
  );
};
