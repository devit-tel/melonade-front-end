// @ts-ignore
import * as DataSet from "@antv/data-set";
import { Event, State } from "@melonade/melonade-declaration";
import { Typography } from "antd";
import { Axis, Chart, Geom, Tooltip } from "bizcharts";
import moment from "moment";
import * as R from "ramda";
import React from "react";
import { max, median, min, quantile } from "simple-statistics";
import styled from "styled-components";
import EventTable from "../../components/EventTable";
import {
  getFalseEvents,
  getWeeklyTaskExecuteTime,
  getWeeklyTransactionsByStatus
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

const Container = styled.div``;

const Section = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 12px;

  & + & {
    margin-top: 12px;
  }
`;

const fillUpWeeklyTransaction = new Array(7 * 24)
  .fill(null)
  .map((_value: any, index: number) => ({
    count: 0,
    weekday: index % 7,
    hour: Math.floor(index / 7)
  }));

const weekdayString = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

interface IWeeklyTransactionChartData {
  count: number;
  weekday: number;
  hour: number;
}

export interface ITaskExecutionTime {
  executionTime: number;
  taskName: string;
}

interface IProps {}

interface IState {
  falseEvents: Event.AllEvent[];
  tasksExecutionStatistics?: DataSet.DataView;
  weeklyTransactionData: IWeeklyTransactionChartData[];
  isLoading: boolean;
}

export default class Dashboard extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      falseEvents: [],
      weeklyTransactionData: [],
      isLoading: false
    };
  }

  getData = async () => {
    this.setState({ isLoading: true });
    try {
      const startOfWeek = +moment().startOf("week");
      const endOfWeek = +moment().endOf("week");

      const [startedTransaction, tasksExecutionTime, falseEvents]: [
        any[],
        ITaskExecutionTime[],
        Event.AllEvent[]
      ] = await Promise.all([
        getWeeklyTransactionsByStatus(
          startOfWeek,
          endOfWeek,
          State.TransactionStates.Running
        ),
        getWeeklyTaskExecuteTime(startOfWeek, endOfWeek),
        getFalseEvents(startOfWeek, endOfWeek)
      ]);

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

      const tasksExecutionStatistics = new DataSet.DataView()
        .source(tasksExecutionStatisticsData)
        .transform({
          type: "map",
          callback: (obj: IBoxChartRow & any) => {
            obj.range = [obj.low, obj.q1, obj.median, obj.q3, obj.high];
            return obj;
          }
        });

      const weeklyTransactionData = startedTransaction.map(
        (data: any): IWeeklyTransactionChartData => {
          const date = moment(data.date);
          return {
            count: data.count,
            hour: date.hour(),
            weekday: date.weekday()
          };
        }
      );
      this.setState({
        isLoading: false,
        tasksExecutionStatistics,
        falseEvents,
        weeklyTransactionData: [
          ...fillUpWeeklyTransaction,
          ...weeklyTransactionData
        ]
      });
    } catch (error) {
      this.setState({ isLoading: false });
    }
  };

  componentDidMount = async () => {
    this.getData();
  };

  render() {
    const {
      weeklyTransactionData,
      tasksExecutionStatistics,
      falseEvents
    } = this.state;
    return (
      <Container>
        <Section>
          <Title level={4}>Transaction started</Title>
          <Chart
            height={400}
            data={weeklyTransactionData}
            forceFit
            padding={[20, 60, 40, 100]}
            scale={{
              hour: {
                min: 0,
                max: 23,
                tickInterval: 1,
                tickCount: 24
              },
              weekday: {
                min: 0,
                max: 6,
                tickInterval: 1,
                tickCount: 7
              }
            }}
          >
            <Axis
              name="weekday"
              label={{
                formatter: (weekday: any): string =>
                  weekdayString[weekday] || "-"
              }}
            />
            <Axis name="hour" />
            <Tooltip showTitle={false} />
            <Geom
              type="point"
              position="hour*weekday"
              size={["count", [2, (window.innerWidth - 120) / 48]]}
              shape="circle"
              color={"#49BEAA"}
            />
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
          <EventTable events={falseEvents} />
        </Section>
      </Container>
    );
  }
}
