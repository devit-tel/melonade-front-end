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
  getTaskExecuteTime,
  getTransactionDateHistogram,
  IHistogramCount,
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

function getInterval(values: any[], key: string, interval: number) {
  if (values.length < interval) return [];

  const num = Math.floor(values.length / interval);
  const ticks = [];

  for (let i = 0; i <= interval; i += 1) {
    if (i * num >= values.length) {
      ticks.push(values[values.length - 1][key]);
    } else {
      ticks.push(values[num * i][key]);
    }
  }

  return ticks;
}

export interface ITaskExecutionTime {
  executionTime: number;
  taskName: string;
  executedAt: number | Date | string;
}

interface IProps {}

const Dashboard = (props: IProps) => {
  const [dateRange] = useContext(DateRangeContext);
  const [transactionHistogram, setTransactionHistogram] = useState<
    IHistogramCount[]
  >([]);
  const [
    tasksExecutionStatistics,
    setTasksExecutionStatistics,
  ] = useState<DataSet.DataView>(new DataSet.DataView());
  const [
    tasksExecutionTimes,
    setTasksExecutionTimes,
  ] = useState<DataSet.DataView>(new DataSet.DataView());
  const [falseEvents, setFalseEvents] = useState<Event.AllEvent[]>([]);

  useEffect(() => {
    (async () => {
      const [
        startedHistogram,
        completedHistogram,
        compensatedHistogram,
        failedHistogram,
      ] = await Promise.all([
        getTransactionDateHistogram(+dateRange[0], +dateRange[1], [
          State.TransactionStates.Running,
        ]),
        getTransactionDateHistogram(+dateRange[0], +dateRange[1], [
          State.TransactionStates.Completed,
        ]),
        getTransactionDateHistogram(+dateRange[0], +dateRange[1], [
          State.TransactionStates.Compensated,
          State.TransactionStates.Cancelled,
        ]),
        getTransactionDateHistogram(+dateRange[0], +dateRange[1], [
          State.TransactionStates.Failed,
        ]),
      ]);

      setTransactionHistogram([
        ...startedHistogram.map((histogram: IHistogramCount) => ({
          ...histogram,
          type: "Started",
        })),
        ...completedHistogram.map((histogram: IHistogramCount) => ({
          ...histogram,
          type: "Completed",
        })),
        ...compensatedHistogram.map((histogram: IHistogramCount) => ({
          ...histogram,
          type: "Compensated",
        })),
        ...failedHistogram.map((histogram: IHistogramCount) => ({
          ...histogram,
          type: "Failed",
        })),
      ]);
    })();

    (async () => {
      setFalseEvents(await getFalseEvents(+dateRange[0], +dateRange[1]));
    })();

    (async () => {
      const tasksExecutionTime = await getTaskExecuteTime(
        +dateRange[0],
        +dateRange[1]
      );

      setTasksExecutionTimes(
        new DataSet.DataView().source(
          tasksExecutionTime.map((taskExecutionTime: ITaskExecutionTime) => ({
            ...taskExecutionTime,
            executedAt: +new Date(taskExecutionTime.executedAt),
          }))
        )
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
            q3: quantile(executionTimes, 0.8),
          };
        }
      );
      setTasksExecutionStatistics(
        new DataSet.DataView().source(tasksExecutionStatisticsData).transform({
          type: "map",
          callback: (obj: IBoxChartRow & any) => {
            obj.range = [obj.low, obj.q1, obj.median, obj.q3, obj.high];
            return obj;
          },
        })
      );
    })();
  }, [dateRange]);

  return (
    <Container>
      <DateRangePicker />
      <Section>
        <Title level={4}>Transaction Hourly Histogram</Title>
        <Chart
          height={400}
          forceFit
          scale={{
            date: {
              alias: "Date",
              formatter: (date: number) =>
                moment(date).format("YYYY/MM/DD HH:mm"),
              ticks: getInterval(transactionHistogram, "date", 5),
            },
            count: {
              alias: "Count",
            },
          }}
          data={transactionHistogram}
        >
          <Legend />
          <Tooltip />
          <Axis name="date" />
          <Axis name="count" />
          <Geom
            type="point"
            position="date*count"
            size={3}
            color="type"
            shape={"circle"}
          />
          <Geom
            type="line"
            position="date*count"
            size={2}
            color="type"
            shape={"smooth"}
          />
        </Chart>
      </Section>

      {tasksExecutionTimes && (
        <Section>
          <Title level={4}>Task Execution times (scatter plot)</Title>
          <Chart height={700} data={tasksExecutionTimes} forceFit>
            <Tooltip showTitle={false} />
            <Axis
              name="executedAt"
              label={{
                formatter: (value) => {
                  return moment(+value).format("YYYY/MM/DD HH:mm");
                },
              }}
            />
            <Axis name="executionTime" />
            <Legend />
            <Geom
              type="point"
              position="executedAt*executionTime"
              color={"taskName"}
              opacity={0.65}
              shape="circle"
              size={5}
              style={[
                "taskName",
                {
                  lineWidth: 1,
                  strokeOpacity: 1,
                  fillOpacity: 0.3,
                  opacity: 0.65,
                },
              ]}
            />
          </Chart>
        </Section>
      )}

      {tasksExecutionStatistics && (
        <Section>
          <Title level={4}>Task Execution times (box plot)</Title>
          <Chart height={700} data={tasksExecutionStatistics} forceFit>
            <Axis name="x" />
            <Tooltip
              showTitle={false}
              crosshairs={{
                type: "rect",
                style: {
                  fill: "#E4E8F1",
                  fillOpacity: 0.43,
                },
              }}
              itemTpl='<li data-index={index} style="margin-bottom:4px;"><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}<br/><span style="padding-left: 16px">Max：{high}ms</span><br/><span style="padding-left: 16px">Quantile top 20%：{q3}ms</span><br/><span style="padding-left: 16px">Median：{median}ms</span><br/><span style="padding-left: 16px">Quantile bottom 20%：{q1}ms</span><br/><span style="padding-left: 16px">Min：{low}ms</span><br/></li>'
            />

            <Geom
              type="schema"
              position="x*range"
              // @ts-ignore
              tooltip={[
                "x*low*q1*median*q3*high",
                (x, low, q1, median, q3, high) => {
                  return {
                    name: x,
                    low,
                    q1,
                    median,
                    q3,
                    high,
                  };
                },
              ]}
              shape="box"
              style={
                {
                  stroke: "#545454",
                  fill: "#1890FF",
                  fillOpacity: 0.3,
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
            "TIME",
          ]}
        />
      </Section>
    </Container>
  );
};

export default Dashboard;
