import { Event, State, Task } from "@melonade/melonade-declaration";
import * as R from "ramda";
import React from "react";
import vis from "vis-timeline";
import "vis-timeline/dist/vis-timeline-graph2d.css";
import "./index.scss";

declare module "antd/lib/select" {
  export interface OptionProps {
    label?: string;
  }
}

const getStatusType = (
  status: State.TransactionStates | State.WorkflowStates | State.TaskStates,
  lastType: string = "default"
) => {
  switch (status) {
    case State.TransactionStates.Running:
    case State.WorkflowStates.Running:
    case State.TaskStates.Inprogress:
      if (["default"].includes(lastType)) {
        return "processing";
      }
      return lastType;
    case State.TransactionStates.Completed:
    case State.WorkflowStates.Completed:
    case State.TaskStates.Completed:
      return "success";
    case State.TransactionStates.Cancelled:
    case State.TransactionStates.Compensated:
    case State.WorkflowStates.Cancelled:
      return "warning";
    case State.TransactionStates.Failed:
    case State.WorkflowStates.Failed:
    case State.WorkflowStates.Timeout:
    case State.TaskStates.AckTimeOut:
    case State.TaskStates.Failed:
    case State.TaskStates.Timeout:
      return "error";
    case State.TransactionStates.Paused:
    case State.WorkflowStates.Paused:
    case State.TaskStates.Scheduled:
    default:
      if (lastType) {
        return lastType;
      }
      return "default";
  }
};

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
            : result.end,
          className: getStatusType(event.details.status, result.className)
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
            : result.end,
          className: getStatusType(event.details.status, result.className)
        };
      },
      {
        start: now,
        end: now
      } as vis.DataItem
    );
};

const getTaskName = (event: Event.ITaskEvent): string => {
  if (
    [Task.TaskTypes.Task, Task.TaskTypes.Compensate].includes(
      event.details.type
    )
  ) {
    return R.pathOr("-", ["details", "taskName"], event);
  }
  return `${R.pathOr(
    "-",
    ["details", "taskReferenceName"],
    event
  )} - (${R.pathOr("-", ["details", "type"], event)})`;
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
          content: getTaskName(event),
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
            : result.end,
          className: getStatusType(event.details.status, result.className)
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

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.events !== this.props.events) {
      if (this.timeline) {
        this.timeline.fit();
      }
    }
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
      this.timeline = new vis.Timeline(element, this.state.items, groups, {
        stack: true,
        horizontalScroll: true,
        zoomKey: "ctrlKey",
        editable: false,
        margin: {
          item: 10,
          axis: 5
        }
      });
    }
  };

  render() {
    return <div ref={this.onRefSet} />;
  }
}
