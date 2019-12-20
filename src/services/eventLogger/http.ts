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
  size?: number
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
      size
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

export const getWeeklyTransactionsByStatus = async (
  status: State.TransactionStates,
  now: number | Date
): Promise<any> => {
  const resp = await client({
    url: `/v1/statistics/transaction/week`,
    method: "GET",
    params: {
      status,
      now
    }
  });

  return R.path(["data", "data"], resp) as Event.AllEvent[];
};
