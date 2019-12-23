import { Event, State } from "@melonade/melonade-declaration";
import axios from "axios";
import * as R from "ramda";
import { eventLogger } from "../../config";

const client = axios.create(eventLogger.http);

export interface ITransactionEventPaginate {
  total: number;
  events: Event.ITransactionEvent[];
}

export const listTransaction = async (
  fromTimestamp: number,
  toTimestamp: number,
  transactionId?: string,
  tags: string[] = [],
  from?: number,
  size?: number,
  statuses: State.TransactionStates[] = [State.TransactionStates.Running]
): Promise<ITransactionEventPaginate> => {
  const resp = await client({
    url: "/v1/store",
    method: "GET",
    params: {
      tags: JSON.stringify(tags),
      fromTimestamp,
      toTimestamp,
      transactionId,
      from,
      size,
      statuses: JSON.stringify(statuses)
    }
  });

  return R.pathOr(
    {
      total: 0,
      events: []
    },
    ["data", "data"],
    resp
  );
};

export const getTransactionData = async (
  transactionId: string
): Promise<Event.AllEvent[]> => {
  const resp = await client({
    url: `/v1/store/${transactionId}`,
    method: "GET"
  });

  return R.path(["data", "data"], resp) as Event.AllEvent[];
};

export const getTransactionDateHistogram = async (
  fromTimestamp: number,
  toTimestamp: number,
  status: State.TransactionStates
): Promise<any> => {
  const resp = await client({
    url: `/v1/statistics/transaction-histogram`,
    method: "GET",
    params: {
      status,
      fromTimestamp,
      toTimestamp
    }
  });

  return R.path(["data", "data"], resp) as Event.AllEvent[];
};

export const getTaskExecuteime = async (
  fromTimestamp: number,
  toTimestamp: number
): Promise<any> => {
  const resp = await client({
    url: `/v1/statistics/task-execution-time`,
    method: "GET",
    params: {
      fromTimestamp,
      toTimestamp
    }
  });

  return R.path(["data", "data"], resp) as Event.AllEvent[];
};

export const getFalseEvents = async (
  fromTimestamp: number,
  toTimestamp: number
): Promise<ITransactionEventPaginate> => {
  const resp = await client({
    url: "/v1/statistics/false-events",
    method: "GET",
    params: {
      fromTimestamp,
      toTimestamp
    }
  });

  return R.pathOr(
    {
      total: 0,
      events: []
    },
    ["data", "data"],
    resp
  );
};
