import { Event, State } from "@melonade/melonade-declaration";
import * as R from "ramda";
import React from "react";
import vis from "vis-timeline";
import "vis-timeline/dist/vis-timeline-graph2d.css";

declare module "antd/lib/select" {
  export interface OptionProps {
    label?: string;
  }
}

const getTransactionSpan = (
  events: Event.AllEvent[] = [],
  id: number,
  now: Date
): vis.DataItem => {
  return events
    .filter((event: Event.AllEvent): event is Event.ITransactionEvent => {
      return event.isError === false && event.type === "TRANSACTION";
    })
    .reduce(
      (result: vis.DataItem, event: Event.ITransactionEvent): vis.DataItem => {
        return {
          content: R.pathOr("-", ["details", "transactionId"], event),
          id,
          group: 1,
          start:
            event.details.status === State.TransactionStates.Running
              ? new Date(event.timestamp)
              : result.start,
          end: [
            State.TransactionStates.Cancelled,
            State.TransactionStates.Completed,
            State.TransactionStates.Failed,
            State.TransactionStates.Compensated
          ].includes(event.details.status)
            ? new Date(event.timestamp)
            : result.end
        };
      },
      {
        start: now,
        end: now
      } as vis.DataItem
    );
};

const getWorkflowSpan = (
  events: Event.AllEvent[] = [],
  id: number,
  now: Date
): vis.DataItem => {
  return events
    .filter((event: Event.AllEvent): event is Event.IWorkflowEvent => {
      return event.isError === false && event.type === "WORKFLOW";
    })
    .reduce(
      (result: vis.DataItem, event: Event.IWorkflowEvent): vis.DataItem => {
        return {
          content: `${R.pathOr(
            "-",
            ["details", "workflowDefinition", "name"],
            event
          )} / ${R.pathOr(
            "-",
            ["details", "workflowDefinition", "rev"],
            event
          )}`,
          id,
          group: 2,
          start:
            event.details.status === State.WorkflowStates.Running
              ? new Date(event.timestamp)
              : result.start,
          end: [
            State.WorkflowStates.Cancelled,
            State.WorkflowStates.Completed,
            State.WorkflowStates.Failed,
            State.WorkflowStates.Timeout
          ].includes(event.details.status)
            ? new Date(event.timestamp)
            : result.end
        };
      },
      {
        start: now,
        end: now
      } as vis.DataItem
    );
};

const getTaskSpan = (
  events: Event.AllEvent[] = [],
  id: number,
  now: Date
): vis.DataItem => {
  return events
    .filter((event: Event.AllEvent): event is Event.ITaskEvent => {
      return event.isError === false && event.type === "TASK";
    })
    .reduce(
      (result: vis.DataItem, event: Event.ITaskEvent): vis.DataItem => {
        return {
          content: R.pathOr("-", ["details", "taskName"], event),
          id,
          group: 3,
          start:
            event.details.status === State.TaskStates.Scheduled
              ? new Date(event.timestamp)
              : result.start,
          end: [
            State.TaskStates.Completed,
            State.TaskStates.AckTimeOut,
            State.TaskStates.Timeout,
            State.TaskStates.Failed
          ].includes(event.details.status)
            ? new Date(event.timestamp)
            : result.end
        };
      },
      {
        start: now,
        end: now
      } as vis.DataItem
    );
};

const getEventsSpans = (
  events: Event.AllEvent[] = [],
  idField: string,
  offset: number = 1
): vis.DataItem[] => {
  const groupByEventId: { [id: string]: Event.AllEvent[] } = R.groupBy(
    R.pathOr("", ["details", idField]),
    events
  );
  const groupedEvents = R.values(groupByEventId);
  const now = new Date();

  return groupedEvents.map(
    (e: Event.AllEvent[], id: number): vis.DataItem => {
      switch (idField) {
        case "transactionId":
          return getTransactionSpan(e, id + offset, now);
        case "workflowId":
          return getWorkflowSpan(e, id + offset, now);
        case "taskId":
          return getTaskSpan(e, id + offset, now);

        default:
          return {} as vis.DataItem;
      }
    }
  );
};

const mapEventsToDataItems = (
  events: Event.AllEvent[] = []
): vis.DataItem[] => {
  const groupByEventType: { [id: string]: Event.AllEvent[] } = R.groupBy(
    R.pathOr("", ["type"]),
    events
  );

  let dataItems = [];

  dataItems = getEventsSpans(
    R.pathOr([], ["TRANSACTION"], groupByEventType),
    "transactionId"
  );

  dataItems = dataItems.concat(
    getEventsSpans(
      R.pathOr([], ["WORKFLOW"], groupByEventType),
      "workflowId",
      dataItems.length + 1
    )
  );

  dataItems = dataItems.concat(
    getEventsSpans(
      R.pathOr([], ["TASK"], groupByEventType),
      "taskId",
      dataItems.length + 1
    )
  );

  return dataItems;
};

interface IState {
  items: vis.DataSet<vis.DataItem>;
}

interface IProps {
  events?: Event.AllEvent[];
}

export default class TimelineChart extends React.Component<IProps, IState> {
  private timeline: vis.Timeline | undefined;

  constructor(props: IProps) {
    super(props);

    this.state = {
      items: new vis.DataSet([])
    };
  }

  componentWillUnmount() {
    if (this.timeline) {
      this.timeline.destroy();
    }
  }

  componentDidCatch() {
    console.log("error");
  }

  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    console.log(mapEventsToDataItems(nextProps.events));
    prevState.items.clear();
    prevState.items.add(mapEventsToDataItems(nextProps.events));
    return {
      items: prevState.items
    };
  }

  onRefSet = (element: HTMLDivElement) => {
    if (element) {
      const groups = new vis.DataSet([
        { id: 1, content: "Transaction" },
        { id: 2, content: "Workflow" },
        { id: 3, content: "Task" }
      ]);
      this.timeline = new vis.Timeline(element, this.state.items, groups, {});
    }
  };

  render() {
    return <div ref={this.onRefSet} />;
  }
}
