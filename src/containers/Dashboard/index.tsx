// @ts-ignore
import * as DataSet from "@antv/data-set";
import { Event, State } from "@melonade/melonade-declaration";
import { Typography } from "antd";
import { Axis, Chart, Geom, Legend, Tooltip } from "bizcharts";
import moment from "moment";
import * as R from "ramda";
import React, { useContext, useEffect, useState } from "react";
import { max, median, min, quantile } from "simple-statistics";
import styled from "styled-components";
import DateRangePicker from "../../components/DateRangePicker";
import EventTable from "../../components/EventTable";
import { DateRangeContext } from "../../contexts/DateRangeContext";
import {
  getFalseEvents,
  getTaskExecuteime,
  getTransactionDateHistogram,
  IHistogramCount
} from "../../services/eventLogger/http";

interface IBoxChartRow {
  x: string;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
}

const { Title } = Typography;

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-end;
`;

const Section = styled.div`
  display: flex;
  flex-flow: column nowrap;
  flex: 1 1 100%;
  align-self: stretch;

  padding: 12px;

  & + & {
    margin-top: 12px;
  }
`;

const scale = {
  date: {
    alias: "Date",
    formatter: (date: number) => moment(date).format("YYYY/MM/DD HH:mm")
  },
  count: {
    alias: "Count"
  }
};

export interface ITaskExecutionTime {
  executionTime: number;
  taskName: string;
}

interface IProps {}

export default (props: IProps) => {
  const [dateRange] = useContext(DateRangeContext);
  const [transactionHistogram, setTransactionHistogram] = useState<
    IHistogramCount[]
  >([]);

  const [tasksExecutionStatistics, settasksExecutionStatistics] = useState<
    DataSet.DataView
  >(new DataSet.DataView());
  const [falseEvents, setFalseEvents] = useState<Event.AllEvent[]>([]);

  useEffect(() => {
    (async () => {
      const [
        startedHistogram,
        completedHistogram,
        compensatedHistogram,
        failedHistogram
      ] = await Promise.all([
        getTransactionDateHistogram(+dateRange[0], +dateRange[1], [
          State.TransactionStates.Running
        ]),
        getTransactionDateHistogram(+dateRange[0], +dateRange[1], [
          State.TransactionStates.Completed
        ]),
        getTransactionDateHistogram(+dateRange[0], +dateRange[1], [
          State.TransactionStates.Compensated,
          State.TransactionStates.Cancelled
        ]),
        getTransactionDateHistogram(+dateRange[0], +dateRange[1], [
          State.TransactionStates.Failed
        ])
      ]);

      setTransactionHistogram([
        ...startedHistogram.map((histogram: IHistogramCount) => ({
          ...histogram,
          type: "Running"
        })),
        ...completedHistogram.map((histogram: IHistogramCount) => ({
          ...histogram,
          type: "Completed"
        })),
        ...compensatedHistogram.map((histogram: IHistogramCount) => ({
          ...histogram,
          type: "Compensated"
        })),
        ...failedHistogram.map((histogram: IHistogramCount) => ({
          ...histogram,
          type: "Failed"
        }))
      ]);
    })();

    (async () => {
      setFalseEvents(await getFalseEvents(+dateRange[0], +dateRange[1]));
    })();

    (async () => {
      const tasksExecutionTime = await getTaskExecuteime(
        +dateRange[0],
        +dateRange[1]
      );
      const tasksExecutionStatisticsData = R.values(
        R.groupBy(R.pathOr("", ["taskName"]), tasksExecutionTime)
      ).map(
        (taskExecutionTime: ITaskExecutionTime[]): IBoxChartRow => {
          const executionTimes: number[] = taskExecutionTime.map(
            R.pathOr(0, ["executionTime"])
          );
          return {
            x: taskExecutionTime[0].taskName,
            high: max(executionTimes),
            low: min(executionTimes),
            median: median(executionTimes),
            q1: quantile(executionTimes, 0.2),
            q3: quantile(executionTimes, 0.8)
          };
        }
      );
      settasksExecutionStatistics(
        new DataSet.DataView().source(tasksExecutionStatisticsData).transform({
          type: "map",
          callback: (obj: IBoxChartRow & any) => {
            obj.range = [obj.low, obj.q1, obj.median, obj.q3, obj.high];
            return obj;
          }
        })
      );
    })();
  }, [dateRange]);

  return (
    <Container>
      <DateRangePicker />
      <Section>
        <Title level={4}>Transaction Hourly Histogram</Title>
        <Chart height={400} forceFit scale={scale} data={transactionHistogram}>
          <Legend />
          <Tooltip />
          <Axis name="date" />
          <Axis name="count" />
          <Geom type="line" position="date*count" size={2} color="type" />
        </Chart>
      </Section>

      {tasksExecutionStatistics && (
        <Section>
          <Title level={4}>Task Execution times</Title>
          <Chart height={700} data={tasksExecutionStatistics} forceFit>
            <Axis name="x" />
            <Tooltip
              showTitle={false}
              crosshairs={{
                type: "rect"
              }}
            />
            <Geom
              type="schema"
              position="x*range"
              shape="box"
              style={
                {
                  stroke: "#545454",
                  fill: "#1890FF",
                  fillOpacity: 0.3
                } as object
              }
            />
          </Chart>
        </Section>
      )}
      <Section>
        <Title level={4}>False Events</Title>
        <EventTable
          events={falseEvents}
          columns={[
            "DETAILS",
            "TRANSACTION_ID",
            "EVENT_TYPE",
            "ERROR",
            "DETAILS_ID",
            "DETAILS_STATUS",
            "TIME"
          ]}
        />
      </Section>
    </Container>
  );
};
