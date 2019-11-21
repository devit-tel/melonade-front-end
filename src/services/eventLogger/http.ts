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
  statuses: State.TransactionStates[] = [State.TransactionStates.Completed],
  fromTimestamp: number,
  toTimestamp: number,
  transactionId?: string,
  from?: number,
  size?: number
): Promise<ITransactionEventPaginate> => {
  const resp = await client({
    url: "/",
    method: "GET",
    params: {
      statuses: JSON.stringify(statuses),
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
    url: `/${transactionId}`,
    method: "GET"
  });

  return R.path(["data", "data"], resp) as Event.AllEvent[];
};
