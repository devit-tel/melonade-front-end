// @ts-ignore
import * as DataSet from "@antv/data-set";
import { Event, State } from "@melonade/melonade-declaration";
import { Typography } from "antd";
import { Axis, Chart, Geom, Tooltip, View } from "bizcharts";
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
  const [
    startedTransactionHistogram,
    setStartedTransactionHistogram
  ] = useState<IHistogramCount[]>([]);
  const [tasksExecutionStatistics, settasksExecutionStatistics] = useState<
    DataSet.DataView
  >(new DataSet.DataView());
  const [falseEvents, setFalseEvents] = useState<Event.AllEvent[]>([]);

  useEffect(() => {
    (async () => {
      const startedTransactionHistogram = await getTransactionDateHistogram(
        +dateRange[0],
        +dateRange[1],
        State.TransactionStates.Running
      );
      setStartedTransactionHistogram(startedTransactionHistogram);
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
        <Title level={4}>Started Transaction</Title>
        <Chart
          height={400}
          forceFit
          padding={[20, 60, 40, 100]}
          scale={{
            date: {
              sync: true
            }
          }}
        >
          <Tooltip />
          <View data={startedTransactionHistogram} scale={scale}>
            <Axis name="date" />
            <Axis name="count" />
            <Tooltip
              crosshairs={{
                type: "y"
              }}
            />
            <Geom type="line" position="date*count" size={2} />
          </View>
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
