import { Event, State } from "@melonade/melonade-declaration";
import axios from "axios";
import * as R from "ramda";
import { eventLogger } from "../../config";

const client = axios.create(eventLogger.http);

export const listTransaction = async (
  statuses: State.TransactionStates[] = [State.TransactionStates.Completed],
  fromTimestamp: number,
  toTimestamp: number,
  from?: number,
  size?: number
): Promise<Event.ITransactionEvent[]> => {
  const resp = await client({
    url: "/",
    method: "GET",
    params: {
      statuses,
      fromTimestamp,
      toTimestamp,
      from,
      size
    }
  });

  return R.pathOr([], ["data", "data"], resp);
};
