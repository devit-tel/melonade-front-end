import { Event, State } from "@melonade/melonade-declaration";
import { Button, Checkbox, Form, Input, Typography } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import moment from "moment";
import * as R from "ramda";
import React from "react";
import {
  AutoSizer,
  Column,
  Index,
  Table,
  TableCellDataGetterParams
} from "react-virtualized";
import "react-virtualized/styles.css";
import JsonViewModal from "../JsonViewModal";
import Status from "../StatusText";

const nameRenderrer = (cell: TableCellDataGetterParams) => {
  const event: Event.AllEvent = cell.rowData;
  if (event.isError === false && event.type === "WORKFLOW") {
    return (
      <Typography.Text code>
        {`${event.details.workflowDefinition.name} / ${event.details.workflowDefinition.rev}`}
      </Typography.Text>
    );
  }

  if (event.isError === false && event.type === "TASK") {
    return (
      <Typography.Text code>
        {`${event.details.taskName || "-"} (${
          event.details.taskReferenceName
        })`}
      </Typography.Text>
    );
  }

  return undefined;
};

const idRenderrer = (cell: TableCellDataGetterParams) => {
  const event: Event.AllEvent = cell.rowData;
  if (!event.isError) {
    switch (event.type) {
      case "TRANSACTION":
        return <Typography.Text>{event.details.transactionId}</Typography.Text>;
      case "WORKFLOW":
        return <Typography.Text>{event.details.workflowId}</Typography.Text>;
      case "TASK":
        return <Typography.Text>{event.details.taskId}</Typography.Text>;
    }
  }

  return null;
};

const fieldRenderrer = (path: string[], defaultValue?: string) => (
  cell: TableCellDataGetterParams
) => {
  const event: Event.AllEvent = cell.rowData;
  const text = R.pathOr(defaultValue, path, event);

  if (!text && !defaultValue) return null;
  return (
    <Typography.Text code>
      {R.pathOr(defaultValue, path, event)}
    </Typography.Text>
  );
};

const statusRenderrer = (cell: TableCellDataGetterParams) => {
  const event: Event.AllEvent = cell.rowData;

  return (
    <Status
      status={
        R.path(["details", "status"], event) as
          | State.TransactionStates
          | State.WorkflowStates
          | State.TaskStates
      }
    />
  );
};

const timeRenderrer = (cell: TableCellDataGetterParams) => {
  const event: Event.AllEvent = cell.rowData;

  return (
    <Typography.Text>
      {moment(event.timestamp).format("YYYY/MM/DD HH:mm:ss.SSS")}
    </Typography.Text>
  );
};

interface IProps {
  events: Event.AllEvent[];
  isLoading?: boolean;
}

interface IState {
  showSystemError?: boolean;
  showIdField?: boolean;
  viewingEvent?: any;
  searchText?: string;
}

export default class EventsTable extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      viewingEvent: undefined,
      showSystemError: false,
      showIdField: false
    };
  }

  rowGetter = (events: Event.AllEvent[]) => (index: Index) =>
    events[index.index];

  detailsRenderer = (cell: TableCellDataGetterParams) => {
    const event: Event.AllEvent = cell.rowData;

    return (
      <Button
        type="primary"
        shape="circle"
        icon="snippets"
        size="small"
        onClick={() => this.setState({ viewingEvent: event })}
      />
    );
  };

  onCheckBoxChanged = (stateField: string) => (e: CheckboxChangeEvent) => {
    this.setState({
      [stateField]: e.target.checked
    });
  };

  onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      searchText: e.target.value
    });
  };

  getFilteredEvents = (): Event.AllEvent[] => {
    const { events } = this.props;
    const { showSystemError, searchText = "" } = this.state;

    if (showSystemError && !searchText) {
      return events;
    }

    try {
      const searchRegexp = new RegExp(searchText, "i");

      return events.filter((event: Event.AllEvent) => {
        return (
          !(
            event.isError === true &&
            event.type === "TASK" &&
            event.details.isSystem === true
          ) &&
          (searchRegexp.test(R.pathOr("", ["type"], event)) ||
            searchRegexp.test(R.pathOr("", ["details", "workflowId"], event)) ||
            searchRegexp.test(R.pathOr("", ["details", "taskId"], event)) ||
            searchRegexp.test(R.pathOr("", ["details", "type"], event)) ||
            searchRegexp.test(R.pathOr("", ["details", "status"], event)) ||
            searchRegexp.test(
              R.pathOr("", ["details", "workflowDefinition", "name"], event)
            ) ||
            searchRegexp.test(
              R.pathOr("", ["details", "workflowDefinition", "rev"], event)
            ) ||
            searchRegexp.test(R.pathOr("", ["details", "taskName"], event)) ||
            searchRegexp.test(
              R.pathOr("", ["details", "taskReferenceName"], event)
            ))
        );
      });
    } catch (error) {
      console.warn(error);
      return events;
    }
  };

  render() {
    const { showIdField, viewingEvent, searchText } = this.state;
    const filteredEvents = this.getFilteredEvents();
    return (
      <React.Fragment>
        <JsonViewModal
          data={viewingEvent}
          visible={viewingEvent}
          onClose={() => this.setState({ viewingEvent: undefined })}
        />
        <Form layout="inline">
          <Form.Item>
            <Checkbox onChange={this.onCheckBoxChanged("showIdField")}>
              Show ID field
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Checkbox onChange={this.onCheckBoxChanged("showSystemError")}>
              Show system false events
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Input
              placeholder="Search"
              value={searchText}
              onChange={this.onSearchChange}
            />
          </Form.Item>
        </Form>
        <AutoSizer disableHeight>
          {({ width }) => (
            <Table
              headerHeight={30}
              height={window.innerHeight - 64}
              overscanRowCount={20}
              rowCount={filteredEvents.length}
              rowGetter={this.rowGetter(filteredEvents)}
              rowHeight={30}
              width={width}
            >
              <Column
                cellRenderer={this.detailsRenderer}
                dataKey="details"
                width={30}
              />
              <Column label="Event Type" dataKey="type" width={120} />
              {showIdField ? (
                <Column
                  label="ID"
                  cellRenderer={idRenderrer}
                  dataKey="details.id"
                  width={350}
                />
              ) : null}
              <Column
                label="Name"
                cellRenderer={nameRenderrer}
                dataKey="details.name"
                width={200}
              />
              <Column
                label="Type"
                cellRenderer={fieldRenderrer(["details", "type"])}
                dataKey="details.type"
                width={150}
              />
              <Column
                label="Status"
                cellRenderer={statusRenderrer}
                dataKey="details.status"
                width={100}
              />
              <Column
                label="Occured At"
                cellRenderer={timeRenderrer}
                dataKey="timestamp"
                width={220}
              />
            </Table>
          )}
        </AutoSizer>
      </React.Fragment>
    );
  }
}
